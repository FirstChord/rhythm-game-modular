// Audio Module - Handles all sound and metronome functionality
let metronomeTimer = null;
let metronomeBeat = 0; // counts from 0 to 3 for each bar
let BEAT_INTERVAL = 600; // Will be set by main.js
let metronomeStartTime = 0; // High-precision start time
let expectedBeatTime = 0; // When the next beat should occur
let audioContext = null; // Web Audio API context

// DOM elements (will be set by main.js)
let metronome = null;

// Initialize the audio module with DOM elements and settings
export function initAudio(metronomeElement, beatInterval) {
  metronome = metronomeElement;
  BEAT_INTERVAL = beatInterval;
  
  // Initialize Web Audio API context
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    console.log('🎵 Audio context initialized:', audioContext.state);
    
    // Auto-resume audio context if suspended (required by browsers)
    if (audioContext.state === 'suspended') {
      console.log('🎵 Audio context suspended, will resume on first user interaction');
      
      // Add click listener to resume audio context
      const resumeAudio = () => {
        if (audioContext.state === 'suspended') {
          audioContext.resume().then(() => {
            console.log('🎵 Audio context resumed:', audioContext.state);
            
            // Update timing diagnostics with audio context
            if (window.timingDiagnostics) {
              window.timingDiagnostics.audioContext = audioContext;
            }
          });
        }
      };
      
      // Try to resume on various user interactions
      document.addEventListener('click', resumeAudio, { once: true });
      document.addEventListener('keydown', resumeAudio, { once: true });
      document.addEventListener('touchstart', resumeAudio, { once: true });
    }
    
    // Update timing diagnostics with audio context
    if (window.timingDiagnostics) {
      window.timingDiagnostics.audioContext = audioContext;
    }
  } catch (error) {
    console.warn('⚠️ Web Audio API not available:', error);
  }
}

// Get audio context for timing diagnostics
export function getAudioContext() {
  return audioContext;
}

// Update beat interval when speed changes
export function setBeatInterval(interval) {
  BEAT_INTERVAL = interval;
}

// Start the metronome with drift-free timing
export function startMetronome() {
  stopMetronome();
  metronomeBeat = 0;
  metronomeStartTime = performance.now();
  expectedBeatTime = metronomeStartTime;
  
  // Play first beat immediately
  metronomeTick();
  
  // Schedule subsequent beats using precise timing
  scheduleNextBeat();
}

// Stop the metronome
export function stopMetronome() {
  if (metronomeTimer !== null) {
    clearTimeout(metronomeTimer);
    metronomeTimer = null;
  }
}

// Schedule the next beat with drift correction
function scheduleNextBeat() {
  expectedBeatTime += BEAT_INTERVAL;
  const currentTime = performance.now();
  const timeUntilBeat = expectedBeatTime - currentTime;
  
  // Schedule the next beat, correcting for any drift
  metronomeTimer = setTimeout(() => {
    metronomeTick();
    scheduleNextBeat();
  }, Math.max(0, timeUntilBeat));
}

// Handle each metronome tick
function metronomeTick() {
  if (!metronome) return; // Safety check
  
  const currentTime = performance.now();
  console.log(`🎵 Metronome tick at ${currentTime.toFixed(0)}ms (expected: ${expectedBeatTime.toFixed(0)}ms, drift: ${(currentTime - expectedBeatTime).toFixed(0)}ms)`);
  
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

// Get the metronome start time for synchronization
export function getMetronomeStartTime() {
  return metronomeStartTime;
}

// Get the current beat number (0-3)
export function getCurrentBeat() {
  return metronomeBeat;
}

// Calculate the time of a specific beat
export function getBeatTime(beatIndex) {
  return metronomeStartTime + (beatIndex * BEAT_INTERVAL);
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