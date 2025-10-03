import { useEffect, useState } from 'react';
import { accessibilityService, AccessibilitySettings, PageAnnouncement } from '../services/accessibilityService';


export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>(accessibilityService.getSettings());
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    console.log('useAccessibility: Initializing...');
    
    accessibilityService.loadSettings();
    const loadedSettings = accessibilityService.getSettings();
    console.log('useAccessibility: Loaded settings:', loadedSettings);
    setSettings(loadedSettings);
    
    const supported = accessibilityService.isSpeechSupported();
    console.log('useAccessibility: Speech synthesis supported:', supported);
    setIsSupported(supported);

    return () => {
      accessibilityService.stopSpeech();
    };
  }, []);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    accessibilityService.setSettings(newSettings);
    setSettings(accessibilityService.getSettings());
  };

  const announcePage = (announcement: PageAnnouncement) => {
    console.log('useAccessibility: announcePage called with:', announcement);
    accessibilityService.announcePage(announcement);
  };

  const announceElement = (elementDescription: string, instructions?: string) => {
    accessibilityService.announceElement(elementDescription, instructions);
  };

  const announceAction = (actionDescription: string, result?: string) => {
    accessibilityService.announceAction(actionDescription, result);
  };

  const announceError = (errorMessage: string, suggestion?: string) => {
    accessibilityService.announceError(errorMessage, suggestion);
  };

  const announceSuccess = (successMessage: string) => {
    accessibilityService.announceSuccess(successMessage);
  };

  const stopSpeech = () => {
    accessibilityService.stopSpeech();
  };

  const pauseSpeech = () => {
    accessibilityService.pauseSpeech();
  };

  const resumeSpeech = () => {
    accessibilityService.resumeSpeech();
  };

  const isSpeaking = () => {
    return accessibilityService.isSpeaking();
  };

  return {
    settings,
    isSupported,
    updateSettings,
    announcePage,
    announceElement,
    announceAction,
    announceError,
    announceSuccess,
    stopSpeech,
    pauseSpeech,
    resumeSpeech,
    isSpeaking
  };
};
