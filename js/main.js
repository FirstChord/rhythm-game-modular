// Main Game Controller
import { initAudio, startMetronome, stopMetronome, setBeatInterval, playTickSound, getMetronomeStartTime, getBeatTime, getAudioContext } from './modules/audio.js';
import SmartLatencyCompensator from './smartLatency.js';

// Professional Systems Integration
import { globalResourceManager } from './utils/ResourceManager.js';
import { globalErrorBoundary } from './utils/ErrorBoundary.js';
import { globalPerformanceMonitor } from './utils/PerformanceMonitor.js';

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
  // setDebugMode - disabled
} from './modules/inputHandler.js';
import {
  initNotation,
  renderPattern,
  renderCurrentPattern,
  testNotation,
  getNotationStatus,
  clearAllHighlights,
  resetBeatHighlighting,
  testBeatHighlighting,
  startCountIn,
  advanceCountIn,
  hideCountInIndicator,
  getGameFlowState,
  resetGameFlow,
  completePattern,
  showTapFeedback,
  stopRealTimeTracking,
  cleanupNotation,
  getNotationStats
} from './modules/notation.js';

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

// Timing diagnostics
// let timingMonitor = null; // Removed - using audio latency compensation instead

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎵 Rhythm Game Loading...');
  
  // Initialize professional systems
  globalPerformanceMonitor.start();
  globalErrorBoundary.registerRecovery('audio', () => {
    console.log('🔧 Attempting audio recovery...');
    // Reinitialize audio if needed
    if (getAudioContext()?.state === 'suspended') {
      getAudioContext().resume();
    }
  });
  
  // Mark performance points
  globalPerformanceMonitor.mark('dom-ready');
  
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
  
  // Timing monitor removed - using SmartLatencyCompensator instead  
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
  console.log(`🎼 Tempo: ${BPM} BPM (${speed})`);
  
  // Initialize smart audio latency compensation
  window.latencyCompensator = new SmartLatencyCompensator();
  // Auto-calibrate with your optimal negative compensation
  window.latencyCompensator.calibrateFromExternalTest(-38); // Average of -33 to -43
  
  const compensationInfo = window.latencyCompensator.getInfo();
  console.log(`🎵 Smart latency compensation: ${compensationInfo.total}ms (${compensationInfo.browser})`);
  
  // Show initial pattern info
  const patternInfo = getPatternInfo();
  console.log(`📊 ${patternInfo.totalInLevel} patterns available for ${patternInfo.level} level`);
  
  // Add simple latency test button for optimization
  addLatencyTestButton();
});

function setupEventListeners() {
  // Set up event listeners with resource management
  if (startButton) {
    globalResourceManager.addEventListener(startButton, 'click', startProperGame);
  }
  
  if (resetButton) {
    globalResourceManager.addEventListener(resetButton, 'click', testNextPattern);
  }
  
  if (speedSlow) {
    globalResourceManager.addEventListener(speedSlow, 'change', function() { 
      if (speedSlow.checked) setSpeed('slow');
    });
  }
  
  if (speedMedium) {
    globalResourceManager.addEventListener(speedMedium, 'change', function() { 
      if (speedMedium.checked) setSpeed('medium');
    });
  }
  
  if (speedFast) {
    globalResourceManager.addEventListener(speedFast, 'change', function() { 
      if (speedFast.checked) setSpeed('fast');
    });
  }
  
  if (levelSelect) {
    globalResourceManager.addEventListener(levelSelect, 'change', function() {
      const newLevel = levelSelect.value;
      setLevel(newLevel);
      setSelectedLevel(newLevel);
      const patternInfo = getPatternInfo();
    });
  }
  
  if (metronome) {
    globalResourceManager.addEventListener(metronome, 'click', function() {
      console.log('🔊 Testing click sound...');
      playTickSound(true);
    });
  }
  
  // Mark initialization complete
  globalPerformanceMonitor.mark('init-complete');
  globalPerformanceMonitor.measure('initialization', 'dom-ready', 'init-complete');
  
  // Log performance report
  setTimeout(() => {
    globalPerformanceMonitor.logReport();
  }, 2000);
}

function setSpeed(newSpeed) {
  speed = newSpeed;
  BPM = SPEEDS[speed];
  BEAT_INTERVAL = 60000 / BPM;
  setBeatInterval(BEAT_INTERVAL);
  setGameSpeed(newSpeed); // Update game state
  
  // Track performance impact of speed changes
  globalPerformanceMonitor.mark(`speed-change-${newSpeed}`);
}

// Test function to cycle through patterns
function testNextPattern() {
  const newPattern = nextPattern();
  const patternInfo = getPatternInfo();

  
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

// Multiplayer input testing function
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

// Test function for real-time beat tracking without count-in
function testRealTimeBeatTracking() {
  console.log('🎯 Testing Real-Time Beat Tracking - Test Mode');
  
  // Clear any previous summary
  const summaryContainer = document.getElementById('performanceSummary');
  if (summaryContainer) {
    summaryContainer.innerHTML = '';
  }
  
  // Get current pattern
  const currentPattern = getCurrentPattern();
  console.log('🎵 Current pattern:', currentPattern);
  
  // Initialize game
  startNewGame();
  resetGameFlow();
  
  // Clear any highlighting
  clearAllHighlights();
  
  // Start input listening
  startListening();
  
  // Start metronome immediately (no count-in)
  startMetronome();
  
  console.log('🎼 Test mode started - no count-in, just play along!');
  console.log('📝 This is for testing the rhythm tracking without the formal game structure');
  
  const currentMode = getStateSnapshot().mode;
  console.log(`🎯 ${getInputInstructions(currentMode)}`);
  
  // Auto stop after 20 seconds for testing
  setTimeout(() => {
    console.log('⏹ Test mode ending...');
    stopMetronome();
    stopListening();
    endGame();
    resetGameFlow();
    console.log('📊 Test complete. This was test mode - no performance analysis.');
  }, 20000);
}

// Simple game flow - back to working basics
function startProperGame() {
  console.log('🎮 Starting rhythm game with proper beat detection!');
  
  // Clear any previous summary
  const summaryContainer = document.getElementById('performanceSummary');
  if (summaryContainer) {
    summaryContainer.innerHTML = '';
  }
  
  // Get current pattern
  const currentPattern = getCurrentPattern();
  console.log('🎵 Current pattern:', currentPattern);
  
  // Count ALL beats in the pattern (notes + rests), not just taps
  // But properly group 8th notes into quarter note beats
  const allElements = currentPattern.filter(note => !note.isBarline);
  
  // Group elements into quarter note beats (8th notes are subdivisions)
  const quarterNoteBeats = [];
  let currentBeat = [];
  let remainingDuration = 1.0; // Start with a full quarter note duration
  
  allElements.forEach((element, index) => {
    let elementDuration;
    
    // Calculate proper duration for each note type
    switch (element.type) {
      case 'whole':
        elementDuration = 4.0;
        break;
      case 'half':
        elementDuration = 2.0;
        break;
      case 'quarter':
        elementDuration = 1.0;
        break;
      case 'eighth':
        elementDuration = 0.5;
        break;
      case 'sixteenth':
        elementDuration = 0.25;
        break;
      default:
        elementDuration = 1.0; // fallback to quarter
    }
    
    // Add this element to the current beat
    currentBeat.push(element);
    remainingDuration -= elementDuration;
    
    // If we've filled a quarter note worth of duration, complete this beat
    if (remainingDuration <= 0) {
      quarterNoteBeats.push({
        elements: [...currentBeat],
        beatNumber: quarterNoteBeats.length + 1
      });
      currentBeat = [];
      remainingDuration = 1.0;
    }
  });
  
  // Handle any remaining partial beat
  if (currentBeat.length > 0) {
    quarterNoteBeats.push({
      elements: [...currentBeat],
      beatNumber: quarterNoteBeats.length + 1
    });
  }
  
  console.log(`🎯 Pattern has ${quarterNoteBeats.length} quarter note beats total`);
  console.log(`📝 Beat structure:`, quarterNoteBeats);
  
  // Initialize game
  startNewGame();
  resetGameFlow();
  clearAllHighlights();
  
  // Start input listening
  startListening();
  
  // Start metronome
  startMetronome();
  
  // Use the existing count-in system
  startCountIn();
  
  console.log('🎼 Count-in starting... Listen for 4 beats, then play along!');
  console.log('📝 Tap only on the notes (not rests)');
  
  const currentMode = getStateSnapshot().mode;
  console.log(`🎯 ${getInputInstructions(currentMode)}`);
  
  // Simple game timing - use existing beat tracking
  let beatIndex = -4; // Start at -4 for count-in
  let gameStartTime = 0;
  let recordedTaps = [];
  let gamePhase = false;
  
  const trackBeat = () => {
    const currentTime = performance.now();
    
    if (beatIndex < 0) {
      // Count-in phase
      const countResult = advanceCountIn();
      
      if (countResult.complete) {
        // Count-in finished, start recording
        gamePhase = true;
        // Use the metronome's synchronized timing for perfect alignment
        const metronomeStartTime = getMetronomeStartTime();
        const countInDuration = 4 * BEAT_INTERVAL; // 4 count-in beats
        gameStartTime = metronomeStartTime + countInDuration;
        
        // Initialize recording and store gameStartTime globally
        window.recordedTaps = recordedTaps;
        window.isRecording = true;
        window.gameStartTime = gameStartTime; // Store globally for analysis
        
        console.log('🚀 Recording started! Play along with the metronome...');
        console.log(`🎵 Pattern has ${quarterNoteBeats.length} quarter note beats - tap on notes, rest on rests!`);
        console.log(`🕐 Game synchronized with metronome: start=${gameStartTime.toFixed(0)}ms`);
        console.log(`🎵 Metronome started at: ${metronomeStartTime.toFixed(0)}ms`);
      }
      
      beatIndex++;
      globalResourceManager.setTimeout(trackBeat, BEAT_INTERVAL);
      
    } else if (beatIndex < quarterNoteBeats.length) {
      // Game phase - track each quarter note beat
      const currentBeat = quarterNoteBeats[beatIndex];
      const beatTime = gameStartTime + (beatIndex * BEAT_INTERVAL);
      
      // Verify synchronization with metronome
      const metronomeStartTime = getMetronomeStartTime();
      const expectedMetronomeBeat = metronomeStartTime + ((4 + beatIndex) * BEAT_INTERVAL); // +4 for count-in
      const timeDiff = Math.abs(beatTime - expectedMetronomeBeat);
      
      console.log(`🔄 Beat ${beatIndex + 1}: Game=${beatTime.toFixed(0)}ms, Metronome=${expectedMetronomeBeat.toFixed(0)}ms, Drift=${timeDiff.toFixed(0)}ms`);
      
      // Describe the beat content
      const beatDescription = currentBeat.elements.map(el => 
        `${el.type} ${el.rest ? 'rest' : 'note'}`
      ).join(' + ');
      
      console.log(`🎵 Beat ${beatIndex + 1}/${quarterNoteBeats.length}: ${beatDescription} at ${beatTime.toFixed(0)}ms`);
      
      beatIndex++;
      
      if (beatIndex < quarterNoteBeats.length) {
        globalResourceManager.setTimeout(trackBeat, BEAT_INTERVAL);
      } else {
        // Pattern complete
        console.log('🏁 Pattern complete!');
        
        // Stop recording
        window.isRecording = false;
        
        // Give time for final taps then analyze
        globalResourceManager.setTimeout(() => {
          stopMetronome();
          stopListening();
          endGame();
          
          // Simple analysis
          analyzeSimplePerformance(currentPattern, recordedTaps);
          
        }, 300);
      }
    }
  };
  
  // Set up recording
  window.recordedTaps = recordedTaps;
  window.isRecording = false;
  
  // Start the count-in
  setTimeout(trackBeat, BEAT_INTERVAL);
}

// Simple performance analysis - now tracks ALL beats with proper tap matching
function analyzeSimplePerformance(pattern, taps) {
  console.log('📊 ADVANCED PERFORMANCE ANALYSIS');
  console.log('==============================');
  
  // Get ALL elements in the pattern (notes + rests), excluding barlines
  const allElements = pattern.filter(note => !note.isBarline);
  console.log(`🎵 Pattern elements:`, allElements);
  
  // Group elements into quarter note beats (8th notes are subdivisions)
  const quarterNoteBeats = [];
  let currentBeat = [];
  let remainingDuration = 1.0; // Start with a full quarter note duration
  
  allElements.forEach((element, index) => {
    let elementDuration;
    
    // Calculate proper duration for each note type
    switch (element.type) {
      case 'whole':
        elementDuration = 4.0;
        break;
      case 'half':
        elementDuration = 2.0;
        break;
      case 'quarter':
        elementDuration = 1.0;
        break;
      case 'eighth':
        elementDuration = 0.5;
        break;
      case 'sixteenth':
        elementDuration = 0.25;
        break;
      default:
        elementDuration = 1.0; // fallback to quarter
    }
    
    // Add this element to the current beat
    currentBeat.push(element);
    remainingDuration -= elementDuration;
    
    console.log(`📝 Element ${index + 1}: ${element.type} ${element.rest ? 'rest' : 'note'} (${elementDuration} beats), remaining duration: ${remainingDuration}`);
    
    // If we've filled a quarter note worth of duration, complete this beat
    if (remainingDuration <= 0) {
      quarterNoteBeats.push({
        elements: [...currentBeat],
        beatNumber: quarterNoteBeats.length + 1
      });
      currentBeat = [];
      remainingDuration = 1.0;
    }
  });
  
  // Handle any remaining partial beat
  if (currentBeat.length > 0) {
    quarterNoteBeats.push({
      elements: [...currentBeat],
      beatNumber: quarterNoteBeats.length + 1
    });
  }
  
  console.log(`🎯 Grouped into ${quarterNoteBeats.length} quarter note beats:`, quarterNoteBeats);
  
  // Count notes that need taps (all non-rest elements)
  const totalTapsNeeded = allElements.filter(element => !element.rest).length;
  const totalRests = allElements.filter(element => element.rest).length;
  
  console.log(`📝 Pattern: ${quarterNoteBeats.length} quarter note beats (${totalTapsNeeded} taps needed, ${totalRests} rests)`);
  console.log(`🎹 You tapped: ${taps.length} times`);
  
  // Audio compensation temporarily disabled for testing
  // const compensation = window.rhythmTracker ? window.rhythmTracker.getCompensationInfo().current : 0;
  // if (compensation > 0) {
  //   console.log(`🎵 Applying ${compensation}ms audio latency compensation to beat timing`);
  // }
  
  // Create results for each quarter note beat with advanced analysis
  const gameStartTime = window.gameStartTime;
  if (!gameStartTime) {
    console.error('❌ Game start time not found! Cannot perform timing analysis.');
    showCompletionMessage('❌ Timing analysis failed - please try again!');
    return;
  }
  
  console.log(`🕐 Game started at: ${gameStartTime.toFixed(0)}ms`);
  
  // Sequential tap matching to prevent double-counting
  let usedTaps = new Set();
  
  const results = quarterNoteBeats.map((beat, beatIndex) => {
    const { elements, beatNumber } = beat;
    // Apply smart audio latency compensation
    const rawExpectedTime = gameStartTime + (beatIndex * BEAT_INTERVAL);
    const expectedBeatTime = window.latencyCompensator ? 
      window.latencyCompensator.compensateExpectedTime(rawExpectedTime) : 
      rawExpectedTime;
    
    // Check what's in this beat
    const notes = elements.filter(el => !el.rest);
    const rests = elements.filter(el => el.rest);
    const noteCount = notes.length;
    const isAllRests = elements.every(el => el.rest);
    
    // Calculate expected duration for this beat
    let expectedDuration = 0;
    elements.forEach(el => {
      switch (el.type) {
        case 'whole': expectedDuration += BEAT_INTERVAL * 4; break;
        case 'half': expectedDuration += BEAT_INTERVAL * 2; break;
        case 'quarter': expectedDuration += BEAT_INTERVAL; break;
        case 'eighth': expectedDuration += BEAT_INTERVAL * 0.5; break;
        case 'sixteenth': expectedDuration += BEAT_INTERVAL * 0.25; break;
        default: expectedDuration += BEAT_INTERVAL;
      }
    });
    
    // Find taps that match this beat's timing
    // Use tighter tolerance for rest beats to avoid false matches
    const tolerance = isAllRests ? 150 : 300; // ms tolerance - tighter for rests
    
    // Find best unused tap for this beat
    let bestTap = null;
    let bestScore = Infinity;
    
    taps.forEach((tap, tapIndex) => {
      if (usedTaps.has(tapIndex)) return; // Skip already used taps
      
      const timeDiff = Math.abs(tap.time - expectedBeatTime);
      if (timeDiff <= tolerance) {
        // Special logic for rest beats - don't match taps that are clearly meant for other beats
        if (isAllRests) {
          // Check if this tap is much closer to any nearby note beat
          let closerToOtherBeat = false;
          
          // Check previous beat (if it exists and is a note)
          if (beatIndex > 0) {
            const prevBeat = quarterNoteBeats[beatIndex - 1];
            const prevIsNote = !prevBeat.elements.every(el => el.rest);
            if (prevIsNote) {
              const prevBeatTime = gameStartTime + ((beatIndex - 1) * BEAT_INTERVAL);
              const prevTimeDiff = Math.abs(tap.time - prevBeatTime);
              // If the tap is closer to the previous beat or within a reasonable range of it, don't match to rest
              if (prevTimeDiff < timeDiff * 0.8 || prevTimeDiff < 200) { // More lenient threshold
                closerToOtherBeat = true;
              }
            }
          }
          
          // Check next beat (if it exists and is a note)
          if (beatIndex < quarterNoteBeats.length - 1) {
            const nextBeat = quarterNoteBeats[beatIndex + 1];
            const nextIsNote = !nextBeat.elements.every(el => el.rest);
            if (nextIsNote) {
              const nextBeatTime = gameStartTime + ((beatIndex + 1) * BEAT_INTERVAL);
              const nextTimeDiff = Math.abs(tap.time - nextBeatTime);
              // If the tap is closer to the next beat or within a reasonable range of it, don't match to rest
              if (nextTimeDiff < timeDiff * 0.8 || nextTimeDiff < 200) { // More lenient threshold
                closerToOtherBeat = true;
              }
            }
          }
          
          // Additional check: if this tap is very close in time to any other tap, it might be a duplicate/hold event
          const tooCloseToOtherTap = taps.some((otherTap, otherIndex) => {
            if (otherIndex === tapIndex) return false;
            return Math.abs(tap.time - otherTap.time) < 100; // Within 100ms of another tap
          });
          
          // Skip this tap if it's clearly meant for another beat or is a duplicate
          if (closerToOtherBeat || tooCloseToOtherTap) {
            console.log(`   Skipping tap at ${tap.time.toFixed(0)}ms for rest beat (closer to other beat: ${closerToOtherBeat}, too close to other tap: ${tooCloseToOtherTap})`);
            return;
          }
        }
        
        // Score based on timing accuracy and sequential order
        let score = timeDiff;
        
        // Bonus for sequential order
        const previouslyUsedTaps = Array.from(usedTaps);
        const highestUsedIndex = previouslyUsedTaps.length > 0 ? Math.max(...previouslyUsedTaps) : -1;
        if (tapIndex > highestUsedIndex) {
          score -= 25; // Bonus for sequential order
        }
        
        if (score < bestScore) {
          bestTap = { tap, index: tapIndex, timeDiff: tap.time - expectedBeatTime };
          bestScore = score;
        }
      }
    });
    
    const matchingTaps = bestTap ? [bestTap.tap] : [];
    
    console.log(`🔍 Beat ${beatNumber}: Expected at ${expectedBeatTime.toFixed(0)}ms, found ${matchingTaps.length} matching taps (tolerance: ${tolerance}ms)`);
    console.log(`   Beat elements:`, elements.map(el => `${el.type} ${el.rest ? 'rest' : 'note'}`).join(', '));
    console.log(`   isAllRests: ${isAllRests}, notes: ${notes.length}, rests: ${rests.length}`);
    if (matchingTaps.length > 0) {
      console.log(`   Best tap: ${matchingTaps[0].time.toFixed(0)}ms (${bestTap.timeDiff.toFixed(0)}ms diff)`);
      if (matchingTaps[0].duration !== undefined) {
        console.log(`   Duration: ${matchingTaps[0].duration.toFixed(0)}ms (expected: ${expectedDuration.toFixed(0)}ms)`);
      }
      // Mark this tap as used
      usedTaps.add(bestTap.index);
    }
    
    let beatType, result, timingPrecision = 0, durationScore = 0;
    
    if (isAllRests) {
      // Pure rest beat - should have no taps
      beatType = 'rest';
      result = matchingTaps.length === 0 ? 'perfect' : 'miss';
      timingPrecision = matchingTaps.length === 0 ? 100 : 0; // Perfect timing if no taps, 0 if tapped
      durationScore = matchingTaps.length === 0 ? 100 : 0;   // Perfect duration if no taps, 0 if tapped
      console.log(`   REST BEAT: ${matchingTaps.length} taps found, result: ${result}`);
    } else {
      // Beat with notes - analyze timing and duration
      if (matchingTaps.length === 0) {
        // No taps for this beat
        beatType = getSimpleBeatType(elements);
        result = 'miss';
        timingPrecision = 0;
        durationScore = 0;
      } else {
        // Has taps - analyze quality
        const bestTap = matchingTaps[0]; // Take the first matching tap
        const timeDiff = Math.abs(bestTap.time - expectedBeatTime);
        
        // Calculate timing precision (0-100)
        const noteTolerancePrecision = 300; // Use full tolerance for precision calculation
        timingPrecision = Math.max(0, Math.round(100 - (timeDiff / noteTolerancePrecision * 100)));
        
        // Calculate duration score if tap has duration data
        if (bestTap.duration !== undefined && bestTap.isComplete) {
          const durationDiff = Math.abs(bestTap.duration - expectedDuration);
          const durationTolerance = expectedDuration * 0.6; // 60% tolerance (more forgiving)
          
          // More forgiving scoring curve
          let durationPercent = Math.max(0, 100 - (durationDiff / durationTolerance * 100));
          
          // Give bonus for being close to expected duration
          if (durationDiff < expectedDuration * 0.2) // Within 20% of expected
            durationPercent = Math.min(100, durationPercent + 10); // Bonus points
          
          // More generous minimum score
          durationScore = Math.max(60, Math.round(durationPercent));
        } else {
          durationScore = 75; // Better score if no duration data (tap completed normally)
        }
        
        // Determine result based on timing precision (more forgiving thresholds)
        if (timingPrecision >= 75) {
          result = 'perfect';
        } else if (timingPrecision >= 60) {
          result = 'good';
        } else if (timingPrecision >= 40) {
          result = 'close';
        } else {
          result = 'miss';
        }
        
        beatType = getSimpleBeatType(elements);
      }
    }
    
    return {
      beat: beatNumber,
      type: beatType,
      result: result,
      timing: timingPrecision,
      durationScore: durationScore,
      expectedTime: expectedBeatTime,
      actualTime: matchingTaps.length > 0 ? matchingTaps[0].time : null,
      elements: elements,
      expectedDuration: expectedDuration,
      actualDuration: matchingTaps.length > 0 && matchingTaps[0].duration !== undefined ? matchingTaps[0].duration : null
    };
  });
  
  // Feed results to smart latency compensator for learning
  if (window.latencyCompensator) {
    results.forEach(result => {
      if (result.actualTime && result.expectedTime) {
        const wasAccurate = result.result === 'perfect' || result.result === 'good';
        window.latencyCompensator.learnFromTap(result.actualTime, result.expectedTime, wasAccurate);
      }
    });
  }
  
  // Helper function to determine beat type
  function getSimpleBeatType(elements) {
    if (elements.every(el => el.rest)) return 'rest';
    if (elements.length === 1 && elements[0].type === 'quarter') return 'quarter-note';
    if (elements.length === 1 && elements[0].type === 'half') return 'half-note';
    if (elements.length === 2 && elements.every(el => el.type === 'eighth')) return 'eighth-notes';
    return 'mixed';
  }
  
  // Advanced scoring with timing precision and duration analysis
  const perfectBeats = results.filter(r => r.result === 'perfect').length;
  const goodBeats = results.filter(r => r.result === 'good').length;
  const closeBeats = results.filter(r => r.result === 'close').length;
  const missedBeats = results.filter(r => r.result === 'miss').length;
  
  // Calculate overall timing precision
  const avgTimingPrecision = results.reduce((sum, r) => sum + r.timing, 0) / results.length;
  const avgDurationScore = results.reduce((sum, r) => sum + r.durationScore, 0) / results.length;
  
  let message = '';
  
  if (perfectBeats === quarterNoteBeats.length) {
    message = `🌟 PERFECT! All ${quarterNoteBeats.length} beats with ${avgTimingPrecision.toFixed(0)}% timing precision and ${avgDurationScore.toFixed(0)}% duration accuracy!`;
  } else if (perfectBeats + goodBeats >= quarterNoteBeats.length * 0.8) {
    message = `🎵 GREAT! ${perfectBeats} perfect, ${goodBeats} good beats. Timing: ${avgTimingPrecision.toFixed(0)}%, Duration: ${avgDurationScore.toFixed(0)}%`;
  } else if (perfectBeats + goodBeats + closeBeats >= quarterNoteBeats.length * 0.6) {
    message = `👍 GOOD! ${perfectBeats} perfect, ${goodBeats} good, ${closeBeats} close. Work on timing precision!`;
  } else {
    message = `💪 KEEP PRACTICING! ${missedBeats} missed beats. Focus on timing and note duration!`;
  }
  
  console.log(message);
  console.log(`📊 Advanced metrics: Timing ${avgTimingPrecision.toFixed(1)}%, Duration ${avgDurationScore.toFixed(1)}%`);
  showCompletionMessage(message);
  
  showDetailedSummary(results);
}

// Analyze recorded performance and show results
function analyzePerformance(expectedTimes, recordedTaps, totalBeats) {
  console.log('🔍 ANALYZING PERFORMANCE...');
  console.log('=================================');
  
  // Extract just the tap times
  const tapTimes = recordedTaps.map(tap => tap.time);
  
  console.log(`📊 Expected quarter note beats: ${expectedTimes.length}`);
  console.log(`📊 Your taps: ${tapTimes.length}`);
  console.log(`📊 Pattern has ${totalBeats} quarter note beats (${totalBeats/4} bars)`);
  
  // Show detailed tap timing
  console.log('🕐 Tap timing details:');
  recordedTaps.forEach((tap, index) => {
    console.log(`  Tap ${index + 1}: ${tap.time.toFixed(0)}ms (Player ${tap.player})`);
  });
  
  console.log('🎯 Expected beat timing:');
  expectedTimes.forEach((time, index) => {
    const beatNumber = index + 1;
    const timeSinceStart = time - expectedTimes[0];
    const secondsFromStart = (timeSinceStart / 1000).toFixed(1);
    console.log(`  Beat ${beatNumber}: ${time.toFixed(0)}ms (+${secondsFromStart}s from start)`);
  });
  
  console.log('🎵 Rhythm guidance:');
  console.log(`  At ${BPM} BPM, beats should be exactly ${BEAT_INTERVAL}ms apart`);
  console.log(`  Try counting: "1... 2... 3... 4..." with the metronome`);
  console.log(`  🎯 TIMING TIP: You're tapping about 500ms early on each beat!`);
  console.log(`  💡 Wait for the metronome "tick" sound, THEN tap immediately after`);
  console.log(`  🎼 The metronome tick IS the beat - don't tap before it!`);
  console.log('');
  
  if (tapTimes.length === 0) {
    console.log('❌ No taps recorded! Try tapping spacebar during the pattern.');
    showCompletionMessage('No taps detected - try again!');
    showDetailedSummary([]); // Empty results
    return;
  }
  
  // Match taps to quarter note beats
  let hits = 0;
  let perfect = 0;
  let good = 0;
  let misses = 0;
  let beatResults = []; // Store detailed results for visual display
  
  const tolerance = { perfect: 100, good: 200 }; // More generous for analysis
  
  // Sequential tap matching - match taps in order they were played
  let usedTaps = new Set(); // Track which taps have been used
  
  expectedTimes.forEach((expectedTime, beatIndex) => {
    console.log(`🔍 Matching beat ${beatIndex + 1} (expected at ${expectedTime.toFixed(0)}ms)`);
    
    let bestMatch = null;
    let bestScore = Infinity;
    
    // Look for the best unused tap for this beat
    tapTimes.forEach((tapTime, tapIndex) => {
      if (usedTaps.has(tapIndex)) {
        console.log(`  ⏭️ Tap ${tapIndex + 1} at ${tapTime.toFixed(0)}ms already used, skipping`);
        return; // Skip already used taps
      }
      
      const diff = Math.abs(tapTime - expectedTime);
      const timeDiff = tapTime - expectedTime; // Positive = late, negative = early
      
      console.log(`  🎯 Checking tap ${tapIndex + 1} at ${tapTime.toFixed(0)}ms (${timeDiff >= 0 ? '+' : ''}${timeDiff.toFixed(0)}ms from expected)`);
      
      // Use generous tolerance but prefer taps that are closer in time
      const maxTolerance = 700; // More generous tolerance
      const finalBeatTolerance = 900; // Even more generous for final beat
      const tolerance = (beatIndex === expectedTimes.length - 1) ? finalBeatTolerance : maxTolerance;
      
      if (diff < tolerance) {
        // Score based on timing accuracy and sequential order preference
        // Prefer taps that are closer to expected time
        // Also prefer taps that come in the right sequential order
        let score = diff;
        
        // Bonus for sequential order - prefer taps that haven't been "jumped over"
        const previouslyUsedTaps = Array.from(usedTaps);
        const highestUsedIndex = previouslyUsedTaps.length > 0 ? Math.max(...previouslyUsedTaps) : -1;
        
        if (tapIndex > highestUsedIndex) {
          score -= 50; // Bonus for sequential order
        }
        
        // Slight preference for slightly early taps over late taps (more musical)
        if (timeDiff < 0 && timeDiff > -200) {
          score -= 25; // Bonus for being slightly early
        }
        
        console.log(`    📊 Score: ${score.toFixed(0)} (tolerance: ${tolerance}ms)`);
        
        if (score < bestScore) {
          bestMatch = { time: tapTime, index: tapIndex, diff: timeDiff };
          bestScore = score;
        }
      } else {
        console.log(`    ❌ Outside tolerance (${diff.toFixed(0)}ms > ${tolerance}ms)`);
      }
    });
    
    if (bestMatch) {
      // Mark this tap as used
      usedTaps.add(bestMatch.index);
      console.log(`  ✅ Matched tap ${bestMatch.index + 1} to beat ${beatIndex + 1} (${bestMatch.diff >= 0 ? '+' : ''}${bestMatch.diff.toFixed(0)}ms)`);
    }
    
    let result = 'miss';
    let timingMs = 0;
    
    if (bestMatch) {
      hits++;
      timingMs = Math.abs(bestMatch.diff);
      
      if (timingMs <= tolerance.perfect) {
        perfect++;
        result = 'perfect';
        console.log(`✅ Beat ${beatIndex + 1}: PERFECT (${bestMatch.diff >= 0 ? '+' : ''}${bestMatch.diff.toFixed(0)}ms)`);
      } else if (timingMs <= tolerance.good) {
        good++;
        result = 'good';
        console.log(`👍 Beat ${beatIndex + 1}: GOOD (${bestMatch.diff >= 0 ? '+' : ''}${bestMatch.diff.toFixed(0)}ms)`);
      } else {
        misses++;
        result = 'close';
        console.log(`⚠️ Beat ${beatIndex + 1}: CLOSE (${bestMatch.diff >= 0 ? '+' : ''}${bestMatch.diff.toFixed(0)}ms)`);
      }
    } else {
      misses++;
      console.log(`❌ Beat ${beatIndex + 1}: MISSED (no suitable tap found)`);
      
      // Provide helpful feedback for missed beats
      if (beatIndex === expectedTimes.length - 1) {
        console.log(`💡 Tip: The final beat (${beatIndex + 1}) is important! Make sure to tap all beats in the pattern.`);
        console.log(`🔍 Debug: Beat ${beatIndex + 1} timing analysis:`);
        console.log(`   Expected: ${expectedTime.toFixed(0)}ms`);
        console.log(`   Available unused taps: ${tapTimes.filter((_, idx) => !usedTaps.has(idx)).map(t => t.toFixed(0) + 'ms').join(', ')}`);
        console.log(`   ⚠️  Check if you're rushing or missing the final beat!`);
      }
    }
    
    // Store result for visual display
    beatResults.push({
      beat: beatIndex + 1,
      result: result,
      timing: timingMs,
      expectedTime: expectedTime,
      actualTime: bestMatch ? bestMatch.time : null
    });
  });
  
  // Calculate overall performance
  const accuracy = Math.round((hits / totalBeats) * 100);
  const timing = perfect > 0 ? Math.round((perfect / hits) * 100) : 0;
  
  // Analyze timing patterns
  const earlyTaps = beatResults.filter(b => b.actualTime && b.actualTime < b.expectedTime);
  const lateTaps = beatResults.filter(b => b.actualTime && b.actualTime > b.expectedTime);
  const avgEarlyAmount = earlyTaps.length > 0 ? earlyTaps.reduce((sum, b) => sum + (b.expectedTime - b.actualTime), 0) / earlyTaps.length : 0;
  const avgLateAmount = lateTaps.length > 0 ? lateTaps.reduce((sum, b) => sum + (b.actualTime - b.expectedTime), 0) / lateTaps.length : 0;
  
  console.log('🎵 TIMING ANALYSIS:');
  if (earlyTaps.length > lateTaps.length) {
    console.log(`  ⚠️  You're RUSHING! ${earlyTaps.length} early taps vs ${lateTaps.length} late taps`);
    console.log(`  ⏰ Average early by: ${avgEarlyAmount.toFixed(0)}ms`);
    console.log(`  💡 Tip: Slow down! Wait for the metronome tick before tapping`);
    console.log(`  🎯 IMPORTANT: The metronome tick IS the beat - tap right after you hear it!`);
  } else if (lateTaps.length > earlyTaps.length) {
    console.log(`  🐌 You're DRAGGING! ${lateTaps.length} late taps vs ${earlyTaps.length} early taps`);
    console.log(`  ⏰ Average late by: ${avgLateAmount.toFixed(0)}ms`);
    console.log(`  💡 Tip: Try to anticipate the beat slightly`);
  } else {
    console.log(`  ✅ Good timing balance! ${earlyTaps.length} early, ${lateTaps.length} late`);
  }
  
  console.log('=================================');
  console.log('🎯 PERFORMANCE SUMMARY:');
  console.log(`   Quarter note beats hit: ${hits}/${totalBeats} (${accuracy}%)`);
  console.log(`   Perfect timing: ${perfect}`);
  console.log(`   Good timing: ${good}`);
  console.log(`   Missed: ${misses}`);
  
  // Show encouraging feedback
  let message = '';
  if (accuracy >= 75 && timing >= 50) {
    message = '🌟 EXCELLENT! Great rhythm and timing!';
  } else if (accuracy >= 75) {
    message = '🎵 GREAT! You hit the beats - work on timing precision';
  } else if (accuracy >= 50) {
    message = '👍 GOOD START! Keep practicing the rhythm';
  } else {
    message = '💪 KEEP TRYING! Listen to the metronome and count along';
  }
  
  console.log(message);
  console.log('=================================');
  console.log('✅ Click "Start Game" to try again or "Next Pattern" for a new challenge!');
  
  // Show completion message and detailed summary
  showCompletionMessage(message);
  showDetailedSummary(beatResults);
  
  // Clean up
  window.recordedTaps = null;
  window.gameStartTime = null;
  window.isRecording = false;
}

// Show completion message overlay
function showCompletionMessage(message) {
  // Find or create completion overlay
  let overlay = document.getElementById('countInOverlay');
  
  if (!overlay) {
    // Create the overlay if it doesn't exist
    overlay = document.createElement('div');
    overlay.id = 'countInOverlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.fontWeight = 'bold';
    overlay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
    overlay.style.zIndex = '1000';
    overlay.style.pointerEvents = 'none';
    overlay.style.textAlign = 'center';
    overlay.style.padding = '20px';
    overlay.style.borderRadius = '10px';
    overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    overlay.style.border = '2px solid #4CAF50';
    
    // Add to the notation container with fallback
    const container = document.getElementById('vexflowOutput') || document.body;
    container.style.position = 'relative';
    container.appendChild(overlay);
  }
  
  // Set the completion message
  overlay.textContent = message;
  overlay.style.color = '#4CAF50';
  overlay.style.fontSize = '1.8rem';
  overlay.style.display = 'block';
  overlay.style.transform = 'translate(-50%, -50%) scale(1)';
  overlay.style.opacity = '1';
  
  console.log('🎉 Showing completion message:', message);
  
  // Hide after 4 seconds
  setTimeout(() => {
    if (overlay) {
      overlay.style.display = 'none';
      console.log('🎉 Completion message hidden');
    }
  }, 4000);
}

// Show detailed summary below the staff
function showDetailedSummary(beatResults) {
  // Find or create summary container
  let summaryContainer = document.getElementById('performanceSummary');
  
  if (!summaryContainer) {
    summaryContainer = document.createElement('div');
    summaryContainer.id = 'performanceSummary';
    summaryContainer.style.marginTop = '20px';
    summaryContainer.style.padding = '15px';
    summaryContainer.style.backgroundColor = '#f8f9fa';
    summaryContainer.style.border = '1px solid #dee2e6';
    summaryContainer.style.borderRadius = '8px';
    summaryContainer.style.fontFamily = 'Arial, sans-serif';
    summaryContainer.style.fontSize = '14px';
    
    // Add below the notation display
    const notationDisplay = document.getElementById('notationDisplay');
    if (notationDisplay) {
      notationDisplay.parentNode.insertBefore(summaryContainer, notationDisplay.nextSibling);
    }
  }
  
  if (beatResults.length === 0) {
    summaryContainer.innerHTML = '<h4>No Performance Data</h4><p>No taps were recorded during the pattern.</p>';
    return;
  }
  
  // Create summary HTML
  let summaryHTML = '<h4>🎯 Beat-by-Beat Performance</h4>';
  summaryHTML += '<div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">';
  
  beatResults.forEach(beat => {
    let color, symbol, description;
    
    // Handle different results with proper colors
    switch (beat.result) {
      case 'perfect':
        color = '#28a745'; // Green
        symbol = '🌟';
        description = `Perfect! (${beat.timing}% timing, ${beat.durationScore}% duration)`;
        break;
      case 'good':
        color = '#17a2b8'; // Blue
        symbol = '�';
        description = `Good! (${beat.timing}% timing, ${beat.durationScore}% duration)`;
        break;
      case 'close':
        color = '#ffc107'; // Yellow
        symbol = '⚠️';
        description = `Close (${beat.timing}% timing, ${beat.durationScore}% duration)`;
        break;
      case 'miss':
        color = '#dc3545'; // Red
        symbol = '❌';
        description = 'Missed';
        break;
      default:
        color = '#6c757d'; // Gray
        symbol = '❓';
        description = 'Unknown';
        break;
    }
    
    // Override for rest beats
    if (beat.type === 'rest') {
      color = '#17a2b8';
      symbol = '🔇';
      description = beat.result === 'perfect' ? 'Rest (correct)' : 'Rest (tapped incorrectly)';
    }
    
    // Create detailed beat display with timing and duration info
    const timingDisplay = beat.timing !== undefined ? `${beat.timing}%` : 'N/A';
    const durationDisplay = beat.durationScore !== undefined ? `${beat.durationScore}%` : 'N/A';
    
    summaryHTML += `
      <div style="
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        padding: 8px 10px;
        background: ${color}20;
        border: 1px solid ${color};
        border-radius: 6px;
        color: ${color};
        font-weight: bold;
        font-size: 12px;
        min-width: 120px;
        margin-bottom: 5px;
      " title="${description}">
        <div style="display: flex; align-items: center; margin-bottom: 4px;">
          <span style="margin-right: 6px;">${symbol}</span>
          <span>Beat ${beat.beat}</span>
          <span style="font-size: 10px; margin-left: 4px;">${beat.result}</span>
        </div>
        ${beat.type !== 'rest' ? `
          <div style="font-size: 10px; color: ${color}; opacity: 0.8;">
            <span style="margin-right: 8px;">T: ${timingDisplay}</span>
            <span>D: ${durationDisplay}</span>
          </div>
        ` : ''}
      </div>
    `;
  });
  
  summaryHTML += '</div>';
  
  // Split beat results into notes and rests
  const noteBeats = beatResults.filter(b => !b.isRest);
  const restBeats = beatResults.filter(b => b.isRest);
  
  // Add statistics
  const perfectBeats = beatResults.filter(b => b.result === 'perfect').length;
  const goodBeats = beatResults.filter(b => b.result === 'good').length;
  const closeBeats = beatResults.filter(b => b.result === 'close').length;
  const missedNoteBeats = noteBeats.filter(b => b.result === 'miss').length;
  const missedRestBeats = restBeats.filter(b => b.result === 'miss').length;
  
  const totalBeats = beatResults.length;
  const beatAccuracy = totalBeats > 0 ? Math.round((perfectBeats / totalBeats) * 100) : 100;
  
  // Calculate average timing and duration scores (only for note beats)
  const beatsWithTiming = noteBeats.filter(b => b.timing !== undefined);
  const beatsWithDuration = noteBeats.filter(b => b.durationScore !== undefined);
  
  const avgTiming = beatsWithTiming.length > 0 ? 
    Math.round(beatsWithTiming.reduce((sum, b) => sum + b.timing, 0) / beatsWithTiming.length) : 0;
  const avgDuration = beatsWithDuration.length > 0 ? 
    Math.round(beatsWithDuration.reduce((sum, b) => sum + b.durationScore, 0) / beatsWithDuration.length) : 0;
  
  // Calculate overall performance score (weighted average)
  const overallScore = Math.round((beatAccuracy * 0.5) + (avgTiming * 0.3) + (avgDuration * 0.2));
  
  summaryHTML += `
    <div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 5px;">
      <h5 style="margin: 0 0 10px 0; color: #333;">📊 Performance Summary</h5>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; font-size: 13px;">
        <div>
          <strong>Beat Accuracy:</strong>
          <span style="color: #28a745; margin-left: 5px;">✅ ${perfectBeats}/${totalBeats} perfect (${beatAccuracy}%)</span>
        </div>
        <div>
          <strong>Timing Precision:</strong>
          <span style="color: #17a2b8; margin-left: 5px;">⏱️ ${avgTiming}% average</span>
        </div>
        <div>
          <strong>Duration Accuracy:</strong>
          <span style="color: #6f42c1; margin-left: 5px;">⏳ ${avgDuration}% average</span>
        </div>
        <div>
          <strong>Overall Score:</strong>
          <span style="color: #fd7e14; margin-left: 5px; font-weight: bold;">🎯 ${overallScore}/100</span>
        </div>
      </div>
      ${goodBeats > 0 || closeBeats > 0 || missedNoteBeats > 0 || missedRestBeats > 0 ? `
        <div style="margin-top: 10px; font-size: 12px; color: #666;">
          <strong>Breakdown:</strong>
          <span style="margin-left: 10px;">Perfect: ${perfectBeats}</span>
          ${goodBeats > 0 ? `<span style="margin-left: 10px;">Good: ${goodBeats}</span>` : ''}
          ${closeBeats > 0 ? `<span style="margin-left: 10px;">Close: ${closeBeats}</span>` : ''}
          ${missedNoteBeats > 0 ? `<span style="margin-left: 10px;">Missed Notes: ${missedNoteBeats}</span>` : ''}
          ${missedRestBeats > 0 ? `<span style="margin-left: 10px;">Missed Rests: ${missedRestBeats}</span>` : ''}
        </div>
      ` : ''}
    </div>
  `;
  
  // Add tips based on performance
  let tip = '';
  
  if (beatAccuracy >= 90) {
    tip = '🌟 Excellent! Perfect rhythm with all beats correctly played!';
  } else if (beatAccuracy >= 75) {
    tip = '🎵 Good job! Focus on matching the rhythm pattern correctly.';
  } else if (beatAccuracy >= 50) {
    tip = '👍 Keep practicing! Listen closely to the pattern and count the notes in each beat.';
  } else {
    tip = '💪 Don\'t give up! Start with simpler patterns and focus on one beat at a time.';
  }
  
  summaryHTML += `
    <div style="margin-top: 15px; padding: 10px; background: #e7f3ff; border-left: 4px solid #007bff; font-style: italic;">
      <strong>💡 Tip:</strong> ${tip}
      <br><br>
      <strong>🎼 Remember:</strong> The metronome ticks on every beat. 
      Tap on notes (♪) and stay silent on rests (𝄽). 
      Both are equally important for good rhythm!
    </div>
  `;
  
  summaryContainer.innerHTML = summaryHTML;
  
  // Scroll to summary
  summaryContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
  startButton.addEventListener('click', startProperGame); // Use the new proper game function
  
  stopMetronome();
  stopListening();
  endGame();
  resetGameFlow(); // Reset any count-in state
  
  console.log('📊 Test results:', getSessionStats());
  console.log('🎹 Input results:', getInputState());
  
  metronome.style.background = '#ccc';
  metronome.textContent = '1';
}

// Test function to verify beat counting
function testBeatCounting() {
  const currentPattern = getCurrentPattern();
  console.log('🧪 Testing beat counting logic...');
  console.log('🎵 Current pattern:', currentPattern);
  
  // Count using old method (individual notes)
  const nonBarlineNotes = currentPattern.filter(note => !note.isBarline);
  console.log(`📝 Individual notes (old method): ${nonBarlineNotes.length}`);
  
  // Count using new method (quarter note beats)
  const patternBars = currentPattern.filter(note => note.isBarline).length + 1;
  const totalBeats = patternBars * 4;
  console.log(`📝 Quarter note beats (new method): ${totalBeats} (${patternBars} bars × 4 beats)`);
  
  // Check if this makes sense
  console.log('🔍 Pattern structure detailed analysis:');
  console.log(`   - Total elements in pattern: ${currentPattern.length}`);
  console.log(`   - Barlines found: ${currentPattern.filter(n => n.isBarline).length}`);
  console.log(`   - Non-barline notes: ${nonBarlineNotes.length}`);
  console.log(`   - Expected beats for ${patternBars} bars: ${totalBeats}`);
  
  // Analyze the pattern structure
  let currentBar = 1;
  let noteIndex = 0;
  
  currentPattern.forEach((note, index) => {
    if (note.isBarline) {
      console.log(`📏 --- End of Bar ${currentBar} ---`);
      currentBar++;
    } else {
      noteIndex++;
      console.log(`🎵 Note ${noteIndex}: ${note.type} ${note.rest ? 'rest' : 'note'} (Bar ${currentBar}) - Element ${index + 1}`);
    }
  });
  
  console.log(`✅ Beat counting test complete.`);
  console.log(`📊 Summary: ${patternBars} bar(s) with ${totalBeats} quarter note beats should be tracked.`);
  
  // Test what the game would actually track
  console.log('🎮 What the game will track:');
  for (let i = 0; i < totalBeats; i++) {
    const barNum = Math.floor(i / 4) + 1;
    const beatInBar = (i % 4) + 1;
    console.log(`   Beat ${i + 1}: Bar ${barNum}, Beat ${beatInBar}`);
  }
}

// Simple latency optimization controls
function addLatencyTestButton() {
  const testButton = document.createElement('button');
  testButton.textContent = 'Latency: ON';
  testButton.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 8px 16px;
    background: #16a34a;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    z-index: 10000;
  `;
  
  // Double-click for calibration (Mac-friendly)
  testButton.addEventListener('dblclick', (e) => {
    e.preventDefault();
    if (window.latencyCompensator) {
      const userInput = prompt('Enter your optimal latency compensation (ms):\n(Positive = expect taps earlier for audio delay)\n(Negative = expect taps later for fast reflexes)', '-38');
      if (userInput && !isNaN(userInput)) {
        const latency = parseFloat(userInput);
        window.latencyCompensator.calibrateFromExternalTest(latency);
        
        const info = window.latencyCompensator.getInfo();
        console.log(`🎵 Calibrated to ${latency}ms. Current total: ${info.total}ms`);
      }
    }
  });

  // Right-click for calibration menu (also try Mac context menu)
  testButton.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (window.latencyCompensator) {
      const userInput = prompt('Enter your external latency test result (ms):', '165.2');
      if (userInput && !isNaN(userInput)) {
        const latency = parseFloat(userInput);
        window.latencyCompensator.calibrateFromExternalTest(latency);
        
        const info = window.latencyCompensator.getInfo();
        console.log(`🎵 Calibrated to ${latency}ms. Current total: ${info.total}ms`);
      }
    }
  });

  // Long press for mobile/touch devices
  let pressTimer;
  testButton.addEventListener('touchstart', (e) => {
    pressTimer = setTimeout(() => {
      if (window.latencyCompensator) {
        const userInput = prompt('Enter your external latency test result (ms):', '165.2');
        if (userInput && !isNaN(userInput)) {
          const latency = parseFloat(userInput);
          window.latencyCompensator.calibrateFromExternalTest(latency);
          
          const info = window.latencyCompensator.getInfo();
          console.log(`🎵 Calibrated to ${latency}ms. Current total: ${info.total}ms`);
        }
      }
    }, 800); // 800ms long press
  });

  testButton.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
  });
  
  testButton.addEventListener('click', () => {
    if (window.latencyCompensator) {
      const info = window.latencyCompensator.getInfo();
      window.latencyCompensator.setEnabled(!info.enabled);
      
      const newInfo = window.latencyCompensator.getInfo();
      testButton.textContent = `Latency: ${newInfo.enabled ? 'ON' : 'OFF'}`;
      testButton.style.background = newInfo.enabled ? '#16a34a' : '#dc2626';
      
      console.log(`🎵 Smart latency compensation toggled: ${newInfo.enabled ? 'ON' : 'OFF'}`);
      if (newInfo.enabled) {
        console.log(`🎵 Current compensation: ${newInfo.total}ms (base: ${newInfo.base}ms + adaptive: ${newInfo.adaptive}ms)`);
      }
    }
  });
  
  // Add calibration hint
  const hintText = document.createElement('div');
  hintText.style.cssText = `
    position: fixed;
    top: 60px;
    right: 20px;
    font-size: 12px;
    color: #666;
    background: rgba(255,255,255,0.9);
    padding: 4px 8px;
    border-radius: 4px;
    z-index: 10000;
  `;
  hintText.textContent = 'Double-click to calibrate';
  
  document.body.appendChild(testButton);
  document.body.appendChild(hintText);
}

// Cleanup any old test functions
// End of file

// Professional Resource Cleanup Integration
globalResourceManager.addEventListener(window, 'beforeunload', () => {
  console.log('🔄 App shutting down, cleaning up resources...');
  
  // Cleanup notation resources
  cleanupNotation();
  
  // Stop metronome
  stopMetronome();
  
  // Stop latency compensator
  if (latencyCompensator) {
    latencyCompensator.stop();
  }
  
  console.log('✅ App cleanup complete');
});

// Performance monitoring
console.log('📊 Performance Monitor Active:', globalPerformanceMonitor.isEnabled());
console.log('🛡️ Error Boundary Active:', globalErrorBoundary.isEnabled());

