/**
 * Ultralightweight Native Web Audio Synthesizer
 * Generates modern, subtle, and musical chimes for transit alerts:
 * - Departure alert (Gentle / Urgent / Test)
 * - Proximity wake-up alarm (2 stops before destination)
 * - Card turnstile contactless validation beep
 * - Status & notification bells
 * - Transfer window $0 expiration warning
 * - Emergency seismic attention tones
 *
 * 100% native in-code synthesis with zero audio asset downloads.
 */

import {
  trigger120SecondWarningHaptic,
  triggerFinalDepartureHaptic,
  triggerTestHaptic,
} from './haptics';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Departure countdown notification chimes
 */
export function playDepartureChime(
  type: 'gentle' | 'urgent' | 'test' = 'gentle',
  withHaptics = true
): void {
  try {
    const ctx = getAudioContext();
    if (ctx) {
      const now = ctx.currentTime;

      if (type === 'urgent') {
        // 3 subtle rising pulses: 587Hz (D5), 659Hz (E5), 880Hz (A5)
        const freqs = [587.33, 659.25, 880.0];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.14);

          gain.gain.setValueAtTime(0, now + i * 0.14);
          gain.gain.linearRampToValueAtTime(0.2, now + i * 0.14 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.28);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.14);
          osc.stop(now + i * 0.14 + 0.3);
        });
      } else {
        // Gentle dual chime: 523Hz (C5) and 659Hz (E5)
        const freqs = [523.25, 659.25];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.16);

          gain.gain.setValueAtTime(0, now + i * 0.16);
          gain.gain.linearRampToValueAtTime(0.18, now + i * 0.16 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.16 + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.16);
          osc.stop(now + i * 0.16 + 0.5);
        });
      }
    }
  } catch {
    // Ignore audio autoplay restrictions
  }

  // Trigger tactile vibration
  if (withHaptics) {
    if (type === 'urgent') {
      triggerFinalDepartureHaptic();
    } else if (type === 'test') {
      triggerTestHaptic();
    } else {
      trigger120SecondWarningHaptic();
    }
  }
}

/**
 * 2-Stop Proximity Wake-Up Alarm:
 * Smooth ambient arpeggio (E5 -> G#5 -> B5) with warm envelope
 */
export function playProximityAlarmChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [659.25, 830.61, 987.77]; // E5, G#5, B5 (Major triad)

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.12 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.6);
    });

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([150, 80, 150]);
    }
  } catch {
    // ignore
  }
}

/**
 * Authentic Contactless Transit Card Turnstile Beep
 * High-frequency resonant chirp (1760Hz - A6) with fast decay
 */
export function playCardTapBeep(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.085);

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(40);
    }
  } catch {
    // ignore
  }
}

/**
 * Clean Notification Bell: 880Hz with crystal 1320Hz overtone
 */
export function playNotificationChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Fundamental note (A5 - 880Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.42);

    // Harmonic overtone (E6 - 1320Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now + 0.04);
    gain2.gain.setValueAtTime(0, now + 0.04);
    gain2.gain.linearRampToValueAtTime(0.12, now + 0.04 + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.04 + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.04 + 0.38);
  } catch {
    // ignore
  }
}

/**
 * Transfer Window Expiring Warning: Gentle descending interval (440Hz -> 392Hz)
 */
export function playTransferWindowWarningChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const tones = [440, 392];

    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.38);
    });
  } catch {
    // ignore
  }
}

/**
 * Distinctive emergency earthquake / seismic safety notification sound
 * Alternating attention tones (880Hz / 660Hz) with vibration pattern
 */
export function playSeismicAlertSound(): void {
  try {
    const ctx = getAudioContext();
    if (ctx) {
      const now = ctx.currentTime;
      const sirenTones = [880, 660, 880, 660, 880];
      sirenTones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.22);

        gain.gain.setValueAtTime(0, now + idx * 0.22);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.22 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.22 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.22);
        osc.stop(now + idx * 0.22 + 0.21);
      });
    }
  } catch {
    // Ignore audio restrictions
  }

  // Tactile pattern for emergency alert
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 400]);
    } catch {
      // ignore
    }
  }
}
