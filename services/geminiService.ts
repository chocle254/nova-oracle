
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { MODELS } from "../constants";

// Helper to initialize GoogleGenAI with the required environment variable
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY as string });

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
 * Specializing in Institutional Order Flow, ICT, SMT, and Macro Grounding.
 */
export const getUnifiedChatResponse = async (history: any[], systemInstruction: string) => {
  const ai = getAI();
  
  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX,
    contents: history,
    config: {
      systemInstruction: systemInstruction + ` 
      MANDATE: ACT AS A SENIOR WALL STREET STRATEGIST & INSTITUTIONAL ASSET MANAGER.
      
      Your goal is to provide institutional-grade analysis with 90%+ confidence before issuing a trade signal. You are elite, professional, and protective of capital.
      
      HIGH-CONVICTION ANALYSIS PROTOCOL (MANDATORY):
      1. MACRO SENTIMENT AUDIT: Always use Google Search to check the Economic Calendar (ForexFactory/Bloomberg) for high-impact "Red Folder" news (CPI, FOMC, NFP). Do NOT recommend trades 30 mins before/after these events.
      2. REAL-TIME PRICE SYNC: Search for the LATEST price of the asset (e.g., XAUUSD live price) and compare it with the user's provided chart or context.
      3. SMT DIVERGENCE (SMART MONEY TECHNIQUE): Verify if the move is confirmed by correlated pairs (e.g., DXY vs EURUSD or Gold vs Silver). If DXY makes a higher high and Gold fails to make a lower low, that is SMT accumulation.
      4. LIQUIDITY PURGE CHECK: Ensure retail "equal highs" or "trendline support" have been swept (Stop Hunted) before confirming an entry.
      5. ORDER FLOW & DISPLACEMENT: Identify a clear displacement (aggressive large candle) leaving a Fair Value Gap (FVG) and a Market Structure Shift (MSS).
      6. CANDLESTICK CONFIRMATION: Look for institutional candles (Power of 3 - AMD: Accumulation, Manipulation, Distribution) or 15m/5m Displacement.
      
      MANDATE: If a setup is low-probability or "retail", state "STAY FLAT" and explain exactly why the institutional criteria were not met. You are here to win, not to gamble.`,
      thinkingConfig: { thinkingBudget: 24000 },
      tools: [{ googleSearch: {} }] 
    }
  });

  const text = response.text || "";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = chunks.map((c: any) => c.web).filter(Boolean).map((w: any) => ({ uri: w.uri, title: w.title }));

  // Detect high-conviction sniper signal
  const isSniper = (text.toLowerCase().includes("sniper") || text.includes("🎯") || text.toLowerCase().includes("high conviction")) && 
                   (text.toLowerCase().includes("smt") || text.toLowerCase().includes("displacement") || text.toLowerCase().includes("purge") || text.toLowerCase().includes("sweep"));

  return {
    text,
    isSniper,
    groundingUrls: urls
  };
};

/**
 * Predictor Service
 */
export const getPredictionResponse = async (query: string) => {
  const ai = getAI();
  const now = new Date();
  
  const systemInstruction = `You are the Nova Oracle, an elite forecasting engine.
  MANDATE: 95%+ analytical precision. No guesses.
  Check injuries, tactical changes, and bench depth.
  Current Date: ${now.toDateString()}.`;

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX,
    contents: query,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingBudget: 24000 }, 
      tools: [{ googleSearch: {} }]
    }
  });

  const text = response.text || "";
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const urls = chunks.map((c: any) => c.web).filter(Boolean).map((w: any) => ({ uri: w.uri, title: w.title }));

  return { text, urls };
};

/**
 * Batch Predictor Service
 */
export const getBatchPredictionResponse = async (images: File[]) => {
  const ai = getAI();
  const now = new Date();
  
  const imageParts = await Promise.all(images.map(async (img) => {
    const b64 = await fileToBase64(img);
    return { inlineData: { data: b64, mimeType: img.type } };
  }));

  const systemInstruction = `You are the Nova Oracle Batch Engine. Pick top 10 football correct scores using deep auditing. Date: ${now.toDateString()}.`;

  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX,
    contents: {
      parts: [
        ...imageParts,
        { text: "Analyze fixtures and pick top 10." }
      ]
    },
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

export const getThinkingAdvice = async (query: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: MODELS.COMPLEX,
    contents: query,
    config: { thinkingConfig: { thinkingBudget: 4000 } }
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
  const response = await ai.models.generateContent({ model: MODELS.COMPLEX, contents: prompt });
  return response.text || "";
};

export const getFastResponse = async (prompt: string) => {
  const ai = getAI();
  const response = await ai.models.generateContent({ model: MODELS.FAST, contents: prompt });
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
  
  const prompt = `FAST SEARCH: Today/Tomorrow red folder events for ${dateStr}. Return JSON.`;

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
