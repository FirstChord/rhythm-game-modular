// Main Game Controller
import { initAudio, startMetronome, stopMetronome, setBeatInterval, playTickSound } from './modules/audio.js';

// TODO: Import other modules as we build them
// import { getAllPatterns } from './modules/patterns.js';
// import { initGameState } from './modules/gameState.js';
// import { setupInputHandlers } from './modules/inputHandler.js';
// import { renderPattern } from './modules/notation.js';

// Game settings
const SPEEDS = { slow: 70, medium: 100, fast: 140 };
let speed = 'medium';
let BPM = SPEEDS[speed];
let BEAT_INTERVAL = 60000 / BPM;

// DOM Elements
let metronome = null;
let startButton = null;
let speedSlow = null;
let speedMedium = null;
let speedFast = null;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎵 Rhythm Game Loading...');
  
  // Get DOM elements
  metronome = document.getElementById('metronome');
  startButton = document.getElementById('startButton');
  speedSlow = document.getElementById('speedSlow');
  speedMedium = document.getElementById('speedMedium');
  speedFast = document.getElementById('speedFast');
  
  // Initialize audio module
  initAudio(metronome, BEAT_INTERVAL);
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('✅ Game initialized successfully!');
  console.log(`🎼 Current tempo: ${BPM} BPM (${speed})`);
});

function setupEventListeners() {
  // Start button
  if (startButton) {
    startButton.addEventListener('click', testMetronome);
  }
  
  // Speed controls
  if (speedSlow) {
    speedSlow.addEventListener('change', function() { 
      if (speedSlow.checked) setSpeed('slow'); 
    });
  }
  
  if (speedMedium) {
    speedMedium.addEventListener('change', function() { 
      if (speedMedium.checked) setSpeed('medium'); 
    });
  }
  
  if (speedFast) {
    speedFast.addEventListener('change', function() { 
      if (speedFast.checked) setSpeed('fast'); 
    });
  }
  
  // Test click sound on metronome
  if (metronome) {
    metronome.addEventListener('click', function() {
      console.log('🔊 Testing click sound...');
      playTickSound(true);
    });
  }
}

function setSpeed(newSpeed) {
  speed = newSpeed;
  BPM = SPEEDS[speed];
  BEAT_INTERVAL = 60000 / BPM;
  setBeatInterval(BEAT_INTERVAL);
  
  console.log(`🎼 Speed changed to: ${speed} (${BPM} BPM)`);
}

// Test function to see if metronome works
function testMetronome() {
  console.log('🎯 Testing metronome...');
  startButton.textContent = 'Stop Metronome';
  startButton.removeEventListener('click', testMetronome);
  startButton.addEventListener('click', stopTestMetronome);
  
  startMetronome();
}

function stopTestMetronome() {
  console.log('⏹ Stopping metronome...');
  startButton.textContent = 'Start Game';
  startButton.removeEventListener('click', stopTestMetronome);
  startButton.addEventListener('click', testMetronome);
  
  stopMetronome();
  metronome.style.background = '#ccc';
  metronome.textContent = '1';
}