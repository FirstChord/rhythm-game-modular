// Main Game Controller
import { initAudio, startMetronome, stopMetronome, setBeatInterval, playTickSound } from './modules/audio.js';
import { 
  setSelectedLevel, 
  getCurrentPattern, 
  nextPattern, 
  getPatternInfo,
  getPatternsForLevel 
} from './modules/patterns.js';
import {
  initGameState,
  setGameMode,
  setSpeed as setGameSpeed,
  setLevel,
  setTotalGames,
  startNewGame,
  endGame,
  resetSession,
  getStateSnapshot,
  getSessionStats,
  isSessionComplete,
  debugState
} from './modules/gameState.js';

// TODO: Import other modules as we build them
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
let modeSingle = null;
let modeMulti = null;
let numGamesInput = null;

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
  modeSingle = document.getElementById('modeSingle');
  modeMulti = document.getElementById('modeMulti');
  numGamesInput = document.getElementById('numGames');
  
  // Initialize game state
  const initialConfig = {
    mode: modeSingle && modeSingle.checked ? 'single' : 'multi',
    speed: speed,
    selectedLevel: levelSelect ? levelSelect.value : 'beginner',
    totalGames: numGamesInput ? parseInt(numGamesInput.value, 10) || 3 : 3
  };
  initGameState(initialConfig);
  
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
  
  // Show initial game state
  console.log('🎮 Initial game state:', getStateSnapshot());
  
  // Add test buttons for development
  addTestButtons();
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
  setGameSpeed(newSpeed); // Update game state
  
  console.log(`🎼 Speed changed to: ${speed} (${BPM} BPM)`);
  console.log('🎮 Updated game state:', getStateSnapshot());
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

// Test function for game state management
function testGameState() {
  console.log('🧪 Testing Game State Management...');
  
  // Start a new game
  startNewGame();
  console.log('📊 After starting game:', getSessionStats());
  
  // Simulate some gameplay...
  setTimeout(() => {
    endGame();
    console.log('📊 After ending game:', getSessionStats());
    
    // Start another game
    if (!isSessionComplete()) {
      console.log('🎮 Starting game 2...');
      startNewGame();
    }
  }, 2000);
}

// Add test buttons functionality
function addTestButtons() {
  // Create a test area
  const testArea = document.createElement('div');
  testArea.style.marginTop = '20px';
  testArea.style.padding = '10px';
  testArea.style.backgroundColor = '#f9f9f9';
  testArea.style.borderRadius = '5px';
  
  const title = document.createElement('h3');
  title.textContent = 'Game State Tests';
  title.style.margin = '0 0 10px 0';
  testArea.appendChild(title);
  
  // Test Game State button
  const testStateBtn = document.createElement('button');
  testStateBtn.textContent = 'Test Game State';
  testStateBtn.onclick = testGameState;
  testStateBtn.style.margin = '5px';
  testArea.appendChild(testStateBtn);
  
  // Reset Session button
  const resetSessionBtn = document.createElement('button');
  resetSessionBtn.textContent = 'Reset Session';
  resetSessionBtn.onclick = () => {
    resetSession();
    console.log('🔄 Session reset. Stats:', getSessionStats());
  };
  resetSessionBtn.style.margin = '5px';
  testArea.appendChild(resetSessionBtn);
  
  // Show Stats button
  const showStatsBtn = document.createElement('button');
  showStatsBtn.textContent = 'Show Stats';
  showStatsBtn.onclick = () => {
    console.log('📊 Current Stats:', getSessionStats());
    console.log('🎮 Game State:', getStateSnapshot());
  };
  showStatsBtn.style.margin = '5px';
  testArea.appendChild(showStatsBtn);
  
  // Add after the reset button
  if (resetButton && resetButton.parentNode) {
    resetButton.parentNode.insertBefore(testArea, resetButton.nextSibling);
  }
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