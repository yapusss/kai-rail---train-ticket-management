import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { NavigationTab } from "./types";
import { interpretVoiceCommand } from "./services/geminiService";
import BottomNavBar from "./components/BottomNavBar";
import DashboardScreen from "./screens/DashboardScreen";
import PlannerScreen from "./screens/PlannerScreen";
import InterCityBookingScreen from "./screens/InterCityBookingScreen";
import CommuterLineScreen from "./screens/CommuterLineScreen";
import BookingFormScreen from "./screens/BookingFormScreen";
import TicketListScreen from "./screens/TicketListScreen";
import PassengerFormScreen from "./screens/PassengerFormScreen";
import TicketsScreen from "./screens/TicketsScreen";
import AccountScreen from "./screens/AccountScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import { SunIcon, MoonIcon } from "./components/icons/ThemeIcons";
import Swal from 'sweetalert2';

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<NavigationTab>(
    NavigationTab.Dashboard
  );
  
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [bookingFormData, setBookingFormData] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [bookedTicket, setBookedTicket] = useState<any>(null);
  const [showInterCityTrainList, setShowInterCityTrainList] = useState<boolean>(false);
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [voiceCommandContext, setVoiceCommandContext] = useState<string>('dashboard');
  
  const [voiceCommandFeedback, setVoiceCommandFeedback] = useState<string>('');

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

  const handleVoiceCommand = async (transcript: string): Promise<void> => {
    setIsProcessingAI(true);
    showFeedback("AI sedang memproses perintah...");
    
    try {
      const commandResult = await interpretVoiceCommand(transcript);
      if (commandResult) {
        executeCommand(commandResult);
      } else {
        executeSimpleCommand(transcript);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan',
        text: 'Terjadi kesalahan saat memproses perintah suara.',
        confirmButtonText: 'Baik'
      });
      executeSimpleCommand(transcript);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const executeCommand = (commandResult: any) => {
    if (!commandResult) {
      showFeedback("Maaf, tidak dapat memproses perintah. Silakan coba lagi.");
      return;
    }

    switch (commandResult.action) {
      case 'DASHBOARD':
        navigateWithFeedback(NavigationTab.Dashboard, commandResult.feedback || "Membuka Dashboard...");
        setVoiceCommandContext('dashboard');
        break;
      case 'PLANNER':
        navigateWithFeedback(NavigationTab.Planner, commandResult.feedback || "Membuka AI Trip Planner...");
        setVoiceCommandContext('planner');
        break;
      case 'INTERCITY':
        navigateWithFeedback(NavigationTab.InterCityBooking, commandResult.feedback || "Membuka Inter City Booking...");
        setVoiceCommandContext('intercity');
        break;
      case 'COMMUTER':
        navigateWithFeedback(NavigationTab.CommuterLine, commandResult.feedback || "Membuka Commuter Line...");
        setVoiceCommandContext('commuter');
        break;
      case 'TICKETS':
        navigateWithFeedback(NavigationTab.Tickets, commandResult.feedback || "Membuka Tiket Saya...");
        setVoiceCommandContext('tickets');
        break;
      case 'ACCOUNT':
        navigateWithFeedback(NavigationTab.Account, commandResult.feedback || "Membuka Akun...");
        setVoiceCommandContext('account');
        break;
      case 'BOOKING_FORM':
        navigateWithFeedback(NavigationTab.BookingForm, commandResult.feedback || "Membuka Form Pemesanan...");
        setVoiceCommandContext('booking');
        break;
      case 'TICKET_LIST':
        navigateWithFeedback(NavigationTab.TicketList, commandResult.feedback || "Membuka Daftar Tiket...");
        setVoiceCommandContext('ticketlist');
        break;
      case 'THEME_TOGGLE':
        toggleThemeWithFeedback();
        break;
      case 'SHOW_TRAIN_LIST':
        if (voiceCommandContext === 'intercity') {
          setShowInterCityTrainList(true);
          showFeedback(commandResult.feedback || "Menampilkan daftar kereta...");
        } else {
          navigateWithFeedback(NavigationTab.InterCityBooking, "Membuka Inter City untuk melihat kereta...");
          setShowInterCityTrainList(true);
          setVoiceCommandContext('intercity');
        }
        break;
      case 'BOOK_TICKET':
        if (voiceCommandContext === 'intercity') {
          showFeedback(commandResult.feedback || "Memproses pemesanan tiket...");
        } else {
          navigateWithFeedback(NavigationTab.InterCityBooking, "Membuka Inter City untuk pemesanan...");
          setVoiceCommandContext('intercity');
        }
        break;
      case 'SEARCH_TRAIN':
        showFeedback(commandResult.feedback || "Memulai pencarian kereta...");
        break;
      case 'FILTER_TICKETS':
        showFeedback(commandResult.feedback || "Memfilter tiket...");
        break;
      case 'NAVIGATE_BACK':
        handleBackNavigation();
        break;
      case 'VOICE_SEARCH':
        showFeedback(commandResult.feedback || "Memulai pencarian dengan suara...");
        break;
      default:
        showFeedback(commandResult.feedback || "Perintah tidak dikenali. Silakan coba lagi.");
    }
  };

  const executeSimpleCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('dashboard') || lowerTranscript.includes('beranda') || lowerTranscript.includes('home')) {
      navigateWithFeedback(NavigationTab.Dashboard, "Membuka Dashboard...");
      setVoiceCommandContext('dashboard');
    } else if (lowerTranscript.includes('inter city') || lowerTranscript.includes('intercity')) {
      navigateWithFeedback(NavigationTab.InterCityBooking, "Membuka Inter City...");
      setVoiceCommandContext('intercity');
    } else if (lowerTranscript.includes('commuter')) {
      navigateWithFeedback(NavigationTab.CommuterLine, "Membuka Commuter Line...");
      setVoiceCommandContext('commuter');
    } else if (lowerTranscript.includes('tiket') || lowerTranscript.includes('ticket')) {
      navigateWithFeedback(NavigationTab.Tickets, "Membuka Tiket Saya...");
      setVoiceCommandContext('tickets');
    } else if (lowerTranscript.includes('akun') || lowerTranscript.includes('account')) {
      navigateWithFeedback(NavigationTab.Account, "Membuka Akun...");
      setVoiceCommandContext('account');
    } else if (lowerTranscript.includes('planner') || lowerTranscript.includes('rencana')) {
      navigateWithFeedback(NavigationTab.Planner, "Membuka AI Trip Planner...");
      setVoiceCommandContext('planner');
    } else if (lowerTranscript.includes('tema') || lowerTranscript.includes('theme')) {
      toggleThemeWithFeedback();
    } else {
      showFeedback("Perintah tidak dikenali. Silakan coba lagi.");
    }
  };

  const handleBackNavigation = () => {
    switch (voiceCommandContext) {
      case 'intercity':
        if (showInterCityTrainList) {
          setShowInterCityTrainList(false);
          showFeedback("Kembali ke form pencarian...");
        } else {
          navigateWithFeedback(NavigationTab.Dashboard, "Kembali ke Dashboard...");
          setVoiceCommandContext('dashboard');
        }
        break;
      default:
        navigateWithFeedback(NavigationTab.Dashboard, "Kembali ke Dashboard...");
        setVoiceCommandContext('dashboard');
    }
  };

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
    if (transcript && transcript.trim()) {
      handleVoiceCommand(transcript);
    }
  }, [transcript]);

  useEffect(() => {
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

  const handleSetActiveTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    
    switch (tab) {
      case NavigationTab.Dashboard:
        setVoiceCommandContext('dashboard');
        break;
      case NavigationTab.InterCityBooking:
        setVoiceCommandContext('intercity');
        break;
      case NavigationTab.CommuterLine:
        setVoiceCommandContext('commuter');
        break;
      case NavigationTab.Tickets:
        setVoiceCommandContext('tickets');
        break;
      case NavigationTab.Account:
        setVoiceCommandContext('account');
        break;
      case NavigationTab.Planner:
        setVoiceCommandContext('planner');
        break;
      case NavigationTab.BookingForm:
        setVoiceCommandContext('booking');
        break;
      case NavigationTab.TicketList:
        setVoiceCommandContext('ticketlist');
        break;
      default:
        setVoiceCommandContext('dashboard');
    }
    
    if (tab !== NavigationTab.InterCityBooking) {
      setShowInterCityTrainList(false);
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case NavigationTab.Dashboard:
        return <DashboardScreen setActiveTab={handleSetActiveTab} />;
      case NavigationTab.Planner:
        return <PlannerScreen />;
      case NavigationTab.InterCityBooking:
        return <InterCityBookingScreen setActiveTab={handleSetActiveTab} setSelectedServiceType={setSelectedServiceType} setBookingFormData={setBookingFormData} setSelectedTicket={setSelectedTicket} showTrainListDirectly={showInterCityTrainList} />;
      case NavigationTab.CommuterLine:
        return <CommuterLineScreen setActiveTab={handleSetActiveTab} setSelectedServiceType={setSelectedServiceType} setBookingFormData={setBookingFormData} />;
      case NavigationTab.BookingForm:
        return <BookingFormScreen setActiveTab={handleSetActiveTab} selectedServiceType={selectedServiceType} setBookingFormData={setBookingFormData} />;
      case NavigationTab.TicketList:
        return <TicketListScreen setActiveTab={handleSetActiveTab} bookingFormData={bookingFormData} setSelectedTicket={setSelectedTicket} />;
      case NavigationTab.PassengerForm:
        return <PassengerFormScreen setActiveTab={handleSetActiveTab} selectedTicket={selectedTicket} setBookedTicket={setBookedTicket} setShowInterCityTrainList={setShowInterCityTrainList} />;
      case NavigationTab.Tickets:
        return <TicketsScreen />;
      case NavigationTab.Notifications:
        return <NotificationsScreen setActiveTab={handleSetActiveTab} />;
      case NavigationTab.Promotion:
        return (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            Promotion Screen - Coming Soon
          </div>
        );
      case NavigationTab.Account:
        return <AccountScreen />;
      default:
        return <DashboardScreen setActiveTab={handleSetActiveTab} />;
    }
  };

  return (
    <div className="bg-gray-200 dark:bg-black min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm h-[800px] max-h-[90vh] bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 dark:bg-black rounded-b-xl z-20"></div>

        <header className="relative flex items-center justify-between p-4 pt-8 bg-gradient-to-tr from-purple-600 to-blue-600 backdrop-blur-sm z-10">
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
            <button
              onClick={browserSupportsSpeechRecognition ? () => {
                if (listening) {
                  SpeechRecognition.stopListening();
                } else {
                  SpeechRecognition.startListening({ continuous: true, language: "id-ID" });
                }
              } : undefined}
              disabled={!browserSupportsSpeechRecognition}
              className={`relative p-3 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
                browserSupportsSpeechRecognition
                  ? listening
                    ? 'bg-green-500/60 hover:bg-green-600/60'
                    : 'bg-white/20 hover:bg-white/20'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              title={browserSupportsSpeechRecognition 
                ? (listening ? 'Berhenti Perintah Suara' : 'Mulai Perintah Suara')
                : 'Pengenalan suara tidak didukung'
              }
            >
              {listening && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-pulse" style={{animationDelay: '1s'}}></div>
                </>
              )}
              
              {listening ? (
                <svg className="w-5 h-5 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 12 L4 6 L6 18 L8 2 L10 16 L12 4 L14 20 L16 6 L18 12 L20 8 L22 16 L24 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
            
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

        {voiceCommandFeedback && (
          <div className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-lg shadow-lg animate-pulse ${
            isProcessingAI 
              ? 'bg-blue-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {isProcessingAI ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">{voiceCommandFeedback}</span>
            </div>
          </div>
        )}

        <main className="flex-grow overflow-y-auto pb-20">
          {renderScreen()}
        </main>

        {activeTab !== NavigationTab.Notifications && (
          <BottomNavBar activeTab={activeTab} setActiveTab={handleSetActiveTab} />
        )}
      </div>
    </div>
  );
};

export default App;