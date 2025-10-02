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

        {/* Voice Command Status */}
        <div className="px-4 pb-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow flex flex-col items-center py-3 px-4 mb-2 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                Voice Command
              </span>
              {browserSupportsSpeechRecognition ? (
                <span
                  className={
                    listening && voiceActive
                      ? "flex items-center gap-1 text-green-600"
                      : "flex items-center gap-1 text-red-600"
                  }
                >
                  {listening && voiceActive ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18v2m0-2a6 6 0 006-6V9a6 6 0 10-12 0v3a6 6 0 006 6zm0 0v2"
                        />
                      </svg>
                      <span>Mendengarkan...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18v2m0-2a6 6 0 006-6V9a6 6 0 10-12 0v3a6 6 0 006 6zm0 0v2M9 9v3a3 3 0 006 0V9"
                        />
                      </svg>
                      <span>Tidak aktif</span>
                    </>
                  )}
                </span>
              ) : (
                <span className="text-red-600">Browser tidak mendukung</span>
              )}
            </div>
            <div className="flex gap-2 w-full justify-center">
              <button
                className="flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded shadow text-xs transition"
                onClick={() => {
                  SpeechRecognition.stopListening();
                  setVoiceActive(true);
                  SpeechRecognition.startListening({
                    continuous: true,
                    language: "id-ID",
                  });
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Aktifkan
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded shadow text-xs transition"
                onClick={() => setVoiceActive(false)}
                disabled={!voiceActive}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
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
                Matikan
              </button>
            </div>
          </div>
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
