// Input Handler Module - Manages keyboard and touch events

// Debug mode toggle
let DEBUG_INPUT = false;

// Import game state functions we'll need
let gameState = null;
let updateGameState = null;

// DOM elements for visual feedback
let tapIndicator1 = null;
let tapIndicator2 = null;

// Input configuration
const INPUT_CONFIG = {
  single: {
    keys: [' ', 'Space'], // Spacebar for single player
    description: 'Spacebar'
  },
  multi: {
    player1: { keys: ['a', 'A'], description: 'A' },
    player2: { keys: ['Enter', 'NumpadEnter'], description: 'Enter' }
  }
};

// Active listeners (for cleanup)
let activeListeners = [];

// Initialize the input handler
export function initInputHandler(gameStateModule, tapIndicators) {
  console.log('🎹 Initializing Input Handler...');
  
  // Store references to game state functions
  gameState = gameStateModule.getGameState;
  updateGameState = {
    setKeyDown: gameStateModule.setKeyDown,
    addHoldPeriod: gameStateModule.addHoldPeriod,
    endHoldPeriod: gameStateModule.endHoldPeriod
  };
  
  // Store DOM element references
  tapIndicator1 = tapIndicators.player1;
  tapIndicator2 = tapIndicators.player2;
  
  console.log('✅ Input Handler initialized');
  return true;
}

// Start listening for input events
export function startListening() {
  if (!gameState) {
    console.error('❌ Input Handler not initialized');
    return false;
  }
  
  console.log('👂 Starting input listeners...');
  
  // Clear any existing listeners
  stopListening();
  
  // Add keyboard listeners
  const keyDownListener = (e) => handleKeyDown(e);
  const keyUpListener = (e) => handleKeyUp(e);
  
  document.addEventListener('keydown', keyDownListener, { passive: false });
  document.addEventListener('keyup', keyUpListener, { passive: false });
  
  // Add touch listeners for mobile
  const touchStartListener = (e) => handleTouchStart(e);
  const touchEndListener = (e) => handleTouchEnd(e);
  
  document.addEventListener('touchstart', touchStartListener, { passive: false });
  document.addEventListener('touchend', touchEndListener, { passive: false });
  
  // Store listeners for cleanup
  activeListeners = [
    { element: document, event: 'keydown', listener: keyDownListener },
    { element: document, event: 'keyup', listener: keyUpListener },
    { element: document, event: 'touchstart', listener: touchStartListener },
    { element: document, event: 'touchend', listener: touchEndListener }
  ];
  
  console.log('✅ Input listeners active');
  return true;
}

// Stop listening for input events
export function stopListening() {
  console.log('🔇 Stopping input listeners...');
  
  // Remove all active listeners
  activeListeners.forEach(({ element, event, listener }) => {
    element.removeEventListener(event, listener);
  });
  
  activeListeners = [];
  console.log('✅ Input listeners stopped');
}

// Handle keyboard press events
function handleKeyDown(e) {
  const state = gameState();
  
  // Only handle input if game is active
  if (!state.isActive) return;
  
  const mode = state.mode;
  const currentTime = performance.now();
  
  // Measure input latency for timing diagnostics
  if (window.recordTap) {
    window.recordTap(e.timeStamp);
  }
  
  // Debug logging
  if (DEBUG_INPUT) {
    console.log(`🔍 Key pressed: "${e.key}" (code: "${e.code}"), Mode: ${mode}`);
  }
  
  if (mode === 'single') {
    // Single player mode - spacebar only
    // Allow rapid taps for rhythm games - don't check if key is already down
    if (isValidKey(e, 'single')) {
      processTap(' ', currentTime, 1);
      showTapFeedback(1);
      e.preventDefault();
      if (DEBUG_INPUT) console.log('✅ Single player tap processed');
    } else if (DEBUG_INPUT) {
      console.log('❌ Single player key not valid');
    }
  } else {
    // Multiplayer mode
    if (DEBUG_INPUT) {
      console.log('🎮 Multiplayer mode - checking both players...');
    }
    
    if (isValidKey(e, 'multi', 'player1') && !state.keyIsDown['a']) {
      processTap('a', currentTime, 1);
      showTapFeedback(1);
      e.preventDefault();
      if (DEBUG_INPUT) console.log('✅ Player 1 tap processed');
    } else if ((e.key === 'a' || e.key === 'A') && state.keyIsDown['a'] && DEBUG_INPUT) {
      console.log('❌ Player 1 key already down');
    }
    
    if (isValidKey(e, 'multi', 'player2') && !state.keyIsDown['Enter']) {
      processTap('Enter', currentTime, 2);
      showTapFeedback(2);
      e.preventDefault();
      if (DEBUG_INPUT) console.log('✅ Player 2 tap processed');
    } else if ((e.key === 'Enter' || e.code === 'Enter') && state.keyIsDown['Enter'] && DEBUG_INPUT) {
      console.log('❌ Player 2 key already down');
    }
    
    // If no valid key, log what we tried
    if (!isValidKey(e, 'multi', 'player1') && !isValidKey(e, 'multi', 'player2') && DEBUG_INPUT) {
      console.log(`❌ Key "${e.key}" not valid for multiplayer mode`);
      console.log('🎯 Valid keys: A (Player 1), Enter (Player 2)');
    }
  }
}

// Handle keyboard release events
function handleKeyUp(e) {
  const state = gameState();
  const currentTime = performance.now();
  
  // Measure input latency for timing diagnostics
  if (window.recordTap) {
    window.recordTap(e.timeStamp);
  }
  
  if (DEBUG_INPUT) {
    console.log(`🔓 Key released: "${e.key}" (code: "${e.code}")`);
  }
  
  // Handle key releases for hold period tracking
  if (e.code === "Space" || e.key === " ") {
    updateGameState.setKeyDown(' ', false);
    if (state.currentlyHolding) {
      updateGameState.endHoldPeriod(currentTime, 1);
      updateTapDuration(currentTime, 1); // Track duration for analysis
      if (DEBUG_INPUT) console.log('🔚 Ended single player hold period');
    }
  }
  
  if (e.key === "a" || e.key === "A") {
    updateGameState.setKeyDown('a', false);
    if (state.currentlyHoldingP1) {
      updateGameState.endHoldPeriod(currentTime, 1);
      updateTapDuration(currentTime, 1); // Track duration for analysis
      if (DEBUG_INPUT) console.log('🔚 Ended Player 1 hold period');
    }
  }
  
  if (e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter") {
    updateGameState.setKeyDown('Enter', false);
    if (state.currentlyHoldingP2) {
      updateGameState.endHoldPeriod(currentTime, 2);
      updateTapDuration(currentTime, 2); // Track duration for analysis
      if (DEBUG_INPUT) console.log('🔚 Ended Player 2 hold period');
    }
  }
}

// Handle touch start events (mobile)
function handleTouchStart(e) {
  const state = gameState();
  
  // Only handle touch if game is active
  if (!state.isActive) return;
  
  const currentTime = performance.now();
  const mode = state.mode;
  
  if (mode === 'single') {
    // Single player - any touch
    processTap(' ', currentTime, 1);
    showTapFeedback(1);
  } else {
    // Multiplayer - treat as both players (simplified for demo)
    processTap('a', currentTime, 1);
    processTap('Enter', currentTime, 2);
    showTapFeedback(1);
    showTapFeedback(2);
  }
  
  e.preventDefault();
}

// Handle touch end events (mobile)
function handleTouchEnd(e) {
  const state = gameState();
  const currentTime = performance.now();
  const mode = state.mode;
  
  if (mode === 'single' && state.currentlyHolding) {
    updateGameState.endHoldPeriod(currentTime, 1);
  } else if (mode === 'multi') {
    if (state.currentlyHoldingP1) {
      updateGameState.endHoldPeriod(currentTime, 1);
    }
    if (state.currentlyHoldingP2) {
      updateGameState.endHoldPeriod(currentTime, 2);
    }
  }
  
  e.preventDefault();
}

// Process a tap input - now just records timing
function processTap(key, currentTime, player) {
  const state = gameState();
  
  // Update key state
  updateGameState.setKeyDown(key, true);
  
  // Start hold period if not already holding
  const isCurrentlyHolding = player === 1 ? 
    (state.mode === 'single' ? state.currentlyHolding : state.currentlyHoldingP1) :
    state.currentlyHoldingP2;
    
  if (!isCurrentlyHolding) {
    updateGameState.addHoldPeriod(currentTime, player);
  }
  
  console.log(`🎹 Tap recorded: Player ${player}, Time: ${currentTime.toFixed(2)}`);
  
  // Record tap for later analysis
  recordTapForAnalysis(currentTime, player);
}

// Enhanced tap recording for advanced analysis
function recordTapForAnalysis(tapTime, player) {
  // Use the existing recording system but enhance it
  if (typeof window !== 'undefined' && window.isRecording && window.recordedTaps && Array.isArray(window.recordedTaps)) {
    // Create a tap entry that will be updated when the key is released
    const tapEntry = {
      time: tapTime,
      player: player,
      startTime: tapTime,
      endTime: null, // Will be set when key is released
      duration: 0,   // Will be calculated
      isComplete: false
    };
    
    window.recordedTaps.push(tapEntry);
    console.log(`📝 Recorded tap #${window.recordedTaps.length} at ${tapTime.toFixed(2)} (duration tracking started)`);
  } else if (typeof window !== 'undefined' && window.recordedTaps) {
    console.log(`🚫 Tap ignored (not recording yet) at ${tapTime.toFixed(2)}`);
  }
}

// Update tap duration when key is released
function updateTapDuration(releaseTime, player) {
  if (typeof window !== 'undefined' && window.recordedTaps && Array.isArray(window.recordedTaps)) {
    // Find the most recent incomplete tap for this player
    for (let i = window.recordedTaps.length - 1; i >= 0; i--) {
      const tap = window.recordedTaps[i];
      if (tap.player === player && !tap.isComplete) {
        tap.endTime = releaseTime;
        tap.duration = releaseTime - tap.startTime;
        tap.isComplete = true;
        console.log(`⏱️ Updated tap duration: ${tap.duration.toFixed(2)}ms for player ${player}`);
        break;
      }
    }
  }
}

// Show visual feedback for tap
function showTapFeedback(player) {
  const indicator = player === 1 ? tapIndicator1 : tapIndicator2;
  const originalClass = player === 1 ? 'tap-indicator player1' : 'tap-indicator player2';
  
  if (indicator) {
    // Flash green
    indicator.style.background = '#0f0';
    
    // Reset after short delay
    setTimeout(() => {
      indicator.style.background = player === 1 ? '#86e1f7' : '#f6b8e0';
    }, 100);
  }
}

// Check if a key event is valid for current mode
function isValidKey(event, mode, player = null) {
  if (DEBUG_INPUT) {
    console.log(`🔍 Checking key: "${event.key}" (code: "${event.code}") for mode: ${mode}, player: ${player}`);
  }
  
  if (mode === 'single') {
    const valid = INPUT_CONFIG.single.keys.includes(event.key) || 
                  INPUT_CONFIG.single.keys.includes(event.code);
    if (DEBUG_INPUT) {
      console.log(`🎮 Single mode check: ${valid}`);
    }
    return valid;
  } else if (mode === 'multi' && player) {
    const playerConfig = INPUT_CONFIG.multi[player];
    if (!playerConfig) {
      if (DEBUG_INPUT) {
        console.log(`❌ No config for player: ${player}`);
      }
      return false;
    }
    
    const valid = playerConfig.keys.includes(event.key) || 
                  playerConfig.keys.includes(event.code);
    if (DEBUG_INPUT) {
      console.log(`🎮 Multi mode check for ${player}: ${valid} (looking for: ${playerConfig.keys.join(', ')})`);
    }
    return valid;
  }
  if (DEBUG_INPUT) {
    console.log(`❌ Invalid mode or missing player: mode=${mode}, player=${player}`);
  }
  return false;
}

// Get input instructions for current mode
export function getInputInstructions(mode) {
  if (mode === 'single') {
    return `Press ${INPUT_CONFIG.single.description} to tap`;
  } else {
    return `Player 1: ${INPUT_CONFIG.multi.player1.description}, Player 2: ${INPUT_CONFIG.multi.player2.description}`;
  }
}

// Get current input state for debugging
export function getInputState() {
  if (!gameState) {
    return { error: 'Input handler not initialized' };
  }
  
  const state = gameState();
  return {
    listening: activeListeners.length > 0,
    mode: state.mode,
    keyStates: state.keyIsDown,
    holdPeriods: {
      single: state.holdPeriods.length,
      player1: state.holdPeriodsP1.length,
      player2: state.holdPeriodsP2.length
    },
    currentlyHolding: {
      single: state.currentlyHolding,
      player1: state.currentlyHoldingP1,
      player2: state.currentlyHoldingP2
    }
  };
}

// Test function - simulate input
export function simulateInput(player = 1, duration = 100) {
  console.log(`🧪 Simulating input for player ${player}...`);
  
  const currentTime = performance.now();
  const key = player === 1 ? 'a' : 'Enter';
  
  // Simulate key down
  processTap(key, currentTime, player);
  showTapFeedback(player);
  
  // Simulate key up after duration
  setTimeout(() => {
    updateGameState.setKeyDown(key, false);
    updateGameState.endHoldPeriod(performance.now(), player);
    console.log(`✅ Input simulation complete for player ${player}`);
  }, duration);
}

// Emergency stop - clear all input handlers
export function emergencyStop() {
  console.log('🚨 Emergency stop - clearing all input handlers');
  stopListening();
  
  // Reset any visual feedback
  if (tapIndicator1) {
    tapIndicator1.style.background = '#86e1f7';
  }
  if (tapIndicator2) {
    tapIndicator2.style.background = '#f6b8e0';
  }
}