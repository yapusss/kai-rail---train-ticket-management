

import { accessibilityService } from './accessibilityService';

class VoiceConflictManager {
  private isVoiceCommandActive = false;
  private isAccessibilitySpeaking = false;
  private accessibilityPaused = false;
  private pendingAccessibilityQueue: string[] = [];
  private voiceCommandDisabled = false;


  startAccessibilitySpeech() {
    this.isAccessibilitySpeaking = true;
    this.voiceCommandDisabled = true;
    
    this.disableAllVoiceCommands();
  }


  endAccessibilitySpeech() {
    this.isAccessibilitySpeaking = false;
    
    setTimeout(() => {
      this.voiceCommandDisabled = false;
      this.enableAllVoiceCommands();
    }, 1000);
  }


  startVoiceCommand() {
    this.isVoiceCommandActive = true;
    
    if (accessibilityService.isSpeaking()) {
      accessibilityService.pauseSpeech();
      this.accessibilityPaused = true;
    }
  }


  endVoiceCommand() {
    this.isVoiceCommandActive = false;
    
    if (this.accessibilityPaused) {
      accessibilityService.resumeSpeech();
      this.accessibilityPaused = false;
    }
    
    this.processPendingAccessibility();
  }


  isVoiceCommandActive(): boolean {
    return this.isVoiceCommandActive;
  }


  isAccessibilitySpeaking(): boolean {
    return this.isAccessibilitySpeaking;
  }

 eCommandDisabled(): boolean {
    return this.voiceCommandDisabled;
  }

 
  queueAccessibilityAnnouncement(text: string) {
    if (this.isVoiceCommandActive) {
      this.pendingAccessibilityQueue.push(text);
    } else {
      this.startAccessibilitySpeech();
      accessibilityService.speak(text);
      setTimeout(() => {
        this.endAccessibilitySpeech();
      }, this.estimateSpeechDuration(text));
    }
  }

 
  private estimateSpeechDuration(text: string): number {
    const words = text.split(' ').length;
    const estimatedSeconds = Math.ceil(words / 2.5);
    return Math.max(estimatedSeconds * 1000, 2000); 
  }

  private processPendingAccessibility() {
    if (this.pendingAccessibilityQueue.length > 0) {
      setTimeout(() => {
        const nextAnnouncement = this.pendingAccessibilityQueue.shift();
        if (nextAnnouncement) {
          this.startAccessibilitySpeech();
          accessibilityService.speak(nextAnnouncement);
          setTimeout(() => {
            this.endAccessibilitySpeech();
          }, this.estimateSpeechDuration(nextAnnouncement));
        }
      }, 500);
    }
  }

 
  private disableAllVoiceCommands() {
    if (typeof window !== 'undefined') {
      window.disableVoiceCommands = true;
    }
  }

  
  private enableAllVoiceCommands() {
    if (typeof window !== 'undefined') {
      window.disableVoiceCommands = false;
    }
  }

 
  clearPendingQueue() {
    this.pendingAccessibilityQueue = [];
  }


  forceStopAll() {
    this.isVoiceCommandActive = false;
    this.isAccessibilitySpeaking = false;
    this.accessibilityPaused = false;
    this.voiceCommandDisabled = false;
    accessibilityService.stopSpeech();
    this.clearPendingQueue();
    this.enableAllVoiceCommands();
  }
}

export const voiceConflictManager = new VoiceConflictManager();
export default voiceConflictManager;
