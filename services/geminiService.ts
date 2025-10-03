
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { TripPlan } from '../types';
import Swal from 'sweetalert2';

// IMPORTANT: Do not expose this key in a real-world application.
// This should be handled securely, e.g., via a backend proxy.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  Swal.fire({
    icon: 'warning',
    title: 'AI Tidak Tersedia',
    text: 'API Key tidak ditemukan. Fitur AI akan dinonaktifkan.',
    confirmButtonText: 'Baik'
  });
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
    Swal.fire({
      icon: 'error',
      title: 'Kesalahan AI',
      text: 'Terjadi kesalahan saat membuat rencana perjalanan.',
      confirmButtonText: 'Baik'
    });
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
        Swal.fire({
          icon: 'error',
          title: 'Kesalahan AI',
          text: 'Terjadi kesalahan saat memproses pencarian.',
          confirmButtonText: 'Baik'
        });
        return null;
    }
};

/**
 * AI-powered voice command interpreter
 * Translates natural language voice commands into system actions
 * 
 * @param command - The voice command text from speech recognition
 * @param currentPage - The current page context (optional)
 * @returns Object containing action, feedback message, and optional parameters
 */
export const interpretVoiceCommand = async (command: string, currentPage?: string): Promise<{ action: string; feedback: string; params?: string } | null> => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `You are an AI assistant for a train ticket management app called "KAI Access". 
            Analyze the user's voice command and translate it into a system action.
            
            IMPORTANT CONTEXT RULES:
            1. If user asks to go to a page they're already on, respond with appropriate feedback
            2. Prioritize context-specific actions over general navigation
            3. Avoid unnecessary navigation if user is already in the correct section
            4. Be more specific about what the user wants to do rather than just navigate
            
            Available actions and their variations:
            - DASHBOARD: "dashboard", "home", "beranda", "halaman utama", "pulang", "kembali ke awal"
            - PLANNER: "planner", "trip planner", "ai trip planner", "perencanaan", "rencana perjalanan", "buat perjalanan", "buat trip"
            - INTERCITY: "inter city", "intercity", "kereta jarak jauh", "kereta antar kota", "tiket jarak jauh", "pilih inter city", "buka inter city"
            - COMMUTER: "commuter line", "commuter", "kereta commuter", "KRL", "kereta lokal", "pilih commuter", "buka commuter"
            - TICKETS: "tiket", "tickets", "tiket saya", "riwayat tiket", "daftar tiket", "lihat tiket", "pilih tiket", "buka tiket"
            - ACCOUNT: "akun", "account", "profil", "profile", "pengaturan", "settings", "pilih akun", "buka akun"
            - BOOKING_FORM: "booking form", "form pemesanan", "pesan tiket", "beli tiket"
            - TICKET_LIST: "daftar tiket", "list tiket", "lihat daftar tiket"
            - THEME_TOGGLE: "ganti tema", "ubah tema", "toggle theme", "dark mode", "light mode", "mode gelap", "mode terang"
            - SHOW_TRAIN_LIST: "tampilkan kereta", "lihat kereta", "daftar kereta", "pilih kereta", "tampilkan daftar kereta"
            - BOOK_TICKET: "pesan tiket", "beli tiket", "booking tiket", "pesan sekarang"
            - SEARCH_TRAIN: "cari kereta", "search", "cari", "find"
            - FILTER_TICKETS: "filter tiket", "saring tiket", "urutkan tiket"
            - NAVIGATE_BACK: "kembali", "back", "mundur", "sebelumnya"
            - VOICE_SEARCH: "cari dengan suara", "voice search", "pencarian suara"
            
            User Command: "${command}"
            ${currentPage ? `Current Page Context: User is currently on "${currentPage}" page.` : ''}
            
            Determine the most appropriate action and provide a natural feedback message in Indonesian.
            The feedback should be friendly and confirm what action is being taken.
            Consider the context and avoid redundant navigation.
            If the user is already on the requested page, provide appropriate feedback instead of navigating.
            
            Examples:
            - "buka dashboard" → action: "DASHBOARD", feedback: "Membuka Dashboard..."
            - "pilih inter city" → action: "INTERCITY", feedback: "Membuka Antar Kota Booking..."
            - "tampilkan kereta" → action: "SHOW_TRAIN_LIST", feedback: "Menampilkan daftar kereta..."
            - "pesan tiket" → action: "BOOK_TICKET", feedback: "Memproses pemesanan tiket..."
            - "dashboard" (when already on dashboard) → action: "DASHBOARD", feedback: "Anda sudah berada di Dashboard"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        action: { 
                            type: Type.STRING, 
                            description: "The system action to perform. Must be one of: DASHBOARD, PLANNER, INTERCITY, COMMUTER, TICKETS, ACCOUNT, BOOKING_FORM, TICKET_LIST, THEME_TOGGLE, SHOW_TRAIN_LIST, BOOK_TICKET, SEARCH_TRAIN, FILTER_TICKETS, NAVIGATE_BACK, VOICE_SEARCH" 
                        },
                        feedback: { 
                            type: Type.STRING, 
                            description: "A friendly feedback message in Indonesian to show the user what action is being performed" 
                        },
                        params: { 
                            type: Type.STRING, 
                            description: "Optional parameters for the action as JSON string (e.g., search query, filter options, etc.)" 
                        }
                    },
                    required: ["action", "feedback"]
                }
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Kesalahan AI',
          text: 'Terjadi kesalahan saat memproses perintah suara.',
          confirmButtonText: 'Baik'
        });
        return null;
    }
};