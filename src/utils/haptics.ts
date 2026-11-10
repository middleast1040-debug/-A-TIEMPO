// Web Vibration API utility for tactile / haptic feedback
// Provides distinct vibration rhythms for departure warnings and final departures

export function isHapticsSupported(): boolean {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
}

/**
 * 120-second warning haptic pattern:
 * Two distinct medium pulses indicating "2 minutes left, get ready"
 * Pattern: vibrate 180ms, pause 100ms, vibrate 180ms
 */
export function trigger120SecondWarningHaptic(): boolean {
  if (!isHapticsSupported()) return false;
  try {
    return navigator.vibrate([180, 100, 180]);
  } catch {
    return false;
  }
}

/**
 * Final departure time reached (0 seconds / "¡Sal ahora!"):
 * Urgent, persistent 3-stage pulse to alert the commuter through their pocket
 * Pattern: 350ms vibrate, 120ms pause, 350ms vibrate, 120ms pause, 600ms long vibrate
 */
export function triggerFinalDepartureHaptic(): boolean {
  if (!isHapticsSupported()) return false;
  try {
    return navigator.vibrate([350, 120, 350, 120, 600]);
  } catch {
    return false;
  }
}

/**
 * Quick preview / test haptic feedback:
 * Subtle confirmation pulse
 */
export function triggerTestHaptic(): boolean {
  if (!isHapticsSupported()) return false;
  try {
    return navigator.vibrate([150, 80, 150]);
  } catch {
    return false;
  }
}

/**
 * General haptic trigger for interactive feedback (scanner, buttons, accessibility)
 */
export function triggerHapticFeedback(type: 'success' | 'double' | 'warning' = 'success'): boolean {
  if (!isHapticsSupported()) return false;
  try {
    if (type === 'success') {
      return navigator.vibrate([100, 60, 200]);
    } else if (type === 'double') {
      return navigator.vibrate([80, 50, 80]);
    } else {
      return navigator.vibrate([200, 100, 200]);
    }
  } catch {
    return false;
  }
}

/**
 * Stop any active vibration
 */
export function cancelHaptics(): void {
  if (!isHapticsSupported()) return;
  try {
    navigator.vibrate(0);
  } catch {
    // ignore
  }
}
