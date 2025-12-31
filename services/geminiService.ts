import { GoogleGenAI } from "@google/genai";
import { DashboardStats, VisitorLog } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize specific model
let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey: apiKey });
}

export const generateSecurityBriefing = async (stats: DashboardStats, recentLogs: VisitorLog[]): Promise<string> => {
  if (!ai) {
    return "Gemini API Key not configured. Unable to generate briefing.";
  }

  const prompt = `
    Act as a senior security analyst for an Auxiliary Police unit. 
    Analyze the following current premise data and provide a concise, professional security briefing (max 100 words).
    
    Current Stats:
    - Total Visitors Today: ${stats.totalVisitors}
    - Active Staff On-site: ${stats.activeStaff}
    - Security Alerts: ${stats.alerts}
    - Avg Visit Duration: ${stats.avgDuration}
    
    Recent Access Logs:
    ${recentLogs.slice(0, 5).map(log => `- ${log.name} (${log.type}): ${log.status} at ${log.location}`).join('\n')}
    
    Highlight any anomalies or confirm normal operation status.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No insights available.";
  } catch (error) {
    console.error("Error generating briefing:", error);
    return "System offline. Unable to generate AI briefing.";
  }
};