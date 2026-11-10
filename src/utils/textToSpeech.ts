// Web Speech API wrapper for assistive audio departure announcements

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speakDepartureAnnouncement(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) {
      resolve(false);
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-CO'; // Colombian Spanish preferred
      utterance.rate = 0.95; // Slightly measured pace for maximum clarity
      utterance.pitch = 1.0;

      // Try to find a Latin American or Spanish voice
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice =
        voices.find((v) => v.lang === 'es-CO') ||
        voices.find((v) => v.lang.startsWith('es-419')) ||
        voices.find((v) => v.lang.startsWith('es'));

      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);
    } catch {
      resolve(false);
    }
  });
}

export function stopSpeech(): void {
  if (isSpeechSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
