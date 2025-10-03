import React, { useState, useEffect } from 'react';
import { accessibilityService } from '../services/accessibilityService';

interface AccessibilityDebugProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilityDebug: React.FC<AccessibilityDebugProps> = ({ isOpen, onClose }) => {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [testText, setTestText] = useState('Halo, ini adalah test suara accessibility');

  useEffect(() => {
    if (isOpen) {
      const info = {
        settings: accessibilityService.getSettings(),
        isSupported: accessibilityService.isSpeechSupported(),
        voices: accessibilityService.getAvailableVoices(),
        speechSynthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
        userAgent: navigator.userAgent
      };
      setDebugInfo(info);
    }
  }, [isOpen]);

  const testSpeech = () => {
    console.log('Debug: Testing speech with text:', testText);
    accessibilityService.speak(testText);
  };

  const testAnnouncement = () => {
    console.log('Debug: Testing page announcement');
    accessibilityService.announcePage({
      pageTitle: "Test Page",
      pageDescription: "Halaman test untuk debugging accessibility",
      availableActions: ["test action 1", "test action 2"],
      voiceInstructions: "Ini adalah instruksi test"
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Accessibility Debug
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Debug Info */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3">Debug Information</h3>
            <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          {/* Test Controls */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 dark:text-white">Test Controls</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Test Text
              </label>
              <input
                type="text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={testSpeech}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Test Speech
              </button>
              <button
                onClick={testAnnouncement}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Test Announcement
              </button>
              <button
                onClick={() => accessibilityService.stopSpeech()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Stop Speech
              </button>
            </div>
          </div>

          {/* Browser Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Browser Support</h4>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              <p>Speech Synthesis: {debugInfo.speechSynthesis ? '✅ Supported' : '❌ Not Supported'}</p>
              <p>Available Voices: {debugInfo.voices?.length || 0}</p>
              <p>User Agent: {debugInfo.userAgent}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">Troubleshooting</h4>
            <div className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
              <p>1. Buka Developer Console (F12) untuk melihat log</p>
              <p>2. Pastikan browser mendukung Speech Synthesis</p>
              <p>3. Cek apakah accessibility enabled di settings</p>
              <p>4. Test dengan tombol "Test Speech" di atas</p>
              <p>5. Pastikan volume browser tidak muted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityDebug;
