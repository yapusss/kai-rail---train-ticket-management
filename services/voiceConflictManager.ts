/**
 * Voice Conflict Manager
 * Mengelola konflik antara voice command dan accessibility talkback
 * Memastikan voice command tidak "mendengar" suara dari talkback
 */

import { accessibilityService } from './accessibilityService';

class VoiceConflictManager {
  private isVoiceCommandActive = false;
  private isAccessibilitySpeaking = false;
  private accessibilityPaused = false;
  private pendingAccessibilityQueue: string[] = [];
  private voiceCommandDisabled = false;

  /**
   * Memulai accessibility speech - disable voice command
   */
  startAccessibilitySpeech() {
    this.isAccessibilitySpeaking = true;
    this.voiceCommandDisabled = true;
    
    // Disable semua voice command recognition
    this.disableAllVoiceCommands();
  }

  /**
   * Mengakhiri accessibility speech - enable voice command kembali
   */
  endAccessibilitySpeech() {
    this.isAccessibilitySpeaking = false;
    
    // Delay sedikit sebelum enable voice command
    setTimeout(() => {
      this.voiceCommandDisabled = false;
      this.enableAllVoiceCommands();
    }, 1000); // 1 detik delay untuk memastikan speech benar-benar selesai
  }

  /**
   * Memulai voice command - pause accessibility
   */
  startVoiceCommand() {
    this.isVoiceCommandActive = true;
    
    // Pause accessibility jika sedang berbicara
    if (accessibilityService.isSpeaking()) {
      accessibilityService.pauseSpeech();
      this.accessibilityPaused = true;
    }
  }

  /**
   * Mengakhiri voice command - resume accessibility
   */
  endVoiceCommand() {
    this.isVoiceCommandActive = false;
    
    // Resume accessibility jika sebelumnya di-pause
    if (this.accessibilityPaused) {
      accessibilityService.resumeSpeech();
      this.accessibilityPaused = false;
    }
    
    // Proses queue accessibility yang tertunda
    this.processPendingAccessibility();
  }

  /**
   * Cek apakah voice command sedang aktif
   */
  isVoiceCommandActive(): boolean {
    return this.isVoiceCommandActive;
  }

  /**
   * Cek apakah accessibility sedang berbicara
   */
  isAccessibilitySpeaking(): boolean {
    return this.isAccessibilitySpeaking;
  }

  /**
   * Cek apakah voice command di-disable
   */
  isVoiceCommandDisabled(): boolean {
    return this.voiceCommandDisabled;
  }

  /**
   * Menambahkan announcement ke queue jika voice command aktif
   */
  queueAccessibilityAnnouncement(text: string) {
    if (this.isVoiceCommandActive) {
      this.pendingAccessibilityQueue.push(text);
    } else {
      // Langsung announce jika tidak ada voice command
      this.startAccessibilitySpeech();
      accessibilityService.speak(text);
      // Set timeout untuk end accessibility speech
      setTimeout(() => {
        this.endAccessibilitySpeech();
      }, this.estimateSpeechDuration(text));
    }
  }

  /**
   * Estimasi durasi speech berdasarkan panjang teks
   */
  private estimateSpeechDuration(text: string): number {
    // Estimasi: 150 kata per menit = 2.5 kata per detik
    const words = text.split(' ').length;
    const estimatedSeconds = Math.ceil(words / 2.5);
    return Math.max(estimatedSeconds * 1000, 2000); // Minimal 2 detik
  }

  /**
   * Memproses queue accessibility yang tertunda
   */
  private processPendingAccessibility() {
    if (this.pendingAccessibilityQueue.length > 0) {
      // Delay sedikit untuk memastikan voice command benar-benar selesai
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

  /**
   * Disable semua voice command recognition
   */
  private disableAllVoiceCommands() {
    // Disable global voice command di App.tsx
    if (typeof window !== 'undefined') {
      window.disableVoiceCommands = true;
    }
  }

  /**
   * Enable semua voice command recognition
   */
  private enableAllVoiceCommands() {
    // Enable global voice command di App.tsx
    if (typeof window !== 'undefined') {
      window.disableVoiceCommands = false;
    }
  }

  /**
   * Clear semua queue yang tertunda
   */
  clearPendingQueue() {
    this.pendingAccessibilityQueue = [];
  }

  /**
   * Force stop semua voice activity
   */
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

// Export singleton instance
export const voiceConflictManager = new VoiceConflictManager();
export default voiceConflictManager;
