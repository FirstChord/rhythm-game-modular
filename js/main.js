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
  debugState,
  getGameState,
  setKeyDown,
  addHoldPeriod,
  endHoldPeriod
} from './modules/gameState.js';
import {
  initInputHandler,
  startListening,
  stopListening,
  getInputInstructions,
  getInputState,
  simulateInput,
  emergencyStop
  // setDebugMode  // Comment out for now
} from './modules/inputHandler.js';
import {
  initNotation,
  renderPattern,
  renderCurrentPattern,
  testNotation,
  getNotationStatus,
  highlightBeat,
  highlightNextBeat,
  clearAllHighlights,
  resetBeatHighlighting,
  testBeatHighlighting,
  startRealTimeTracking,
  stopRealTimeTracking,
  advanceRealTimeBeat,
  checkTapTiming,
  showTapFeedback,
  getRealTimeState
} from './modules/notation.js';

// TODO: Import other modules as we build them

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
let tapIndicator1 = null;
let tapIndicator2 = null;

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
  tapIndicator1 = document.getElementById('tapIndicator1');
  tapIndicator2 = document.getElementById('tapIndicator2');
  
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
  
  // Initialize input handler module
  const gameStateModule = {
    getGameState,
    setKeyDown,
    addHoldPeriod,
    endHoldPeriod
  };
  const tapIndicators = {
    player1: tapIndicator1,
    player2: tapIndicator2
  };
  initInputHandler(gameStateModule, tapIndicators);
  
  // Initialize notation module
  if (!initNotation('vexflowOutput')) {
    console.error('❌ Failed to initialize VexFlow notation');
  } else {
    // Render initial pattern
    const initialPattern = getCurrentPattern();
    renderPattern(initialPattern);
    console.log('🎼 Initial pattern rendered');
    
    // Connect notation feedback to window for input handler
    window.showNotationFeedback = showTapFeedback;
  }
  
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
  
  // Show input instructions
  const currentMode = modeSingle && modeSingle.checked ? 'single' : 'multi';
  console.log('🎹 Input instructions:', getInputInstructions(currentMode));
  
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
  
  // Render the new pattern with VexFlow and reset highlighting
  if (renderPattern(newPattern)) {
    resetBeatHighlighting(); // Reset highlighting for new pattern
    console.log('🎼 Pattern notation updated');
  } else {
    console.error('❌ Failed to render pattern notation');
  }
}

// Test function specifically for multiplayer input debugging
function testMultiplayerInput() {
  console.log('🎮 Testing Multiplayer Input - Debug Mode');
  
  // Force switch to multiplayer mode
  if (modeMulti) {
    modeMulti.checked = true;
    setGameMode('multi');
  }
  
  console.log('🎯 Current mode:', getStateSnapshot().mode);
  console.log('🎹 Input instructions:', getInputInstructions('multi'));
  
  // Start a new game
  startNewGame();
  
  // Start input listening
  startListening();
  
  console.log('✅ Multiplayer test setup complete');
  console.log('🎹 Try pressing:');
  console.log('   - A key (Player 1)');
  console.log('   - Enter key (Player 2)');
  console.log('🔍 Watch console for detailed input debugging...');
  
  // Auto stop after 15 seconds
  setTimeout(() => {
    console.log('⏹ Multiplayer test ending...');
    stopListening();
    endGame();
    console.log('📊 Test complete. Check console logs above for any issues.');
  }, 15000);
}

// Test function for real-time beat tracking with metronome and input feedback
function testRealTimeBeatTracking() {
  console.log('🎯 Testing Real-Time Beat Tracking with Input Feedback!');
  
  // Get current pattern
  const currentPattern = getCurrentPattern();
  console.log('🎵 Current pattern:', currentPattern);
  
  // Start a new game
  startNewGame();
  
  // Start real-time tracking in notation
  startRealTimeTracking(currentPattern);
  
  // Start input listening
  startListening();
  
  // Start metronome
  startMetronome();
  
  console.log('🚀 Real-time tracking with input feedback started!');
  console.log('🎹 Tap along to the beat - watch for colored feedback!');
  console.log('🟢 Green = Perfect timing');
  console.log('🟡 Yellow = Good timing'); 
  console.log('🔴 Red = Missed timing');
  
  const currentMode = getStateSnapshot().mode;
  console.log(`🎯 ${getInputInstructions(currentMode)}`);
  
  // Beat tracking with input feedback
  let beatIndex = 0;
  const nonBarlineNotes = currentPattern.filter(note => !note.isBarline);
  const totalBeats = nonBarlineNotes.length;
  let expectedBeatTimes = []; // Store expected times for tap checking
  
  const trackBeat = () => {
    if (beatIndex < totalBeats) {
      const currentTime = performance.now();
      expectedBeatTimes[beatIndex] = currentTime;
      
      // Advance beat in notation
      if (advanceRealTimeBeat()) {
        console.log(`🎯 Tracking beat ${beatIndex + 1}/${totalBeats} at time ${currentTime.toFixed(2)}`);
      }
      
      beatIndex++;
      
      // Calculate timing for next beat
      const note = nonBarlineNotes[beatIndex - 1];
      let duration = BEAT_INTERVAL;
      
      if (note) {
        if (note.type === 'eighth') duration = BEAT_INTERVAL / 2;
        else if (note.type === 'sixteenth') duration = BEAT_INTERVAL / 4;
        else if (note.type === 'quarter') duration = BEAT_INTERVAL;
        
        if (note.dotted) duration *= 1.5;
      }
      
      setTimeout(trackBeat, duration);
    } else {
      // Pattern complete
      console.log('🎵 Pattern complete!');
      
      // Show final results
      setTimeout(() => {
        stopRealTimeTracking();
        stopMetronome();
        stopListening();
        endGame();
        
        // Clean up
        window.expectedBeatTimes = null;
        
        console.log('📊 Real-time tracking results:', getSessionStats());
        console.log('🎹 Input results:', getInputState());
        console.log('✅ Real-time beat tracking with feedback complete!');
      }, 1000);
    }
  };
  
  // Store expected times for tap feedback
  window.expectedBeatTimes = expectedBeatTimes; // Make available for input handler
  
  // Start tracking after a short delay
  setTimeout(trackBeat, BEAT_INTERVAL);
}

// Test function for full game loop - demonstrates all modules working together
function testFullGameLoop() {
  console.log('🎮 Testing Full Game Loop - All Modules Together!');
  console.log('🎵 Current pattern:', getCurrentPattern());
  
  // Start a new game
  startNewGame();
  
  // Start input listening
  startListening();
  
  // Start metronome
  startMetronome();
  
  console.log('🚀 Game loop started!');
  console.log('🎹 Try tapping to the metronome:');
  
  const currentMode = getStateSnapshot().mode;
  console.log(`🎯 ${getInputInstructions(currentMode)}`);
  
  // Stop after 10 seconds for demo
  setTimeout(() => {
    console.log('⏹ Demo ending...');
    stopMetronome();
    stopListening();
    endGame();
    
    console.log('📊 Final Stats:', getSessionStats());
    console.log('🎹 Final Input State:', getInputState());
    console.log('✅ Full game loop test complete!');
  }, 10000);
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
  title.textContent = 'Module Tests';
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
  
  // Start Input Listening button
  const startInputBtn = document.createElement('button');
  startInputBtn.textContent = 'Start Input';
  startInputBtn.onclick = () => {
    startListening();
    console.log('👂 Input listening started');
    console.log('🎹 Input state:', getInputState());
  };
  startInputBtn.style.margin = '5px';
  testArea.appendChild(startInputBtn);
  
  // Stop Input Listening button
  const stopInputBtn = document.createElement('button');
  stopInputBtn.textContent = 'Stop Input';
  stopInputBtn.onclick = () => {
    stopListening();
    console.log('🔇 Input listening stopped');
    console.log('🎹 Input state:', getInputState());
  };
  stopInputBtn.style.margin = '5px';
  testArea.appendChild(stopInputBtn);
  
  // Simulate Input button
  const simulateInputBtn = document.createElement('button');
  simulateInputBtn.textContent = 'Simulate Tap';
  simulateInputBtn.onclick = () => {
    const currentMode = getStateSnapshot().mode;
    console.log(`🧪 Simulating input for ${currentMode} mode...`);
    simulateInput(1, 150);
    if (currentMode === 'multi') {
      setTimeout(() => simulateInput(2, 150), 200);
    }
  };
  simulateInputBtn.style.margin = '5px';
  testArea.appendChild(simulateInputBtn);
  
  // Show Input State button
  const inputStateBtn = document.createElement('button');
  inputStateBtn.textContent = 'Input State';
  inputStateBtn.onclick = () => {
    console.log('🎹 Input State:', getInputState());
    const currentMode = getStateSnapshot().mode;
    console.log('🎯 Current Instructions:', getInputInstructions(currentMode));
  };
  inputStateBtn.style.margin = '5px';
  testArea.appendChild(inputStateBtn);
  
  // Test Full Game Loop button
  const testGameLoopBtn = document.createElement('button');
  testGameLoopBtn.textContent = 'Test Game Loop';
  testGameLoopBtn.onclick = testFullGameLoop;
  testGameLoopBtn.style.margin = '5px';
  testGameLoopBtn.style.backgroundColor = '#4CAF50';
  testGameLoopBtn.style.color = 'white';
  testGameLoopBtn.style.fontWeight = 'bold';
  testArea.appendChild(testGameLoopBtn);
  
  // Test Multiplayer Input button
  const testMultiBtn = document.createElement('button');
  testMultiBtn.textContent = 'Test Multiplayer';
  testMultiBtn.onclick = testMultiplayerInput;
  testMultiBtn.style.margin = '5px';
  testMultiBtn.style.backgroundColor = '#2196F3';
  testMultiBtn.style.color = 'white';
  testArea.appendChild(testMultiBtn);
  
  // Test VexFlow Notation button
  const testNotationBtn = document.createElement('button');
  testNotationBtn.textContent = 'Test Notation';
  testNotationBtn.onclick = () => {
    console.log('🧪 Testing VexFlow notation...');
    console.log('🎼 VexFlow status:', getNotationStatus());
    if (testNotation()) {
      console.log('✅ VexFlow test pattern rendered successfully');
    } else {
      console.error('❌ VexFlow test failed');
    }
  };
  testNotationBtn.style.margin = '5px';
  testNotationBtn.style.backgroundColor = '#9C27B0';
  testNotationBtn.style.color = 'white';
  testArea.appendChild(testNotationBtn);
  
  // Render Current Pattern button  
  const renderCurrentBtn = document.createElement('button');
  renderCurrentBtn.textContent = 'Render Current';
  renderCurrentBtn.onclick = () => {
    const currentPattern = getCurrentPattern();
    console.log('🎼 Rendering current pattern:', currentPattern);
    if (renderPattern(currentPattern)) {
      console.log('✅ Current pattern rendered successfully');
    } else {
      console.error('❌ Failed to render current pattern');
    }
  };
  renderCurrentBtn.style.margin = '5px';
  renderCurrentBtn.style.backgroundColor = '#795548';
  renderCurrentBtn.style.color = 'white';
  testArea.appendChild(renderCurrentBtn);
  
  // Beat Highlighting Test button
  const testHighlightBtn = document.createElement('button');
  testHighlightBtn.textContent = 'Test Beat Highlighting';
  testHighlightBtn.onclick = () => {
    console.log('🎯 Testing beat highlighting...');
    if (testBeatHighlighting()) {
      console.log('✅ Beat highlighting test started');
    } else {
      console.error('❌ Beat highlighting test failed');
    }
  };
  testHighlightBtn.style.margin = '5px';
  testHighlightBtn.style.backgroundColor = '#FF5722';
  testHighlightBtn.style.color = 'white';
  testArea.appendChild(testHighlightBtn);
  
  // Real-time Beat Tracking button
  const realTimeBtn = document.createElement('button');
  realTimeBtn.textContent = 'Real-Time Tracking';
  realTimeBtn.onclick = testRealTimeBeatTracking;
  realTimeBtn.style.margin = '5px';
  realTimeBtn.style.backgroundColor = '#4CAF50';
  realTimeBtn.style.color = 'white';
  realTimeBtn.style.fontWeight = 'bold';
  testArea.appendChild(realTimeBtn);
  
  // Clear Highlights button
  const clearHighlightsBtn = document.createElement('button');
  clearHighlightsBtn.textContent = 'Clear Highlights';
  clearHighlightsBtn.onclick = () => {
    clearAllHighlights();
    resetBeatHighlighting();
    stopRealTimeTracking(); // Also stop real-time tracking
    console.log('🔄 All highlights cleared');
  };
  clearHighlightsBtn.style.margin = '5px';
  clearHighlightsBtn.style.backgroundColor = '#9E9E9E';
  clearHighlightsBtn.style.color = 'white';
  clearHighlightsBtn.style.fontSize = '0.9em';
  testArea.appendChild(clearHighlightsBtn);
  
  // Test Tap Feedback button
  const testTapFeedbackBtn = document.createElement('button');
  testTapFeedbackBtn.textContent = 'Test Tap Feedback';
  testTapFeedbackBtn.onclick = () => {
    console.log('🧪 Testing tap feedback colors...');
    const notationStatus = getNotationStatus();
    // Show different feedback types on the first few beats
    if (notationStatus.notesCount >= 4) {
      showTapFeedback(0, 'perfect');
      setTimeout(() => showTapFeedback(1, 'good'), 500);
      setTimeout(() => showTapFeedback(2, 'miss'), 1000);
      setTimeout(() => clearAllHighlights(), 2000);
      console.log('✅ Tap feedback test: Perfect (green), Good (yellow), Miss (red)');
    } else {
      console.error('❌ Not enough notes to test feedback. Try rendering a pattern first.');
    }
  };
  testTapFeedbackBtn.style.margin = '5px';
  testTapFeedbackBtn.style.backgroundColor = '#673AB7';
  testTapFeedbackBtn.style.color = 'white';
  testTapFeedbackBtn.style.fontSize = '0.9em';
  testArea.appendChild(testTapFeedbackBtn);
  
  // Debug Toggle button (commented out temporarily)
  /*
  const debugToggleBtn = document.createElement('button');
  debugToggleBtn.textContent = 'Debug ON'; // DEBUG_INPUT starts as true
  debugToggleBtn.onclick = () => {
    const isCurrentlyOn = debugToggleBtn.textContent === 'Debug ON';
    setDebugMode(!isCurrentlyOn);
    debugToggleBtn.textContent = isCurrentlyOn ? 'Debug OFF' : 'Debug ON';
    debugToggleBtn.style.backgroundColor = isCurrentlyOn ? '#9E9E9E' : '#FF5722';
  };
  debugToggleBtn.style.margin = '5px';
  debugToggleBtn.style.backgroundColor = '#FF5722'; // Red because debug starts ON
  debugToggleBtn.style.color = 'white';
  debugToggleBtn.style.fontSize = '0.9em';
  testArea.appendChild(debugToggleBtn);
  */
  
  // Add after the reset button
  if (resetButton && resetButton.parentNode) {
    resetButton.parentNode.insertBefore(testArea, resetButton.nextSibling);
  }
}

// Test function to see if metronome and input work together
function testMetronome() {
  console.log('🎯 Testing metronome with input...');
  startButton.textContent = 'Stop Test';
  startButton.removeEventListener('click', testMetronome);
  startButton.addEventListener('click', stopTestMetronome);
  
  // Start a mini game
  startNewGame();
  startListening();
  startMetronome();
  
  const currentMode = getStateSnapshot().mode;
  console.log(`🎹 ${getInputInstructions(currentMode)}`);
  console.log('🎵 Tap along to the beat!');
}

function stopTestMetronome() {
  console.log('⏹ Stopping test...');
  startButton.textContent = 'Start Game';
  startButton.removeEventListener('click', stopTestMetronome);
  startButton.addEventListener('click', testMetronome);
  
  stopMetronome();
  stopListening();
  endGame();
  
  console.log('📊 Test results:', getSessionStats());
  console.log('🎹 Input results:', getInputState());
  
  metronome.style.background = '#ccc';
  metronome.textContent = '1';
}