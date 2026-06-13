import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { MODELS } from "../constants";

// Helper to initialize GoogleGenAI with the required environment variable and User-Agent telemetry
const getAI = () => new GoogleGenAI({
  apiKey: process.env.API_KEY as string,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const getWellbeingPlan = async (budget: number, currency: string, girlfriendAround: boolean) => {
  const ai = getAI();
  const prompt = `Act as a Professional Nutritionist and Lifestyle Concierge.
  Current Monthly Food Budget: ${budget} ${currency}.
  Relationship Context: ${girlfriendAround ? "Girlfriend is around - Plan romantic fun and meals for 2." : "Solo mode - Focus on efficiency."}.

  Tasks:
  1. JUMIA BUDGET: Search for essential food prices on Jumia in ${currency}. List them in a Markdown table.
  2. MEAL GRID: Create a 7-day plan (Breakfast, Lunch, Dinner, Street Snack).
  3. CALORIES: Provide calories for every meal.
  4. WEEKEND: Suggest a random spot for drinks (Alcohol/Wine) and "Fun Time" activities.
  
  Use googleSearch to get REAL prices and REAL spot recommendations. Use Markdown. Return structured JSON.`;

  const response = await ai.models.generateContent({
    model: MODELS.GENERAL,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          monthlySuppliesMarkdown: { type: Type.STRING },
          timetable: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                breakfast: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } } },
                lunch: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } } },
                dinner: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } } },
                snack: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, calories: { type: Type.NUMBER } } }
              }
            }
          },
          weekendRecommendation: {
            type: Type.OBJECT,
            properties: {
              spotName: { type: Type.STRING },
              description: { type: Type.STRING },
              drinkIdea: { type: Type.STRING },
              funPlan: { type: Type.STRING }
            }
          }
        }
      }
    }
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = chunks.map((c: any) => c.web).filter(Boolean).map((w: any) => ({ uri: w.uri, title: w.title }));
  
  try {
    const data = JSON.parse(response.text || '{}');
    return { data, urls };
  } catch (e) {
    return { data: {}, urls };
  }
};

/**
 * Unified Chat Function - Senior Wall Street Strategist Intelligence
 */
export const getUnifiedChatResponse = async (history: any[], systemInstruction: string) => {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX,
    contents: history,
    config: {
      systemInstruction: systemInstruction + ` 
      
      CORE ENGINE ARCHITECTURE - FABLE 5 CORE MODE:
      Your intelligence is calibrated to emulate the Claude Fable 5 engine:
      1. Display pristine intellectual depth, extreme articulacy, and rigorous professional structures.
      2. Begin complex replies with a brief cognitive outline or reasoning preview.
      3. Use clear, nested bullet points and beautifully balanced markdown layout to prevent textual fatigue.
      4. Maintain a highly direct, realistic, and objective perspective on risk vs reward. No soft clichés, no repetitive promotional summaries.
      5. Sound like an elite quantitative trader and system strategist who speaks with total composure, exceptional detail, and deep context.`,
      thinkingConfig: { thinkingBudget: 24000 },
      tools: [{ googleSearch: {} }] 
    }
  });

  const text = response.text || "";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = chunks.map((c: any) => c.web).filter(Boolean).map((w: any) => ({ uri: w.uri, title: w.title }));

  const isSniper = (text.toLowerCase().includes("sniper") || text.includes("🎯") || text.toLowerCase().includes("high conviction")) && 
                   (text.toLowerCase().includes("smt") || text.toLowerCase().includes("displacement") || text.toLowerCase().includes("purge") || text.toLowerCase().includes("sweep"));

  return {
    text,
    isSniper,
    groundingUrls: urls
  };
};

/**
 * Predictor Service - Institutional Grade Forecasting
 */
export const getPredictionResponse = async (query: string) => {
  const ai = getAI();
  const now = new Date();
  
  const systemInstruction = `You are the Nova Oracle, an elite institutional-grade forecasting engine.
  MANDATE: 99% analytical precision and capital preservation.
  Current Date: ${now.toDateString()}.

  Your analysis MUST follow this rigorous audit protocol:
  1. **LATEST INTEL**: Use googleSearch to find the absolute latest news (injuries, suspensions, lineup leaks, coaching changes).
  2. **STATISTICAL AUDIT**: Analyze head-to-head, recent form, xG (expected goals), and home/away performance.
  3. **PSYCHOLOGICAL FACTOR**: Evaluate team morale, pressure, and historical rivalry dynamics.
  4. **MARKET SENTIMENT**: Check betting odds movement to identify where the "smart money" is flowing.
  5. **VERDICT**: Provide a definitive prediction with a **CONFIDENCE SCORE (0-100%)** and a **RISK ASSESSMENT**.

  If a match is too volatile or unpredictable, explicitly advise to STAY FLAT.
  
  RESPONSE FORMAT:
  - **MATCH AUDIT**: [Detailed analysis of latest news & stats]
  - **TACTICAL OUTLOOK**: [How the match will play out]
  - **VERDICT**: [Definitive Prediction / Correct Score]
  - **CONFIDENCE**: [X/100]
  - **RISK**: [Low/Medium/High/Extreme]`;

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX,
    contents: query,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 32000 }, 
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = chunks.map((c: any) => c.web).filter(Boolean).map((w: any) => ({ uri: w.uri, title: w.title }));

  return { text, urls };
};

/**
 * Batch Predictor Service - High Volume Strategy
 */
export const getBatchPredictionResponse = async (images: File[]) => {
  const ai = getAI();
  const now = new Date();
  
  const imageParts = await Promise.all(images.map(async (img) => {
    const b64 = await fileToBase64(img);
    return { inlineData: { data: b64, mimeType: img.type } };
  }));

  const systemInstruction = `You are the Nova Oracle Batch Engine. 
  MANDATE: Identify the top 10 highest-conviction football correct scores from the provided fixtures.
  Date: ${now.toDateString()}.

  AUDIT PROTOCOL:
  - Scan all fixtures in the images.
  - Use googleSearch to verify current squad status for each match.
  - Filter out any matches with high volatility or missing key data.
  - Rank the remaining by confidence.

  OUTPUT: A ranked list of the top 10 predictions with logic for each.`;

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX,
    contents: {
      parts: [
        ...imageParts,
        { text: "Perform a deep institutional audit on these fixtures and pick the top 10 highest-conviction outcomes." }
      ]
    },
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 48000 }, 
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = chunks.map((c: any) => c.web).filter(Boolean).map((w: any) => ({ uri: w.uri, title: w.title }));

  return { text, urls };
};

export const getThinkingAdvice = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX,
    contents: query,
    config: { thinkingConfig: { thinkingBudget: 10000 } }
  });
  return response.text || "";
};

export const getStudyAssistance = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX,
    contents: `You are Nova Scholar. Solve: ${query}.`,
    config: { thinkingConfig: { thinkingBudget: 4000 } }
  });
  return response.text || "";
};

export const getFinancialReport = async (transactions: any[], wallets: any[], currency: string) => {
  const ai = getAI();
  const prompt = `Financial Audit for ${currency}. Data: ${JSON.stringify({ transactions, wallets })}. Report with **bold** highlights.`;
  const response = await ai.models.generateContent({ 
    model: MODELS.COMPLEX, 
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 10000 } }
  });
  return response.text || "";
};

export const getFastResponse = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({ 
    model: MODELS.FAST, 
    contents: prompt 
  });
  return response.text || "";
};

export const getSearchResponse = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.GENERAL,
    contents: prompt,
    config: { tools: [{ googleSearch: {} }] }
  });
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = chunks.map((c: any) => c.web).filter(Boolean).map((w: any) => ({ uri: w.uri, title: w.title }));
  return { text: response.text || "", urls };
};

export const getForexNewsAlerts = async () => {
  const ai = getAI();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  
  const prompt = `FAST SEARCH: Today/Tomorrow high-impact "red folder" forex economic events for ${dateStr}. Return a JSON array of objects with fields: id, event, impact (High/Medium/Low), assets (e.g. ["USD", "EUR"]), signal, logic, timestamp. Wrap it in a root object called "alerts".`;

  const response = await ai.models.generateContent({
    model: MODELS.GENERAL,
    contents: prompt,
    config: { 
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });
  
  try {
    const data = JSON.parse(response.text || '{"alerts": []}');
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = chunks.map((c: any) => c.web).filter(Boolean).map((w: any) => ({ uri: w.uri, title: w.title }));
    return { alerts: data.alerts || [], urls };
  } catch (e) {
    return { alerts: [], urls: [] };
  }
};

export const getMapsAdvice = async (query: string, location?: { lat: number; lng: number }) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.MAPS,
    contents: query,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: location ? { retrievalConfig: { latLng: { latitude: location.lat, longitude: location.lng } } } : undefined
    }
  });
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = chunks.map((c: any) => c.maps).filter(Boolean).map((m: any) => ({ uri: m.uri, title: m.title }));
  return { text: response.text || "", urls };
};

export const analyzeMedia = async (file: File, prompt: string, mimeType: string) => {
  const ai = getAI();
  const base64 = await fileToBase64(file);
  const response = await ai.models.generateContent({
    model: MODELS.GENERAL,
    contents: {
      parts: [
        { inlineData: { data: base64, mimeType } },
        { text: prompt + " Be brief and fast." }
      ]
    }
  });
  return response.text || "";
};

export const getIntimacyAdvice = async (history: any[]) => {
  const ai = getAI();
  const systemInstruction = `You are the Nova Intimacy Expert, a world-class specialist in sexual health, relationship intimacy, and pleasure.
  
  MANDATE: Provide respectful, educational, and highly effective advice on intimacy, foreplay, and sexual techniques.
  
  Focus on:
  - **Communication**: Emphasize the importance of consent and talking to the partner.
  - **Foreplay**: Provide detailed, sensory-focused techniques to build arousal.
  - **Technique**: Offer practical, safe, and pleasurable advice for various sexual activities.
  - **Emotional Connection**: Explain how emotional safety enhances physical pleasure.
  
  Tone: Professional, empathetic, and sex-positive. Avoid explicit or pornographic language; use anatomical and clinical terms where appropriate but keep it accessible.
  
  If asked for something unsafe or non-consensual, decline and explain why.`;

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX,
    contents: history,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 10000 }
    }
  });

  return response.text || "";
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result?.toString().split(',')[1] || "");
    reader.onerror = e => reject(e);
  });
};

export function decodeBase64(base64: string) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function encodeBase64(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const d16 = new Int16Array(data.buffer);
  const fCount = d16.length / numChannels;
  const buf = ctx.createBuffer(numChannels, fCount, sampleRate);
  for (let c = 0; c < numChannels; c++) {
    const cData = buf.getChannelData(c);
    for (let i = 0; i < fCount; i++) cData[i] = d16[i * numChannels + c] / 32768.0;
  }
  return buf;
}

/**
 * Live Tech Opportunities & Hackathons Service
 */
export const getTechOpportunities = async () => {
  const ai = getAI();
  const now = new Date();
  
  const systemInstruction = `You are Fable 5, an elite intelligence specializing in tech ecosystems, startup accelerators, and competitive hackathons.
  MANDATE: Perform real-time web research to secure active, premium, upcoming (not expired) tech events, hackathons (e.g., Major League Hacking, Devpost, regional builder events), and startup applications (e.g., Y Combinator, Techstars, specialized VCs, accelerators) accepting submissions right now.
  Current Date: ${now.toDateString()}.`;

  const query = `Find 6 premium, highly beneficial, active opportunities accepting entries after ${now.toDateString()} (Tech events, Hackathons, and Startup Accelerator applications).
  Use search tools to gather exactly 6 active ones.
  
  For each entry, provide:
  - id: A short unique identifier (string)
  - title: Official Name
  - type: Must be exactly "Hackathon", "Startup Application", or "Tech Event"
  - description: A short, strategic, highly inspiring description recommending the builder why to apply
  - deadline: Submission/registration close date (formatted as YYYY-MM-DD)
  - link: Exact official web link
  - location: Venue City & Country, or "Online", "Remote"
  - benefits: Concrete prizes, cash awards, funding amount, or key mentorship access.

  Return the results in valid JSON matching this schema:
  {
    "opportunities": [
      {
        "id": "yc-2026",
        "title": "Y Combinator Summer 2026 Batch",
        "type": "Startup Application",
        "description": "The world's premier startup accelerator program. Apply for funding, world-class network, and unparalleled mentorship.",
        "deadline": "2026-06-25",
        "link": "https://www.ycombinator.com/apply",
        "location": "San Francisco, CA / Remote",
        "benefits": "$500,000 standard investment & mentorship"
      }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: MODELS.GENERAL, // Using general model (gemini-3.5-flash as default)
    contents: query,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  const rawJson = (response.text || "").trim();
  try {
    return JSON.parse(rawJson);
  } catch (e) {
    console.error("Failed parsing opportunities JSON directly. Using regex fallback.", e);
    const match = rawJson.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        throw new Error("Invalid response format received from Opps Engine: " + rawJson);
      }
    }
    throw e;
  }
};

/**
 * Startup Validator Board Service
 * Emulates three elite multi-millionaire, 20+ years tech and accelerator veterans.
 */
export const validateStartupIdea = async (idea: string, industry: string) => {
  const ai = getAI();
  const now = new Date();

  const systemInstruction = `You are Fable 5, the core intelligence orchestrating an Elite Multi-Millionaire Advisory Board for startup founders.
  Your task is to comprehensively audit, score, and challenge a user's startup idea. You MUST emulate three distinct, highly experienced (20+ years) serial entrepreneurs / investors:

  1. **Marcus Sterling (SaaS Serial Founder)**: $200M+ tech scale exits. Hyper-focused on unit economics (LTV/CAC ratio), market sizing, pricing parameters, and direct distribution lines.
  2. **Dr. Elena Vance (Deep-Tech Architect)**: MIT PhD co-founder, exited $35M hardware/AI pivots. Hyper-focused on engineering feasibility, product defensibility, and building a sustainable tech moat.
  3. **Akira Tanaka (Accelerator Venture Partner)**: Elite incubator General Partner backer of 200+ portfolio companies. Evaluates exact accelerator interests (e.g. Y Combinator, Techstars thresholds), user acquisition speed, and pitching mechanics.

  YOUR MANDATE:
  - Do NOT speak in flat clichés. Give aggressive, candid, and constructive feedback from these personas.
  - Perform real-time web research using googleSearch to find actual competitors in this space, what they are currently raised on, and point out active accelerators that might back this specific vertical.
  - Cross-reference all elements for target user matches and strategic entry points.

  Return results strictly in valid JSON matching this schema:
  {
    "rating": 84, // Combined average out of 100
    "summary": "High-level board synthesis of the idea...",
    "targetUsers": [
      { "segment": "Target niche", "reason": "Why they need this", "urgency": "High" }
    ],
    "strongPoints": ["Defensible proprietary data", "High recurring potential"],
    "competitors": [
      { "name": "Competitor Name", "moat": "Strategic differentiator to beat them" }
    ],
    "acceleratorAlignment": [
      { "name": "Y Combinator (example)", "interestLevel": "High", "reason": "Why this matches their focus area" }
    ],
    "advisors": [
      {
        "name": "Marcus Sterling",
        "rating": 85,
        "feedback": "Your GTM strategy has one main vulnerability...",
        "verdict": "Venture Scale Viable with Pricing Pivot"
      },
      {
        "name": "Dr. Elena Vance",
        "rating": 78,
        "feedback": "An API wrapper won't survive. To build a true moat...",
        "verdict": "Technically Feasible but Requires IP Defensibility"
      },
      {
        "name": "Akira Tanaka",
        "rating": 88,
        "feedback": "YC is currently backing heavy infrastructure in this space. Your pitch should highlight...",
        "verdict": "High-Priority Application Target"
      }
    ]
  }`;

  const query = `Analyze the following startup idea in-depth.
  Idea: "${idea}"
  Category/Industry: "${industry}"

  Use search tools to gather actual competitors established in 2024-2026 and list accelerators interested in this space.`;

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX, 
    contents: query,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  const rawJson = (response.text || "").trim();
  try {
    return JSON.parse(rawJson);
  } catch (e) {
    console.error("Failed parsing validation JSON directly. Fallback to regex.", e);
    const match = rawJson.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        throw new Error("Invalid response format from validation board: " + rawJson);
      }
    }
    throw e;
  }
};

/**
 * In-depth GitHub Code repo auditor
 * Gathers repo details, directory paths, and specific imported code files to audit architecture, quality, and defects.
 */
export const auditGithubRepo = async (repoUrl: string, filePaths: string[], fileSnippets: { path: string; content: string }[]) => {
  const ai = getAI();

  const systemInstruction = `You are Fable 5, an Elite Technical Architect and Security Auditor who has reviewed systems with multi-million line codebases.
  Your task is to comprehensively audit a user's GitHub repository. You examine file arrays, folder structures, and specific source code snippets provided.
  
  MANDATE: Output high-fidelity technical advice. Identify structural anomalies, architectural gaps, security issues (e.g., hardcoded keys, SQL injection vectors, weak auth, CORS flaws), code cleanliness, and resource usage efficiency.
  
  You MUST specifically evaluate security against OWASP Top 10 vulnerabilities, construct an interactive system flow chart of the components, and provide a simulated concurrency speed performance benchmark.

  Return results strictly in valid JSON matching this schema:
  {
    "overallRating": 85, // Scale 1-100
    "summary": "High-level visual summary of the architecture and primary recommendations...",
    "stats": {
      "securityFlaws": 2, // Integer number of key problems identified
      "codeSmells": 4, // Integer number of smells
      "architecturalGaps": 1 // Integer number of gaps
    },
    "architectureScore": 88, // out of 100
    "securityScore": 92, // out of 100
    "qualityScore": 80, // out of 100
    "keyFindings": [
      {
        "title": "Hardcoded AWS Config Secret Keys",
        "severity": "CRITICAL", // CRITICAL, HIGH, MEDIUM, LOW
        "type": "Security", // Security, Performance, Cleanliness, Architecture
        "location": "/src/config/aws.ts",
        "description": "Exposing keys inside file codebases allows malicious crawler indexing.",
        "remediation": "Leverage process.env with encrypted environment values."
      }
    ],
    "optimizationSteps": [
      "Implement lazy-rendered components using React.lazy to reduce initial chunk overhead.",
      "Consolidate state trackers from main panels into central stores."
    ],
    "architectureDiagramDescription": "Detailed representation explaining how data flows through the detected components...",
    "owaspCompliance": [
      {
        "category": "A01:2021-Broken Access Control",
        "status": "COMPLIANT", // COMPLIANT, WARNING, NON_COMPLIANT, CRITICAL_RISK
        "description": "Validation checks on user privilege layers, path routing access controls, and endpoint ownership checks.",
        "findings": "Strict auth tokens checked on API handlers. No unverified permissions noted. Staging routes are correctly locked.",
        "remediationCode": "Ensure state routes verify roles on the server side on every CRUD call."
      },
      {
        "category": "A03:2021-Injection Vectors",
        "status": "WARNING",
        "description": "Checks for SQL/NoSQL injections, path traversal parameters, and unescaped shell executing strings.",
        "findings": "Dynamic database query parameters found in local handlers. High risk of raw injection if values bypass sanitizers.",
        "remediationCode": "Use prepared SQL statements or fully escaped queries via safe ORMs like Prisma or Drizzle."
      }
    ],
    "systemFlowChart": {
      "nodes": [
        { "id": "client", "label": "Vite React Client UI", "type": "client", "details": "Renders modular panels, monitors local states, and interfaces with APIs." },
        { "id": "router", "label": "Client Router Map", "type": "client", "details": "Handles custom routes transitions and layout views." },
        { "id": "server", "label": "Express Node.js Server", "type": "server", "details": "Runs API gate controls, requests rate limits, and marshals static bundles." }
      ],
      "edges": [
        { "from": "client", "to": "router", "label": "User Interaction Paths" },
        { "from": "router", "to": "server", "label": "Secured Async API Call" }
      ]
    },
    "concurrencySpeedAnalysis": [
      { "concurrentUsers": 10, "responseTimeMs": 115, "errorRatePercent": 0.0, "resourceUtilizationPercent": 12 },
      { "concurrentUsers": 50, "responseTimeMs": 142, "errorRatePercent": 0.0, "resourceUtilizationPercent": 24 },
      { "concurrentUsers": 100, "responseTimeMs": 185, "errorRatePercent": 0.1, "resourceUtilizationPercent": 38 },
      { "concurrentUsers": 250, "responseTimeMs": 290, "errorRatePercent": 0.5, "resourceUtilizationPercent": 55 },
      { "concurrentUsers": 500, "responseTimeMs": 480, "errorRatePercent": 1.2, "resourceUtilizationPercent": 78 },
      { "concurrentUsers": 1000, "responseTimeMs": 950, "errorRatePercent": 4.5, "resourceUtilizationPercent": 94 }
    ]
  }`;

  const query = `Audit the following GitHub repository:
  Repository URL: ${repoUrl}
  Detected Files inside Project: ${JSON.stringify(filePaths.slice(0, 300))}
  
  Selected Code Snippets Content for Deep Audit:
  ${fileSnippets.map(f => `FILE: ${f.path}\n\`\`\`\n${f.content.slice(0, 3000)}\n\`\`\``).join("\n\n")}
  
  Examine everything carefully and compile a rigorous structured JSON audit.`;

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX, 
    contents: query,
    config: {
      systemInstruction,
      responseMimeType: "application/json"
    }
  });

  const rawJson = (response.text || "").trim();
  try {
    return JSON.parse(rawJson);
  } catch (e) {
    console.error("Failed parsing GitHub audit JSON directly.", e);
    const match = rawJson.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        throw new Error("Invalid response format from GitHub auditor: " + rawJson);
      }
    }
    throw e;
  }
};

/**
 * Deployed Website QA Testing Agent
 * Acts as an agentic browser, inspects live URL content using search grounding, and compiles detailed user-journey QA reviews.
 */
export const auditDeployedWebsite = async (siteUrl: string, customContext?: string) => {
  const ai = getAI();

  const systemInstruction = `You are Fable 5, an Elite QA Testing Agent and Lead Automation Engineer. 
  Your task is to take a deployed web link and "taste/test" its components, routing, look-and-feel, accessibility levels, and functionality.

  MANDATE:
  - Perform real-time web research / search grounding on ${siteUrl} to locate actual information of the targeted site, including active titles, tags, headings, meta tags, and functional patterns.
  - Review how a user signs up, logs in, manages forms, handles interactive states, and navigates.
  - Grade the experience across UI/UX, Functionality, Security, and Speed, and pinpoint exactly what can go wrong.
  - Sound like an elite browser-automation specialist who has audited thousands of web applications.

  If a CODEBASE CONTEXT / PROJECT BLUEPRINT is provided in the instructions, you MUST prioritize understanding what the site is supposed to do from its code structure, and design 3 tailored user journey simulations.

  For each journey in "userJourneySimulations", you must provide both sequential automation "logs" AND a corresponding parallel "snapshots" array of the SAME LENGTH (matching 1-to-1) that visualizes what is happening in the site's viewport at that specific progress step.

  Return results strictly in valid JSON matching this schema:
  {
    "siteTitle": "Official Website Title",
    "overallHealth": 88, // out of 100
    "techStackDetected": ["React", "Tailwind CSS", "Vite", "Cloudflare"],
    "inspectedRoutes": [
      { "path": "/", "status": "200 OK", "type": "Main Hero & Features Showcase" },
      { "path": "/login", "status": "200 OK", "type": "Authentication Portal" }
    ],
    "uxRating": 90, // out of 100
    "functionalityRating": 84, // out of 100
    "securityRating": 80, // out of 100
    "performanceRating": 85, // out of 100
    "userJourneySimulations": [
      {
        "flowName": "User Registration & Login Verification",
        "description": "Simulated loading the /signup page, entering credentials, submitting forms, and cookie generation.",
        "status": "PASS", // PASS, WARNING, FAIL
        "logs": [
          "GET ${siteUrl}/signup - Status 200",
          "Found input field name='email', name='password', type='submit'",
          "Form submission executed with mock assets",
          "Verification check completed successfully"
        ],
        "snapshots": [
          {
            "stepIndex": 0,
            "title": "Register Portal Viewport",
            "route": "/signup",
            "mockLayoutType": "login", // Options: "landing", "login", "dashboard", "api", "list", "settings", "checkout", "error"
            "explanation": "Viewport shows initial signup fields and verification triggers. System responds in 110ms.",
            "interactiveElements": [
              { "label": "Email Target", "value": "admin@test-vanguard.io", "type": "input" },
              { "label": "PassPhrase", "value": "••••••••", "type": "input" },
              { "label": "Register button", "value": "SUBMIT", "type": "button" }
            ]
          },
          {
            "stepIndex": 1,
            "title": "Active Form Inputs Focus",
            "route": "/signup",
            "mockLayoutType": "login",
            "explanation": "System detects keyboard typing triggers properly with no accessibility blocks.",
            "interactiveElements": [
              { "label": "Typed Email", "value": "admin@test-vanguard.io", "type": "input" },
              { "label": "Submit triggers", "value": "ACTIVE", "type": "badge" }
            ]
          },
          {
            "stepIndex": 2,
            "title": "Executing Form Submits Gate",
            "route": "/signup",
            "mockLayoutType": "checkout",
            "explanation": "Form data is verified, sanitization checks evaluated, and response is returned successfully.",
            "interactiveElements": [
              { "label": "CORS preflight checks", "value": "COMPLIANT", "type": "badge" },
              { "label": "Encryption token", "value": "VANGUARD_SECURED", "type": "text" }
            ]
          },
          {
            "stepIndex": 3,
            "title": "Authentication Cookies Configured",
            "route": "/dashboard",
            "mockLayoutType": "dashboard",
            "explanation": "Client context is updated. Cookie active state is verified correctly.",
            "interactiveElements": [
              { "label": "Active user ID", "value": "0x4012A", "type": "text" },
              { "label": "Session verification", "value": "PASS", "type": "badge" }
            ]
          }
        ]
      }
    ],
    "problemsIdentified": [
      {
        "issue": "Missing input safety labels on login textboxes",
        "impact": "Low-vision screen readers cannot recognize input target focuses safely.",
        "severity": "Medium", // High, Medium, Low
        "remediationCode": "<input id='email' name='email' aria-label='Your Email Address' />"
      }
    ],
    "exceptionalFeatures": [
      "Beautiful typography pairings and responsive fluid grids.",
      "Blazing-fast responsive page loads with lazy-assets."
    ]
  }`;

  const query = `Analyze and taste the deployed website:
  Site URL to inspect: ${siteUrl}
  Optional instructions/context: ${customContext || "None specified"}

  Use search tools to retrieve contents, pages, header configurations, and visual outline parameters. Construct a deep QA audit based on the live data retrieved. Ensure each userJourneySimulations log step corresponds exactly to a structured visual snapshot.`;

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX, 
    contents: query,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json"
    }
  });

  const rawJson = (response.text || "").trim();
  try {
    return JSON.parse(rawJson);
  } catch (e) {
    console.error("Failed parsing website audit JSON directly.", e);
    const match = rawJson.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) {
        throw new Error("Invalid response format from live website auditor: " + rawJson);
      }
    }
    throw e;
  }
};
