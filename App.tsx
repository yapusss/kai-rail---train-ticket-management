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

        {/* Voice Command Status */}
        <div className="px-4 pb-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Voice Command: </span>
          {browserSupportsSpeechRecognition ? (
            <span className={listening ? "text-green-600" : "text-red-600"}>
              {listening ? "Mendengarkan..." : "Tidak aktif"}
            </span>
          ) : (
            <span className="text-red-600">Browser tidak mendukung</span>
          )}
          <br />
          <span>Perintah terakhir: "{transcript}"</span>
          <button
            className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-800 rounded text-xs"
            onClick={resetTranscript}
          >
            Reset
          </button>
          <button
            className="ml-2 px-2 py-1 bg-blue-200 dark:bg-blue-800 rounded text-xs"
            onClick={() =>
              SpeechRecognition.startListening({
                continuous: true,
                language: "id-ID",
              })
            }
          >
            Aktifkan Voice Command
          </button>
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
