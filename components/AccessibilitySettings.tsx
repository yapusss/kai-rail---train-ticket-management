import React, { useState } from 'react';
import { useAccessibility } from '../hooks/useAccessibility';
import { voiceConflictManager } from '../services/voiceConflictManager';
import AccessibilityDebug from './AccessibilityDebug';

interface AccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, isSupported, announceSuccess } = useAccessibility();
  const [localSettings, setLocalSettings] = useState(settings);
  const [showDebug, setShowDebug] = useState(false);

  const handleSave = () => {
    updateSettings(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings = {
      enabled: true,
      voiceEnabled: true,
      announcementDelay: 1000,
      voiceRate: 1.0,
      voicePitch: 1.0,
      voiceVolume: 0.8
    };
    setLocalSettings(defaultSettings);
    updateSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Pengaturan Aksesibilitas
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

        {!isSupported && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Browser Anda tidak mendukung fitur text-to-speech. Beberapa fitur aksesibilitas mungkin tidak berfungsi.
            </p>
          </div>
        )}

        <div className="space-y-6">
{}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Aktifkan Aksesibilitas
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mengaktifkan fitur talkback dan announcement
              </p>
            </div>
            <button
              onClick={() => setLocalSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                localSettings.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  localSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

{}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              Manajemen Konflik Suara
            </h4>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-3">
              Mengatasi konflik antara voice command dan accessibility talkback
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => voiceConflictManager.forceStopAll()}
                className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
              >
                Stop Semua Suara
              </button>
              <button
                onClick={() => voiceConflictManager.clearPendingQueue()}
                className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
              >
                Clear Queue
              </button>
              <button
                onClick={() => {
                  console.log('Testing accessibility speech...');
                  announceSuccess('Test suara accessibility berhasil!');
                }}
                className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Test Suara
              </button>
              <button
                onClick={() => setShowDebug(true)}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              >
                Debug
              </button>
            </div>
          </div>

{}

          {localSettings.enabled && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Pengaturan Suara
                </h3>

{}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kecepatan Bicara: {localSettings.voiceRate.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={localSettings.voiceRate}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, voiceRate: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Lambat</span>
                    <span>Cepat</span>
                  </div>
                </div>

{}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nada Suara: {localSettings.voicePitch.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={localSettings.voicePitch}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, voicePitch: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Rendah</span>
                    <span>Tinggi</span>
                  </div>
                </div>

{}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Volume: {Math.round(localSettings.voiceVolume * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={localSettings.voiceVolume}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, voiceVolume: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Pelan</span>
                    <span>Keras</span>
                  </div>
                </div>

{}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Delay Announcement: {localSettings.announcementDelay}ms
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={localSettings.announcementDelay}
                    onChange={(e) => setLocalSettings(prev => ({ ...prev, announcementDelay: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>Cepat</span>
                    <span>Lambat</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

{}
        <div className="flex gap-3 mt-8">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Simpan
          </button>
        </div>
      </div>

      <AccessibilityDebug 
        isOpen={showDebug} 
        onClose={() => setShowDebug(false)} 
      />
    </div>
  );
};

export default AccessibilitySettings;
