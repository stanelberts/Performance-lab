
import { GoogleGenAI } from "@google/genai";
import { Activity } from "../types";
import { formatDuration, formatPace } from "../utils/analysis";

export const analyzeWorkout = async (activity: Activity) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const activityData = {
    naam: activity.name,
    type: activity.type,
    afstand: `${(activity.distance / 1000).toFixed(2)} km`,
    duur: formatDuration(activity.movingTime),
    tempo: `${formatPace(activity.distance / activity.movingTime)} /km`,
    hartslag: activity.avgHr ? `${activity.avgHr} bpm` : "onbekend",
    isRace: activity.isRace ? "Ja" : "Nee",
    hyrox: activity.hyroxData ? JSON.stringify(activity.hyroxData.parts) : "N.v.t."
  };

  const prompt = `
    Je bent een senior Performance Coach gespecialiseerd in Hyrox en duursport. 
    Analyseer de volgende workout van een atleet genaamd Stan. 
    Geef beknopte, krachtige feedback in het Nederlands. 
    Focus op:
    1. Wat ging er goed op basis van de data?
    2. Waar is ruimte voor verbetering?
    3. Specifieke tip voor de volgende sessie.
    
    Data: ${JSON.stringify(activityData)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("AI Analysis error:", error);
    return "De AI Coach is momenteel even aan het rusten. Probeer het later opnieuw.";
  }
};
