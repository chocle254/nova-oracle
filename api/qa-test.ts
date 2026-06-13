
import chromium from "@sparticuz/chromium";
import { chromium as playwright, type Browser } from "playwright-core";
import { GoogleGenAI } from "@google/genai";

// Vercel serverless config — Playwright needs the Node runtime, not edge.
export const config = { maxDuration: 60 };

// Routes attempted on top of "/". Unreachable ones are skipped.
const CANDIDATE_ROUTES = ["/", "/login", "/signup", "/dashboard", "/pricing", "/about", "/contact"];

async function launch(): Promise<Browser> {
  if (process.env.NODE_ENV === "development") {
    // Local dev uses your installed Chrome via playwright-core.
    return playwright.launch({ headless: true });
  }
  return playwright.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true,
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { siteUrl, customContext } = req.body ?? {};
  if (!siteUrl || !/^https?:\/\//.test(siteUrl)) {
    return res.status(400).json({ error: "A valid http(s) siteUrl is required" });
  }

  let browser: Browser | null = null;
  try {
    browser = await launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    const base = new URL(siteUrl);
    const visited: any[] = [];
    const snapshots: any[] = [];

    for (const route of CANDIDATE_ROUTES) {
      const target = new URL(route, base).toString();
      const start = Date.now();
      try {
        const resp = await page.goto(target, { waitUntil: "networkidle", timeout: 15000 });
        const status = resp?.status() ?? 0;
        if (status >= 400) continue; // skip missing routes

        // Real DOM probe — grounds the report in what's actually on the page.
        const probe = await page.evaluate(() => ({
          title: document.title,
          headings: Array.from(document.querySelectorAll("h1,h2"))
            .slice(0, 6)
            .map((h) => h.textContent?.trim() || ""),
          inputs: Array.from(document.querySelectorAll("input,textarea,select")).map((i) => ({
            type: (i as HTMLInputElement).type || i.tagName.toLowerCase(),
            name: (i as HTMLInputElement).name || (i as HTMLInputElement).id || "",
          })),
          buttons: Array.from(document.querySelectorAll("button,[role=button]"))
            .slice(0, 10)
            .map((b) => b.textContent?.trim() || ""),
          links: Array.from(document.querySelectorAll("a[href]")).length,
          imagesMissingAlt: Array.from(document.querySelectorAll("img:not([alt])")).length,
        }));

        const shot = await page.screenshot({ type: "png", fullPage: false });
        visited.push({ path: route, status: `${status} OK`, loadMs: Date.now() - start, ...probe });
        snapshots.push({
          route,
          title: probe.title || route,
          screenshot: `data:image/png;base64,${shot.toString("base64")}`,
          probe,
        });
      } catch {
        // route unreachable / timed out — skip it
      }
    }

    if (snapshots.length === 0) {
      return res.status(502).json({ error: "Could not load any pages of the site." });
    }

    // Hand the REAL screenshots + DOM facts to Gemini vision for the verdict.
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
    const imageParts = snapshots.map((s) => ({
      inlineData: { mimeType: "image/png", data: s.screenshot.split(",")[1] },
    }));

    const analysis = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an elite QA engineer. You are given REAL screenshots and REAL extracted DOM facts from a live site${
                customContext ? `, plus this project context:\n${customContext}` : ""
              }.
Base every statement ONLY on the evidence provided — do NOT invent routes, fields, or metrics.
DOM facts (JSON): ${JSON.stringify(visited)}

Return ONLY valid JSON:
{
  "siteTitle": "",
  "overallHealth": 0,
  "techStackDetected": [],
  "uxRating": 0,
  "functionalityRating": 0,
  "securityRating": 0,
  "performanceRating": 0,
  "findings": [
    { "severity": "CRITICAL|HIGH|MEDIUM|LOW", "area": "", "observation": "", "recommendation": "" }
  ]
}`,
            },
            ...imageParts,
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });

    const raw = (analysis.text || "{}").trim();
    let verdict: any = {};
    try {
      verdict = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      verdict = match ? JSON.parse(match[0]) : {};
    }

    return res.status(200).json({
      ...verdict,
      // Real routes that were actually reachable, with measured load times.
      inspectedRoutes: visited.map((v) => ({ path: v.path, status: v.status, loadMs: v.loadMs })),
      // Real screenshots, 1-to-1 with what was actually captured.
      snapshots: snapshots.map((s, i) => ({ stepIndex: i, ...s })),
    });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "Unexpected QA error" });
  } finally {
    if (browser) await browser.close();
  }
}
