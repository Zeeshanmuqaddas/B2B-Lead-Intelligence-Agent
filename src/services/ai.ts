import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

const systemInstruction = `You are an advanced AI Email Lead Intelligence Agent for a B2B Garments & Uniform Manufacturing SaaS platform.

Your role is to analyze incoming emails and convert them into structured, actionable business intelligence for sales automation.

────────────────────────────
🎯 CORE OBJECTIVES
────────────────────────────

1. Classify whether the email is:
   - A HIGH VALUE SALES LEAD
   - A NORMAL INQUIRY
   - SPAM / IRRELEVANT

2. Extract key business intelligence:
   - Company name (if available)
   - Country
   - Product interest (e.g., uniforms, garments, bulk order, fabric, etc.)
   - Buyer intent (low / medium / high)

3. Assign a LEAD SCORE (0–100):
   - 90–100 = Hot enterprise bulk order
   - 70–89 = Strong business inquiry
   - 40–69 = Potential lead
   - 1–39 = Low intent
   - 0 = Spam / irrelevant

4. Identify if auto-reply should be generated.

5. Detect spam patterns (irrelevant content, promotions, scams, job offers not related to business).

────────────────────────────
🧠 SCORING LOGIC
────────────────────────────

Increase score when:
- Mentions bulk order / large quantity
- Asks for quotation / pricing
- Mentions export/import / factory / procurement
- Corporate email domain detected
- Clear buying intent

Decrease score when:
- No business intent
- Generic message
- Job applications unrelated to purchasing
- Spam content or promotions

────────────────────────────
🚫 SPAM DETECTION RULES
────────────────────────────

Mark spam = true if:
- Job offers unrelated to buying
- Crypto scams / marketing spam
- No product intent
- Suspicious links or irrelevant content

If spam = true:
- lead_score MUST be 0
- is_lead MUST be false

────────────────────────────
✉️ AUTO REPLY RULE
────────────────────────────

Set requires_auto_reply = true ONLY IF:
- lead_score >= 70
- AND spam = false
Otherwise false.

────────────────────────────
🧠 CONTEXT DOMAIN
────────────────────────────

You are working for a Garments Manufacturing Export Company that produces:
- Uniforms (industrial, pharmaceutical, corporate)
- Coveralls / boiler suits
- Shirts / t-shirts
- Bulk textile manufacturing orders

Your goal is to identify HIGH VALUE B2B BUYERS ONLY.`;

export interface LeadAnalysis {
  is_lead: boolean;
  lead_score: number;
  lead_type: "hot_lead" | "warm_lead" | "cold_lead" | "spam";
  inquiry_type: "bulk_order" | "quotation" | "sample_request" | "pricing" | "partnership" | "other";
  company_name: string;
  contact_person: string;
  country: string;
  product_interest: string;
  order_volume_estimate: string;
  budget_signal: "low" | "medium" | "high" | "unknown";
  intent_summary: string;
  spam: boolean;
  requires_auto_reply: boolean;
  auto_reply_priority: "high" | "medium" | "low";
}

export async function analyzeEmail(emailContent: string): Promise<LeadAnalysis> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: emailContent,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2, // Low temperature for more deterministic, precise analysis
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          is_lead: { type: Type.BOOLEAN },
          lead_score: { type: Type.INTEGER, description: "Lead score from 0-100" },
          lead_type: { type: Type.STRING, enum: ["hot_lead", "warm_lead", "cold_lead", "spam"] },
          inquiry_type: { type: Type.STRING, enum: ["bulk_order", "quotation", "sample_request", "pricing", "partnership", "other"] },
          company_name: { type: Type.STRING, description: "Empty string if unknown" },
          contact_person: { type: Type.STRING, description: "Empty string if unknown" },
          country: { type: Type.STRING, description: "Empty string if unknown" },
          product_interest: { type: Type.STRING, description: "Empty string if unknown" },
          order_volume_estimate: { type: Type.STRING, description: "Estimate of volume, empty string if unknown" },
          budget_signal: { type: Type.STRING, enum: ["low", "medium", "high", "unknown"] },
          intent_summary: { type: Type.STRING, description: "Short summary of the intent" },
          spam: { type: Type.BOOLEAN },
          requires_auto_reply: { type: Type.BOOLEAN },
          auto_reply_priority: { type: Type.STRING, enum: ["high", "medium", "low"] }
        },
        required: [
          "is_lead", "lead_score", "lead_type", "inquiry_type", "company_name", 
          "contact_person", "country", "product_interest", "order_volume_estimate", 
          "budget_signal", "intent_summary", "spam", "requires_auto_reply", 
          "auto_reply_priority"
        ]
      }
    }
  });

  return JSON.parse(response.text!) as LeadAnalysis;
}

export async function generateReplyCode(emailContent: string, analysis: LeadAnalysis): Promise<string> {
  const replyPrompt = `
You are a senior export sales manager for a Garments Manufacturing Company.

Write a short, highly professional, and persuasive business email reply to the prospective client.

Client original email:
\`\`\`
${emailContent}
\`\`\`

Agent intelligence analysis of this client:
\`\`\`
${JSON.stringify(analysis, null, 2)}
\`\`\`

Rules for your reply:
- Keep it under 120 words
- Be polite and corporate
- Focus on closing bulk orders
- Ask for order quantity, specifications, and delivery timeline (if not already provided)
- No emojis
- No unnecessary text
- Only output the email body, without wrapping it in markdown or explaining it.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: replyPrompt,
    config: {
      temperature: 0.7,
    }
  });

  return response.text || "";
}
