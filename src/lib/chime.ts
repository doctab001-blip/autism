/**
 * Gentle Web Audio chimes: soft sine tones with a slow attack and a long decay.
 * No audio files, nothing loaded from the network, low volume, no sudden onsets.
 */

export type ChimeKind = "tap" | "star" | "celebrate";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) audioContext = new Ctor();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function bell(ctx: AudioContext, frequency: number, start: number, duration: number, peak: number) {
  const partials: [number, number][] = [
    [1, 1],
    [2, 0.22],
    [3, 0.06],
  ];
  partials.forEach(([multiple, weight]) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = frequency * multiple;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak * weight, 0.0002), start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  });
}

// C major pentatonic: calm, never dissonant.
const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;

export function playChime(kind: ChimeKind, enabled: boolean): void {
  if (!enabled) return;
  const ctx = getContext();
  if (!ctx) return;
  const t = ctx.currentTime + 0.02;
  switch (kind) {
    case "tap":
      bell(ctx, G5, t, 0.9, 0.07);
      break;
    case "star":
      bell(ctx, C5, t, 1.0, 0.07);
      bell(ctx, G5, t + 0.18, 1.3, 0.07);
      break;
    case "celebrate":
      [C5, E5, G5, C6].forEach((f, i) => bell(ctx, f, t + i * 0.2, 1.8, 0.07));
      break;
  }
}
