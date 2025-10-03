
export interface AccessibilitySettings {
  enabled: boolean;
  voiceEnabled: boolean;
  announcementDelay: number;
  voiceRate: number; 
  voicePitch: number; 
  voiceVolume: number; 
}

export interface PageAnnouncement {
  pageTitle: string;
  pageDescription: string;
  availableActions: string[];
  voiceInstructions: string;
}

class AccessibilityService {
  private settings: AccessibilitySettings = {
    enabled: true,
    voiceEnabled: true,
    announcementDelay: 1000,
    voiceRate: 1.0,
    voicePitch: 1.0,
    voiceVolume: 0.8
  };

  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.initializeSpeechSynthesis();
  }

  private initializeSpeechSynthesis() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

 
  setSettings(newSettings: Partial<AccessibilitySettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
  }

 
  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

 
  private saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessibilitySettings', JSON.stringify(this.settings));
    }
  }

 
  loadSettings() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('accessibilitySettings');
      if (saved) {
        try {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        } catch (error) {
          console.error('Error loading accessibility settings:', error);
        }
      }
    }
  }

 
  stopSpeech() {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }
  }

 
  isSpeaking(): boolean {
    return this.speechSynthesis ? this.speechSynthesis.speaking : false;
  }

  
  pauseSpeech() {
    if (this.speechSynthesis && this.speechSynthesis.speaking) {
      this.speechSynthesis.pause();
    }
  }


  resumeSpeech() {
    if (this.speechSynthesis && this.speechSynthesis.paused) {
      this.speechSynthesis.resume();
    }
  }

 
  speak(text: string, options?: Partial<AccessibilitySettings>) {
    console.log('Accessibility: Attempting to speak:', text);
    console.log('Accessibility: Settings enabled:', this.settings.enabled);
    console.log('Accessibility: Speech synthesis available:', !!this.speechSynthesis);
    
    if (!this.settings.enabled) {
      console.log('Accessibility: Disabled by settings');
      return;
    }
    
    if (!this.speechSynthesis) {
      console.log('Accessibility: Speech synthesis not available');
      return;
    }

    this.performSpeak(text, options);
  }


  private performSpeak(text: string, options?: Partial<AccessibilitySettings>) {
    console.log('Accessibility: Performing speak with text:', text);
    
    this.stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    const settings = options ? { ...this.settings, ...options } : this.settings;

    utterance.rate = settings.voiceRate;
    utterance.pitch = settings.voicePitch;
    utterance.volume = settings.voiceVolume;

    utterance.lang = 'id-ID';

    console.log('Accessibility: Utterance settings:', {
      rate: utterance.rate,
      pitch: utterance.pitch,
      volume: utterance.volume,
      lang: utterance.lang
    });

    utterance.onstart = () => {
      console.log('Accessibility: Speech started');
    };

    utterance.onend = () => {
      console.log('Accessibility: Speech ended');
    };

    utterance.onerror = (event) => {
      console.error('Accessibility: Speech error:', event.error);
    };

    this.currentUtterance = utterance;
    
    try {
      this.speechSynthesis.speak(utterance);
      console.log('Accessibility: Speech synthesis.speak() called successfully');
    } catch (error) {
      console.error('Accessibility: Error calling speech synthesis:', error);
    }
  }

 
  announcePage(announcement: PageAnnouncement) {
    console.log('Accessibility: announcePage called with:', announcement);
    
    if (!this.settings.enabled) {
      console.log('Accessibility: announcePage skipped - disabled');
      return;
    }

    const fullAnnouncement = this.buildPageAnnouncement(announcement);
    console.log('Accessibility: Full announcement text:', fullAnnouncement);
    
    setTimeout(() => {
      console.log('Accessibility: Speaking page announcement after delay');
      this.speak(fullAnnouncement);
    }, this.settings.announcementDelay);
  }


  private buildPageAnnouncement(announcement: PageAnnouncement): string {
    let text = `Anda berada di halaman ${announcement.pageTitle}. `;
    text += `${announcement.pageDescription} `;
    
    if (announcement.availableActions.length > 0) {
      text += `Di halaman ini, Anda dapat: `;
      text += announcement.availableActions.join(', ') + '. ';
    }
    
    text += announcement.voiceInstructions;
    
    return text;
  }


  announceElement(elementDescription: string, instructions?: string) {
    if (!this.settings.enabled) return;

    let text = elementDescription;
    if (instructions) {
      text += `. ${instructions}`;
    }

    this.speak(text);
  }

  
  announceAction(actionDescription: string, result?: string) {
    if (!this.settings.enabled) return;

    let text = actionDescription;
    if (result) {
      text += `. ${result}`;
    }

    this.speak(text);
  }


  announceError(errorMessage: string, suggestion?: string) {
    if (!this.settings.enabled) return;

    let text = `Perhatian: ${errorMessage}`;
    if (suggestion) {
      text += `. ${suggestion}`;
    }

    this.speak(text, { voiceRate: 0.8 }); 
  }


  announceSuccess(successMessage: string) {
    if (!this.settings.enabled) return;

    this.speak(`Berhasil: ${successMessage}`, { voiceRate: 1.1 }); 
  }


  isSpeechSupported(): boolean {
    return this.speechSynthesis !== null;
  }

 
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.speechSynthesis) return [];
    return this.speechSynthesis.getVoices();
  }


  setVoice(voiceName: string) {
    const voices = this.getAvailableVoices();
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      console.log('Voice set to:', voice.name);
    }
  }
}

export const accessibilityService = new AccessibilityService();
export default accessibilityService;
