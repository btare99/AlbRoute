// ─── Voice Service ───────────────────────────────────────────────────────────
// Uses @capacitor-community/text-to-speech for native TTS.
// Debounces calls (3s minimum between announcements).
// Falls back to Web Speech API on browsers that don't support Capacitor.
// All Capacitor imports are lazy to avoid SSR crashes.

let lastSpeakTime = 0;
const DEBOUNCE_MS = 3000;
let isSpeaking = false;

/** Lazy-load Capacitor modules (avoids SSR crash) */
async function getCapacitor() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    return Capacitor;
  } catch {
    return null;
  }
}

async function getTTS() {
  try {
    const { TextToSpeech } = await import('@capacitor-community/text-to-speech');
    return TextToSpeech;
  } catch {
    return null;
  }
}

/**
 * Speak a text instruction via TTS.
 * Debounces to prevent repeated announcements within 3 seconds.
 */
export async function speak(text: string, lang: string = 'en-US'): Promise<void> {
  if (!text || text.trim().length === 0) return;

  const now = Date.now();
  if (now - lastSpeakTime < DEBOUNCE_MS) return;
  if (isSpeaking) return;

  lastSpeakTime = now;
  isSpeaking = true;

  try {
    const Capacitor = await getCapacitor();
    if (Capacitor?.isNativePlatform()) {
      const TTS = await getTTS();
      if (TTS) {
        await TTS.speak({
          text,
          lang,
          rate: 1.0,
          pitch: 1.0,
          volume: 1.0,
          category: 'playback',
        });
      }
    } else {
      // Fallback: Web Speech API for browser dev
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  } catch (err) {
    console.warn('[VoiceService] TTS error:', err);
  } finally {
    isSpeaking = false;
  }
}

/**
 * Stop any ongoing speech.
 */
export async function stopSpeaking(): Promise<void> {
  try {
    const Capacitor = await getCapacitor();
    if (Capacitor?.isNativePlatform()) {
      const TTS = await getTTS();
      if (TTS) await TTS.stop();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  } catch (err) {
    console.warn('[VoiceService] Stop error:', err);
  }
  isSpeaking = false;
}

/**
 * Reset the debounce timer (useful when starting a new navigation session).
 */
export function resetDebounce(): void {
  lastSpeakTime = 0;
  isSpeaking = false;
}
