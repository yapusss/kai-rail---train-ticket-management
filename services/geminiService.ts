
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

export interface VoiceCommandResult {
    action: 'navigate' | 'toggle-theme' | 'search' | 'book' | 'help' | 'unknown';
    target?: string;
    confidence?: number;
}

export const interpretVoiceCommand = async (command: string): Promise<VoiceCommandResult> => {
    if (!API_KEY) {
        // Fallback to pattern matching when API key is not available
        return interpretCommandWithPatternMatching(command);
    }

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Interpret the following voice command and return a JSON response with action and target.
            Available actions: navigate, toggle-theme, search, book, help
            Available navigation targets: dashboard, planner, train-services, tickets, account, promotion, booking-form, ticket-list
            
            Voice command: "${command}"
            
            Examples:
            - "buka dashboard" -> {"action": "navigate", "target": "dashboard", "confidence": 0.9}
            - "ganti tema" -> {"action": "toggle-theme", "confidence": 0.9}
            - "cari kereta" -> {"action": "search", "target": "trains", "confidence": 0.8}
            - "saya ingin buka planner" -> {"action": "navigate", "target": "planner", "confidence": 0.8}
            - "tolong buka tiket saya" -> {"action": "navigate", "target": "tickets", "confidence": 0.8}
            - "buka layanan kereta" -> {"action": "navigate", "target": "train-services", "confidence": 0.9}
            - "lihat akun saya" -> {"action": "navigate", "target": "account", "confidence": 0.8}
            - "buka promosi" -> {"action": "navigate", "target": "promotion", "confidence": 0.9}
            - "form pemesanan" -> {"action": "navigate", "target": "booking-form", "confidence": 0.8}
            - "daftar tiket" -> {"action": "navigate", "target": "ticket-list", "confidence": 0.8}
            - "saya mau ke dashboard" -> {"action": "navigate", "target": "dashboard", "confidence": 0.8}
            - "bisa buka trip planner" -> {"action": "navigate", "target": "planner", "confidence": 0.8}
            - "tolong tampilkan tiket" -> {"action": "navigate", "target": "tickets", "confidence": 0.8}
            - "saya ingin lihat akun" -> {"action": "navigate", "target": "account", "confidence": 0.8}
            - "ada promo apa" -> {"action": "navigate", "target": "promotion", "confidence": 0.8}
            - "mau pesan tiket" -> {"action": "navigate", "target": "booking-form", "confidence": 0.8}
            - "lihat list tiket" -> {"action": "navigate", "target": "ticket-list", "confidence": 0.8}
            - "ubah ke mode gelap" -> {"action": "toggle-theme", "confidence": 0.8}
            - "ganti ke tema terang" -> {"action": "toggle-theme", "confidence": 0.8}
            
            Return only the JSON response:`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { type: Type.STRING, description: "The action to perform" },
                        target: { type: Type.STRING, description: "The target for navigation actions" },
                        confidence: { type: Type.NUMBER, description: "Confidence level from 0 to 1" }
                    },
                    required: ["action"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as VoiceCommandResult;
    } catch (error) {
        console.error("Error interpreting voice command:", error);
        // Fallback to pattern matching
        return interpretCommandWithPatternMatching(command);
    }
};

const interpretCommandWithPatternMatching = (command: string): VoiceCommandResult => {
    const lowerCommand = command.toLowerCase();
    
    // Navigation commands with high confidence
    if (lowerCommand.includes('dashboard') || lowerCommand.includes('beranda') || lowerCommand.includes('home') || lowerCommand.includes('utama') || lowerCommand.includes('ke dashboard')) {
        return { action: 'navigate', target: 'dashboard', confidence: 0.9 };
    }
    
    if (lowerCommand.includes('planner') || lowerCommand.includes('trip') || lowerCommand.includes('rencana') || lowerCommand.includes('perjalanan') || lowerCommand.includes('ai')) {
        return { action: 'navigate', target: 'planner', confidence: 0.9 };
    }
    
    if (lowerCommand.includes('layanan') || lowerCommand.includes('kereta') || lowerCommand.includes('train') || lowerCommand.includes('service')) {
        return { action: 'navigate', target: 'train-services', confidence: 0.9 };
    }
    
    if (lowerCommand.includes('tiket') || lowerCommand.includes('ticket') || lowerCommand.includes('tampilkan tiket') || lowerCommand.includes('lihat tiket')) {
        return { action: 'navigate', target: 'tickets', confidence: 0.9 };
    }
    
    if (lowerCommand.includes('akun') || lowerCommand.includes('account') || lowerCommand.includes('profile') || lowerCommand.includes('profil') || lowerCommand.includes('lihat akun')) {
        return { action: 'navigate', target: 'account', confidence: 0.9 };
    }
    
    if (lowerCommand.includes('promo') || lowerCommand.includes('promotion') || lowerCommand.includes('diskon') || lowerCommand.includes('offer') || lowerCommand.includes('ada promo')) {
        return { action: 'navigate', target: 'promotion', confidence: 0.9 };
    }
    
    if ((lowerCommand.includes('form') && lowerCommand.includes('pemesanan')) || lowerCommand.includes('pesan tiket') || lowerCommand.includes('mau pesan')) {
        return { action: 'navigate', target: 'booking-form', confidence: 0.9 };
    }
    
    if (lowerCommand.includes('daftar') || lowerCommand.includes('list') || lowerCommand.includes('list tiket')) {
        return { action: 'navigate', target: 'ticket-list', confidence: 0.9 };
    }
    
    // Theme commands
    if (lowerCommand.includes('tema') || lowerCommand.includes('theme') || lowerCommand.includes('mode') || lowerCommand.includes('ganti') || lowerCommand.includes('ubah') || lowerCommand.includes('mode gelap') || lowerCommand.includes('tema terang')) {
        return { action: 'toggle-theme', confidence: 0.9 };
    }
    
    // Search commands
    if (lowerCommand.includes('cari') || lowerCommand.includes('search') || lowerCommand.includes('find')) {
        if (lowerCommand.includes('kereta') || lowerCommand.includes('train')) {
            return { action: 'search', target: 'trains', confidence: 0.8 };
        }
        if (lowerCommand.includes('hotel') || lowerCommand.includes('penginapan')) {
            return { action: 'search', target: 'hotels', confidence: 0.8 };
        }
        if (lowerCommand.includes('mobil') || lowerCommand.includes('car') || lowerCommand.includes('rental')) {
            return { action: 'search', target: 'cars', confidence: 0.8 };
        }
        return { action: 'search', target: 'general', confidence: 0.7 };
    }
    
    // Booking commands
    if (lowerCommand.includes('pesan') || lowerCommand.includes('book') || lowerCommand.includes('beli') || lowerCommand.includes('buy')) {
        if (lowerCommand.includes('kereta') || lowerCommand.includes('train')) {
            return { action: 'book', target: 'train', confidence: 0.8 };
        }
        if (lowerCommand.includes('hotel') || lowerCommand.includes('penginapan')) {
            return { action: 'book', target: 'hotel', confidence: 0.8 };
        }
        if (lowerCommand.includes('mobil') || lowerCommand.includes('car')) {
            return { action: 'book', target: 'car', confidence: 0.8 };
        }
        return { action: 'book', target: 'general', confidence: 0.7 };
    }
    
    // Complex natural language patterns
    if (lowerCommand.includes('saya ingin') || lowerCommand.includes('i want') || lowerCommand.includes('tolong')) {
        if (lowerCommand.includes('pergi ke') || lowerCommand.includes('buka')) {
            // Extract destination from command
            const destination = extractDestination(lowerCommand);
            if (destination) {
                return { action: 'navigate', target: destination, confidence: 0.8 };
            }
        }
    }
    
    if (lowerCommand.includes('bagaimana cara') || lowerCommand.includes('how to') || lowerCommand.includes('cara')) {
        return { action: 'help', confidence: 0.7 };
    }
    
    // Default fallback
    return { action: 'unknown', confidence: 0.1 };
};

const extractDestination = (command: string): string | null => {
    // Extract navigation destination from natural language
    if (command.includes('dashboard') || command.includes('beranda')) return 'dashboard';
    if (command.includes('planner') || command.includes('trip')) return 'planner';
    if (command.includes('layanan') || command.includes('kereta')) return 'train-services';
    if (command.includes('tiket')) return 'tickets';
    if (command.includes('akun')) return 'account';
    if (command.includes('promo')) return 'promotion';
    if (command.includes('form') && command.includes('pemesanan')) return 'booking-form';
    if (command.includes('daftar') || command.includes('list')) return 'ticket-list';
    return null;
};
