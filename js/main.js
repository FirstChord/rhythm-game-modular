// Main Game Controller
import { initAudio, startMetronome, stopMetronome, setBeatInterval, playTickSound } from './modules/audio.js';
import { 
  setSelectedLevel, 
  getCurrentPattern, 
  nextPattern, 
  getPatternInfo,
  getPatternsForLevel 
} from './modules/patterns.js';

// TODO: Import other modules as we build them
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
let resetButton = null;
let speedSlow = null;
let speedMedium = null;
let speedFast = null;
let levelSelect = null;

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎵 Rhythm Game Loading...');
  
  // Get DOM elements
  metronome = document.getElementById('metronome');
  startButton = document.getElementById('startButton');
  resetButton = document.getElementById('resetButton');
  speedSlow = document.getElementById('speedSlow');
  speedMedium = document.getElementById('speedMedium');
  speedFast = document.getElementById('speedFast');
  levelSelect = document.getElementById('levelSelect');
  
  // Initialize audio module
  initAudio(metronome, BEAT_INTERVAL);
  
  // Initialize patterns module
  if (levelSelect) {
    setSelectedLevel(levelSelect.value);
  }
  
  // Show reset button for pattern testing
  if (resetButton) {
    resetButton.style.display = "inline-block";
    resetButton.textContent = "Next Pattern";
  }
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('✅ Game initialized successfully!');
  console.log(`🎼 Current tempo: ${BPM} BPM (${speed})`);
  
  // Show initial pattern info
  const patternInfo = getPatternInfo();
  console.log(`🎵 Pattern info:`, patternInfo);
  console.log(`📊 ${patternInfo.totalInLevel} patterns available for ${patternInfo.level} level`);
});

function setupEventListeners() {
  // Start button
  if (startButton) {
    startButton.addEventListener('click', testMetronome);
  }
  
  // Reset/Next Pattern button
  if (resetButton) {
    resetButton.addEventListener('click', testNextPattern);
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
  
  // Level selection
  if (levelSelect) {
    levelSelect.addEventListener('change', function() {
      const newLevel = levelSelect.value;
      setSelectedLevel(newLevel);
      const patternInfo = getPatternInfo();
      console.log(`🎯 Level changed to: ${newLevel}`);
      console.log(`📊 ${patternInfo.totalInLevel} patterns available`);
      console.log(`🎵 Current pattern:`, patternInfo.currentPattern);
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

// Test function to cycle through patterns
function testNextPattern() {
  const newPattern = nextPattern();
  const patternInfo = getPatternInfo();
  console.log(`🔄 Next pattern (${patternInfo.currentIndex + 1}/${patternInfo.totalInLevel}):`);
  console.log('🎵 Pattern data:', newPattern);
  
  // Show a summary of the pattern
  const noteCount = newPattern.filter(note => !note.isBarline && !note.rest).length;
  const restCount = newPattern.filter(note => !note.isBarline && note.rest).length;
  const barCount = newPattern.filter(note => note.isBarline).length + 1; // +1 for last bar
  
  console.log(`📋 Summary: ${noteCount} notes, ${restCount} rests, ${barCount} bar(s)`);
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