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
        <header className="flex items-center justify-between p-4 pt-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
          <h1 className="text-xl font-bold text-red-600 dark:text-red-400">
            Access by KAI
          </h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === "light" ? (
              <MoonIcon className="w-6 h-6" />
            ) : (
              <SunIcon className="w-6 h-6" />
            )}
          </button>
        </header>

        {/* Voice Command Button - pojok kanan atas */}
        <div className="absolute top-6 right-6 z-30">
          {browserSupportsSpeechRecognition ? (
            <button
              className={`rounded-full w-14 h-14 flex items-center justify-center shadow-lg border-2 transition-colors duration-200 ${
                listening && voiceActive
                  ? "bg-red-500 border-red-600"
                  : "bg-green-500 border-green-600"
              } hover:scale-105`}
              title={
                listening && voiceActive
                  ? "Matikan Voice Command"
                  : "Aktifkan Voice Command"
              }
              onClick={() => {
                if (listening && voiceActive) {
                  setVoiceActive(false);
                  SpeechRecognition.stopListening();
                } else {
                  SpeechRecognition.stopListening();
                  setVoiceActive(true);
                  SpeechRecognition.startListening({
                    continuous: true,
                    language: "id-ID",
                  });
                }
              }}
            >
              {listening && voiceActive ? (
                // Ikon silang (matikan)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                // Ikon mic Material Design (aktifkan)
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zm5 9a1 1 0 0 1 2 0c0 3.31-2.69 6-6 6s-6-2.69-6-6a1 1 0 0 1 2 0c0 2.21 1.79 4 4 4s4-1.79 4-4zm-5 8v2h2v-2h-2z" />
                </svg>
              )}
            </button>
          ) : (
            <span className="text-red-600">Browser tidak mendukung</span>
          )}
        </div>

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
