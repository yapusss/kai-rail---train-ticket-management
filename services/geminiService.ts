
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { TripPlan } from '../types';

// IMPORTANT: Do not expose this key in a real-world application.
// This should be handled securely, e.g., via a backend proxy.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const MOCK_SCHEDULE_DATA = `
Jadwal Kereta Api (Contoh):
- Argo Bromo Anggrek (Eksekutif): Jakarta (Gambir) 08:00 -> Surabaya (Pasar Turi) 16:30, Harga: 600000
- Jayabaya (Ekonomi/Eksekutif): Jakarta (Pasar Senen) 16:45 -> Malang 05:50, Harga: 450000
- Taksaka (Eksekutif/Luxury): Jakarta (Gambir) 21:00 -> Yogyakarta 04:30, Harga: 550000
- Serayu (Ekonomi): Jakarta (Pasar Senen) 09:15 -> Purwokerto 15:30, Harga: 70000
- Bima (Eksekutif): Surabaya (Gubeng) 17:10 -> Jakarta (Gambir) 04:40, Harga: 580000
`;

export const generateTripPlan = async (prompt: string): Promise<TripPlan | null> => {
  if (!API_KEY) return null;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Based on the following user request and the provided train schedule data, create a detailed trip plan. The plan should be logical and efficient.
      
      User Request: "${prompt}"

      Train Schedule Data:
      ${MOCK_SCHEDULE_DATA}

      Generate a response in JSON format that follows the specified schema. Ensure prices are numbers without currency symbols or separators.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            planTitle: { type: Type.STRING, description: "A catchy title for the trip plan, e.g., 'Jakarta to Yogyakarta Weekend Getaway'." },
            totalEstimatedPrice: { type: Type.NUMBER, description: "The total estimated price for all steps of the trip." },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trainName: { type: Type.STRING },
                  trainClass: { type: Type.STRING },
                  departureStation: { type: Type.STRING },
                  departureTime: { type: Type.STRING, description: "Format: YYYY-MM-DD HH:mm" },
                  arrivalStation: { type: Type.STRING },
                  arrivalTime: { type: Type.STRING, description: "Format: YYYY-MM-DD HH:mm" },
                  estimatedPrice: { type: Type.NUMBER },
                  notes: { type: Type.STRING, description: "Any additional notes or suggestions for this leg of the trip." }
                },
                required: ["trainName", "trainClass", "departureStation", "departureTime", "arrivalStation", "arrivalTime", "estimatedPrice"]
              }
            }
          },
          required: ["planTitle", "totalEstimatedPrice", "steps"]
        },
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as TripPlan;
  } catch (error) {
    console.error("Error generating trip plan:", error);
    return null;
  }
};

export const interpretSearchQuery = async (query: string): Promise<{ month?: number; year?: number; text?: string } | null> => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following user query to filter their ticket history. Extract the month (as a number 1-12), the year, and any other specific keywords. Today is ${new Date().toDateString()}. If the year is not specified, assume the current year.

            User Query: "${query}"
            
            Provide the output in JSON format according to the schema.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        month: { type: Type.INTEGER, description: "Month as a number from 1 to 12. e.g., September is 9." },
                        year: { type: Type.INTEGER, description: "The full year, e.g., 2024." },
                        text: { type: Type.STRING, description: "Any other keywords to search for, like city or train name." }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error interpreting search query:", error);
        return null;
    }
};
