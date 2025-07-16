// Audio Module - Handles all sound and metronome functionality
let metronomeTimer = null;
let metronomeBeat = 0; // counts from 0 to 3 for each bar
let BEAT_INTERVAL = 600; // Will be set by main.js

// DOM elements (will be set by main.js)
let metronome = null;

// Initialize the audio module with DOM elements and settings
export function initAudio(metronomeElement, beatInterval) {
  metronome = metronomeElement;
  BEAT_INTERVAL = beatInterval;
}

// Update beat interval when speed changes
export function setBeatInterval(interval) {
  BEAT_INTERVAL = interval;
}

// Start the metronome
export function startMetronome() {
  stopMetronome();
  metronomeBeat = 0;
  metronomeTick();
  metronomeTimer = setInterval(metronomeTick, BEAT_INTERVAL);
}

// Stop the metronome
export function stopMetronome() {
  if (metronomeTimer !== null) {
    clearInterval(metronomeTimer);
    metronomeTimer = null;
  }
}

// Handle each metronome tick
function metronomeTick() {
  if (!metronome) return; // Safety check
  
  if (metronomeBeat === 0) {
    metronome.style.background = "#ff0";
    playTickSound(true); // Accent on beat 1
  } else {
    metronome.style.background = "#ccc";
    playTickSound(false);
  }
  
  metronome.textContent = (metronomeBeat + 1);
  metronomeBeat = (metronomeBeat + 1) % 4;
}

// Play a metronome tick sound
export function playTickSound(accent = false) {
  if (!window.AudioContext && !window.webkitAudioContext) return;
  
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();
  
  // Higher pitch and volume for accented beats
  osc.frequency.value = accent ? 1400 : 1000;
  gainNode.gain.value = accent ? 0.22 : 0.14;
  
  osc.connect(gainNode).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.055);
  osc.onended = () => ctx.close();
}

// Get current metronome state (for debugging)
export function getMetronomeState() {
  return {
    isRunning: metronomeTimer !== null,
    currentBeat: metronomeBeat,
    beatInterval: BEAT_INTERVAL
  };
}