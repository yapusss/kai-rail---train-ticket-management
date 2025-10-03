import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { NavigationTab } from "./types";
import { interpretVoiceCommand } from "./services/geminiService";
import BottomNavBar from "./components/BottomNavBar";
import DashboardScreen from "./screens/DashboardScreen";
import PlannerScreen from "./screens/PlannerScreen";
import TrainServicesScreen from "./screens/TrainServicesScreen";
import BookingFormScreen from "./screens/BookingFormScreen";
import TicketListScreen from "./screens/TicketListScreen";
import PassengerFormScreen from "./screens/PassengerFormScreen";
import TicketsScreen from "./screens/TicketsScreen";
import AccountScreen from "./screens/AccountScreen";
import { SunIcon, MoonIcon } from "./components/icons/ThemeIcons";

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<NavigationTab>(
    NavigationTab.Dashboard
  );
  
  // Booking flow state
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [bookingFormData, setBookingFormData] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [bookedTicket, setBookedTicket] = useState<any>(null);
  
  // Voice command feedback state
  const [voiceCommandFeedback, setVoiceCommandFeedback] = useState<string>('');

  // Voice command callback functions
  const showFeedback = (message: string) => {
    setVoiceCommandFeedback(message);
    setTimeout(() => setVoiceCommandFeedback(''), 2000);
  };

  const navigateWithFeedback = (tab: NavigationTab, message: string) => {
    setActiveTab(tab);
    showFeedback(message);
  };

  const toggleThemeWithFeedback = () => {
    toggleTheme();
    showFeedback(`Mengubah ke tema ${theme === 'light' ? 'gelap' : 'terang'}...`);
  };

  // AI-powered voice command interpreter
  const handleVoiceCommand = async (transcript: string): Promise<void> => {
    try {
      showFeedback("Memproses perintah...");
      const commandResult = await interpretVoiceCommand(transcript);
      executeCommand(commandResult);
    } catch (error) {
      console.error('Error interpreting voice command:', error);
      // Fallback to simple keyword matching
      executeSimpleCommand(transcript);
    }
  };

  // Execute AI-interpreted command
  const executeCommand = (commandResult: any) => {
    switch (commandResult.action) {
      case 'navigate':
        switch (commandResult.target) {
          case 'dashboard':
            navigateWithFeedback(NavigationTab.Dashboard, "Membuka Dashboard...");
            break;
          case 'planner':
            navigateWithFeedback(NavigationTab.Planner, "Membuka AI Trip Planner...");
            break;
          case 'train-services':
            navigateWithFeedback(NavigationTab.TrainServices, "Membuka Layanan Kereta...");
            break;
          case 'tickets':
            navigateWithFeedback(NavigationTab.Tickets, "Membuka Tiket Saya...");
            break;
          case 'account':
            navigateWithFeedback(NavigationTab.Account, "Membuka Akun...");
            break;
          case 'promotion':
            navigateWithFeedback(NavigationTab.Promotion, "Membuka Promosi...");
            break;
          case 'booking-form':
            navigateWithFeedback(NavigationTab.BookingForm, "Membuka Form Pemesanan...");
            break;
          case 'ticket-list':
            navigateWithFeedback(NavigationTab.TicketList, "Membuka Daftar Tiket...");
            break;
        }
        break;
      case 'toggle-theme':
        toggleThemeWithFeedback();
        break;
      case 'search':
        showFeedback("Fitur pencarian akan segera tersedia...");
        break;
      case 'book':
        showFeedback("Fitur pemesanan akan segera tersedia...");
        break;
      default:
        showFeedback("Perintah tidak dikenali. Silakan coba lagi.");
    }
  };

  // Fallback simple command matching
  const executeSimpleCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('dashboard') || lowerTranscript.includes('beranda') || lowerTranscript.includes('home')) {
      navigateWithFeedback(NavigationTab.Dashboard, "Membuka Dashboard...");
    } else if (lowerTranscript.includes('planner') || lowerTranscript.includes('trip') || lowerTranscript.includes('rencana')) {
      navigateWithFeedback(NavigationTab.Planner, "Membuka AI Trip Planner...");
    } else if (lowerTranscript.includes('layanan') || lowerTranscript.includes('kereta') || lowerTranscript.includes('train')) {
      navigateWithFeedback(NavigationTab.TrainServices, "Membuka Layanan Kereta...");
    } else if (lowerTranscript.includes('tiket') || lowerTranscript.includes('ticket')) {
      navigateWithFeedback(NavigationTab.Tickets, "Membuka Tiket Saya...");
    } else if (lowerTranscript.includes('akun') || lowerTranscript.includes('account')) {
      navigateWithFeedback(NavigationTab.Account, "Membuka Akun...");
    } else if (lowerTranscript.includes('promo') || lowerTranscript.includes('promotion')) {
      navigateWithFeedback(NavigationTab.Promotion, "Membuka Promosi...");
    } else if (lowerTranscript.includes('booking') || lowerTranscript.includes('pemesanan')) {
      navigateWithFeedback(NavigationTab.BookingForm, "Membuka Form Pemesanan...");
    } else if (lowerTranscript.includes('daftar') || lowerTranscript.includes('list')) {
      navigateWithFeedback(NavigationTab.TicketList, "Membuka Daftar Tiket...");
    } else if (lowerTranscript.includes('tema') || lowerTranscript.includes('theme')) {
      toggleThemeWithFeedback();
    } else {
      showFeedback("Perintah tidak dikenali. Silakan coba lagi.");
    }
  };

  // Voice command setup with AI interpretation
  const commands = [
    {
      command: ["*"],
      callback: (spokenText: string) => {
        handleVoiceCommand(spokenText);
      },
    },
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ commands });

  useEffect(() => {
    // Start listening automatically
    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true, language: "id-ID" });
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  const renderScreen = () => {
    switch (activeTab) {
      case NavigationTab.Dashboard:
        return <DashboardScreen setActiveTab={setActiveTab} />;
      case NavigationTab.Planner:
        return <PlannerScreen />;
      case NavigationTab.TrainServices:
        return <TrainServicesScreen setActiveTab={setActiveTab} setSelectedServiceType={setSelectedServiceType} setBookingFormData={setBookingFormData} />;
      case NavigationTab.BookingForm:
        return <BookingFormScreen setActiveTab={setActiveTab} selectedServiceType={selectedServiceType} setBookingFormData={setBookingFormData} />;
      case NavigationTab.TicketList:
        return <TicketListScreen setActiveTab={setActiveTab} bookingFormData={bookingFormData} setSelectedTicket={setSelectedTicket} />;
      case NavigationTab.PassengerForm:
        return <PassengerFormScreen setActiveTab={setActiveTab} selectedTicket={selectedTicket} setBookedTicket={setBookedTicket} />;
      case NavigationTab.Tickets:
        return <TicketsScreen />;
      case NavigationTab.Promotion:
        return (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Promotion Screen - Coming Soon
          </div>
        );
      case NavigationTab.Account:
        return <AccountScreen />;
      default:
        return <DashboardScreen setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-black min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm h-[800px] max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 dark:bg-black rounded-b-xl z-20"></div>

        {/* Header */}
        <header className="relative flex items-center justify-between p-4 pt-8 bg-gradient-to-tr from-purple-600 to-blue-600 backdrop-blur-sm z-10">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-blue-600"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-6 left-12 w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="absolute bottom-4 right-16 w-2 h-2 bg-white rounded-full"></div>
          </div>
          
          <div className="relative z-10 flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white drop-shadow-lg">
                Access by KAI
              </h1>
              <p className="text-xs text-white/80">Your Travel Companion</p>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center space-x-3">
            {/* Voice Command Toggle Button */}
            <button
              onClick={browserSupportsSpeechRecognition ? () => {
                if (listening) {
                  SpeechRecognition.stopListening();
                } else {
                  SpeechRecognition.startListening({ continuous: true, language: "id-ID" });
                }
              } : undefined}
              disabled={!browserSupportsSpeechRecognition}
              className={`p-3 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
                browserSupportsSpeechRecognition
                  ? listening
                    ? 'bg-green-500/60 hover:bg-green-600/60'
                    : 'bg-white/20 hover:bg-white/20'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              title={browserSupportsSpeechRecognition 
                ? (listening ? 'Stop Voice Command' : 'Start Voice Command')
                : 'Voice recognition not supported'
              }
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 hover:scale-110 shadow-lg"
            >
              {theme === "light" ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </header>

        {/* Voice Command Feedback */}
        {voiceCommandFeedback && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">{voiceCommandFeedback}</span>
            </div>
          </div>
        )}

        {/* Screen Content */}
        <main className="flex-grow overflow-y-auto pb-20">
          {renderScreen()}
        </main>

        {/* Bottom Navigation */}
        <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default App;