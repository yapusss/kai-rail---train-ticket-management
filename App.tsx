import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { NavigationTab } from "./types";
import BottomNavBar from "./components/BottomNavBar";
import DashboardScreen from "./screens/DashboardScreen";
import PlannerScreen from "./screens/PlannerScreen";
import TrainServicesScreen from "./screens/TrainServicesScreen";
import TicketsScreen from "./screens/TicketsScreen";
import AccountScreen from "./screens/AccountScreen";
import { XIcon, MicrophoneIcon } from "./components/icons/FeatureIcons";
import { SunIcon, MoonIcon } from "./components/icons/ThemeIcons";

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [activeTab, setActiveTab] = useState<NavigationTab>(
    NavigationTab.Dashboard
  );

  // Voice command setup
  const commands = [
    {
      command: ["buka dashboard", "dashboard"],
      callback: () => setActiveTab(NavigationTab.Dashboard),
    },
    {
      command: ["buka planner", "planner"],
      callback: () => setActiveTab(NavigationTab.Planner),
    },
    {
      command: ["buka layanan kereta", "layanan kereta", "train services"],
      callback: () => setActiveTab(NavigationTab.TrainServices),
    },
    {
      command: ["buka tiket", "tiket", "tickets"],
      callback: () => setActiveTab(NavigationTab.Tickets),
    },
    {
      command: ["buka akun", "akun", "account"],
      callback: () => setActiveTab(NavigationTab.Account),
    },
    {
      command: ["buka promo", "promo", "promotion"],
      callback: () => setActiveTab(NavigationTab.Promotion),
    },
    {
      command: ["ganti tema", "ubah tema", "toggle theme"],
      callback: () => toggleTheme(),
    },
  ];

  const { listening, browserSupportsSpeechRecognition } = useSpeechRecognition({
    commands,
  });

  // State untuk mengontrol voice command
  const [voiceActive, setVoiceActive] = useState(true);

  useEffect(() => {
    // Start/stop listening sesuai voiceActive
    if (browserSupportsSpeechRecognition) {
      if (voiceActive) {
        SpeechRecognition.startListening({
          continuous: true,
          language: "id-ID",
        });
      } else {
        SpeechRecognition.stopListening();
      }
    }
  }, [browserSupportsSpeechRecognition, voiceActive]);

  // Pastikan voice command aktif saat aplikasi pertama kali dibuka
  useEffect(() => {
    if (browserSupportsSpeechRecognition && !listening && voiceActive) {
      SpeechRecognition.startListening({
        continuous: true,
        language: "id-ID",
      });
    }
  }, [browserSupportsSpeechRecognition, listening, voiceActive]);

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
        return <TrainServicesScreen setActiveTab={setActiveTab} />;
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
        <header className="relative flex items-center justify-between p-4 pt-8 bg-gradient-to-r from-red-500 via-red-600 to-red-700 dark:from-red-700 dark:via-red-800 dark:to-red-900 backdrop-blur-sm z-10 shadow-lg">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-700/20 dark:from-red-700/20 dark:to-red-900/20"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-20">
            <div className="absolute top-4 left-4 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-8 right-8 w-1 h-1 bg-white rounded-full"></div>
            <div className="absolute bottom-6 left-12 w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="absolute bottom-4 right-16 w-2 h-2 bg-white rounded-full"></div>
          </div>

          <div className="relative z-10 flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
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
              onClick={
                browserSupportsSpeechRecognition
                  ? () => {
                      if (listening) {
                        SpeechRecognition.stopListening();
                      } else {
                        SpeechRecognition.startListening({
                          continuous: true,
                          language: "id-ID",
                        });
                      }
                    }
                  : undefined
              }
              disabled={!browserSupportsSpeechRecognition}
                className={`p-3 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 ${
                  browserSupportsSpeechRecognition
                    ? listening
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gray-500 hover:bg-gray-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              title={
                browserSupportsSpeechRecognition
                  ? listening
                    ? "Stop Voice Command"
                    : "Start Voice Command"
                  : "Voice recognition not supported"
              }
            >
              <MicrophoneIcon className="w-5 h-5 text-white" />
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
