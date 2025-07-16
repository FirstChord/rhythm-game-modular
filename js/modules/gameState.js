// Game State Module - Manages scores, timing, and game flow

// Game state object - this is our "single source of truth"
let gameState = {
  // Game configuration
  mode: 'single', // 'single' or 'multi'
  speed: 'medium',
  selectedLevel: 'beginner',
  totalGames: 3,
  
  // Current game state
  isActive: false,
  currentPatternIdx: 0,
  gameStartTime: 0,
  beatCount: 0,
  beatActiveIdx: -1,
  
  // Timing and scoring
  expectedBeatTimes: [],
  SCORING_WINDOWS: { perfect: 70, good: 170 },
  
  // Single player stats
  score: 0,
  beatHitResults: [],
  
  // Multiplayer stats
  score1: 0,
  score2: 0,
  beatHitResultsP1: [],
  beatHitResultsP2: [],
  
  // Session tracking
  gamesPlayed: 0,
  cumulativeScore1: 0,
  cumulativeScore2: 0,
  accArray1: [],
  accArray2: [],
  
  // Input tracking
  keyIsDown: { 'a': false, 'Enter': false, ' ': false },
  lastTapTime: { 'a': 0, 'Enter': 0, ' ': 0 },
  holdPeriods: [],
  currentlyHolding: false,
  holdPeriodsP1: [],
  currentlyHoldingP1: false,
  holdPeriodsP2: [],
  currentlyHoldingP2: false
};

// Initialize the game state
export function initGameState(initialConfig = {}) {
  // Reset to defaults
  resetGameState();
  
  // Apply any initial configuration
  Object.assign(gameState, initialConfig);
  
  console.log('🎮 Game State initialized:', getStateSnapshot());
  return gameState;
}

// Reset game state to defaults
export function resetGameState() {
  Object.assign(gameState, {
    isActive: false,
    currentPatternIdx: 0,
    gameStartTime: 0,
    beatCount: 0,
    beatActiveIdx: -1,
    expectedBeatTimes: [],
    score: 0,
    score1: 0,
    score2: 0,
    beatHitResults: [],
    beatHitResultsP1: [],
    beatHitResultsP2: [],
    keyIsDown: { 'a': false, 'Enter': false, ' ': false },
    lastTapTime: { 'a': 0, 'Enter': 0, ' ': 0 },
    holdPeriods: [],
    currentlyHolding: false,
    holdPeriodsP1: [],
    currentlyHoldingP1: false,
    holdPeriodsP2: [],
    currentlyHoldingP2: false
  });
}

// Start a new game
export function startNewGame() {
  console.log('🚀 Starting new game...');
  
  // Reset current game data but keep session data
  gameState.isActive = true;
  gameState.gameStartTime = performance.now();
  gameState.beatCount = 0;
  gameState.beatActiveIdx = -1;
  gameState.score = 0;
  gameState.score1 = 0;
  gameState.score2 = 0;
  gameState.beatHitResults = [];
  gameState.beatHitResultsP1 = [];
  gameState.beatHitResultsP2 = [];
  gameState.expectedBeatTimes = [];
  
  // Reset input state
  gameState.keyIsDown = { 'a': false, 'Enter': false, ' ': false };
  gameState.holdPeriods = [];
  gameState.currentlyHolding = false;
  gameState.holdPeriodsP1 = [];
  gameState.currentlyHoldingP1 = false;
  gameState.holdPeriodsP2 = [];
  gameState.currentlyHoldingP2 = false;
  
  console.log('✅ New game started');
}

// End the current game
export function endGame() {
  console.log('🏁 Ending game...');
  gameState.isActive = false;
  gameState.gamesPlayed++;
  
  // Update cumulative stats
  if (gameState.mode === 'multi') {
    gameState.cumulativeScore1 += gameState.score1;
    gameState.cumulativeScore2 += gameState.score2;
    
    // Calculate accuracies
    const totalNotes = gameState.beatHitResults.length;
    const acc1 = totalNotes > 0 ? Math.round(100 * gameState.beatHitResultsP1.filter(r => r === 'perfect' || r === 'good').length / totalNotes) : 0;
    const acc2 = totalNotes > 0 ? Math.round(100 * gameState.beatHitResultsP2.filter(r => r === 'perfect' || r === 'good').length / totalNotes) : 0;
    
    gameState.accArray1.push(acc1);
    gameState.accArray2.push(acc2);
  }
  
  console.log('📊 Game ended. Games played:', gameState.gamesPlayed);
}

// Configuration setters
export function setGameMode(mode) {
  if (mode !== 'single' && mode !== 'multi') {
    console.warn('⚠️ Invalid game mode:', mode);
    return false;
  }
  gameState.mode = mode;
  console.log('🎮 Mode changed to:', mode);
  return true;
}

export function setSpeed(speed) {
  if (!['slow', 'medium', 'fast'].includes(speed)) {
    console.warn('⚠️ Invalid speed:', speed);
    return false;
  }
  gameState.speed = speed;
  console.log('⚡ Speed changed to:', speed);
  return true;
}

export function setLevel(level) {
  gameState.selectedLevel = level;
  console.log('🎯 Level changed to:', level);
  return true;
}

export function setTotalGames(total) {
  if (total < 1) {
    console.warn('⚠️ Total games must be at least 1');
    return false;
  }
  gameState.totalGames = total;
  
  // Reset session if changing mid-session
  if (gameState.gamesPlayed > 0) {
    resetSession();
  }
  
  console.log('🎮 Total games set to:', total);
  return true;
}

// Reset session data (for new tournament/series)
export function resetSession() {
  gameState.gamesPlayed = 0;
  gameState.cumulativeScore1 = 0;
  gameState.cumulativeScore2 = 0;
  gameState.accArray1 = [];
  gameState.accArray2 = [];
  console.log('🔄 Session reset');
}

// Scoring functions
export function updateScore(points, player = 1) {
  if (gameState.mode === 'single') {
    gameState.score += points;
  } else {
    if (player === 1) {
      gameState.score1 += points;
    } else if (player === 2) {
      gameState.score2 += points;
    }
  }
}

export function recordHit(result, beatIndex, player = 1) {
  if (gameState.mode === 'single') {
    gameState.beatHitResults[beatIndex] = result;
  } else {
    if (player === 1) {
      gameState.beatHitResultsP1[beatIndex] = result;
    } else if (player === 2) {
      gameState.beatHitResultsP2[beatIndex] = result;
    }
  }
  
  // Award points based on result
  const points = result === 'perfect' ? 10 : result === 'good' ? 5 : 0;
  updateScore(points, player);
}

// Input state management
export function setKeyDown(key, isDown) {
  gameState.keyIsDown[key] = isDown;
  if (isDown) {
    gameState.lastTapTime[key] = performance.now();
  }
}

export function addHoldPeriod(startTime, player = 1) {
  const holdPeriod = { down: startTime, up: null };
  
  if (gameState.mode === 'single') {
    gameState.holdPeriods.push(holdPeriod);
    gameState.currentlyHolding = true;
  } else {
    if (player === 1) {
      gameState.holdPeriodsP1.push(holdPeriod);
      gameState.currentlyHoldingP1 = true;
    } else {
      gameState.holdPeriodsP2.push(holdPeriod);
      gameState.currentlyHoldingP2 = true;
    }
  }
  
  return holdPeriod;
}

export function endHoldPeriod(endTime, player = 1) {
  let holdPeriods, currentlyHolding;
  
  if (gameState.mode === 'single') {
    holdPeriods = gameState.holdPeriods;
    gameState.currentlyHolding = false;
  } else {
    if (player === 1) {
      holdPeriods = gameState.holdPeriodsP1;
      gameState.currentlyHoldingP1 = false;
    } else {
      holdPeriods = gameState.holdPeriodsP2;
      gameState.currentlyHoldingP2 = false;
    }
  }
  
  const lastHold = holdPeriods[holdPeriods.length - 1];
  if (lastHold && lastHold.up === null) {
    lastHold.up = endTime;
  }
}

// Timing functions
export function setExpectedBeatTimes(times) {
  gameState.expectedBeatTimes = [...times];
}

export function setBeatActive(index) {
  gameState.beatActiveIdx = index;
  gameState.beatCount = index + 1;
}

// State getters
export function getGameState() {
  return gameState;
}

export function getStateSnapshot() {
  return {
    mode: gameState.mode,
    speed: gameState.speed,
    level: gameState.selectedLevel,
    isActive: gameState.isActive,
    gamesPlayed: gameState.gamesPlayed,
    totalGames: gameState.totalGames,
    currentScore: gameState.mode === 'single' ? gameState.score : { p1: gameState.score1, p2: gameState.score2 }
  };
}

export function getSessionStats() {
  if (gameState.mode === 'single') {
    return {
      gamesPlayed: gameState.gamesPlayed,
      currentScore: gameState.score
    };
  } else {
    const avgAcc1 = gameState.accArray1.length ? Math.round(gameState.accArray1.reduce((a, b) => a + b, 0) / gameState.accArray1.length) : 0;
    const avgAcc2 = gameState.accArray2.length ? Math.round(gameState.accArray2.reduce((a, b) => a + b, 0) / gameState.accArray2.length) : 0;
    
    return {
      gamesPlayed: gameState.gamesPlayed,
      totalGames: gameState.totalGames,
      player1: {
        totalScore: gameState.cumulativeScore1,
        currentScore: gameState.score1,
        averageAccuracy: avgAcc1,
        accuracyHistory: [...gameState.accArray1]
      },
      player2: {
        totalScore: gameState.cumulativeScore2,
        currentScore: gameState.score2,
        averageAccuracy: avgAcc2,
        accuracyHistory: [...gameState.accArray2]
      }
    };
  }
}

export function isSessionComplete() {
  return gameState.gamesPlayed >= gameState.totalGames;
}

export function getSessionWinner() {
  if (gameState.mode === 'single' || !isSessionComplete()) {
    return null;
  }
  
  const stats = getSessionStats();
  if (stats.player1.averageAccuracy > stats.player2.averageAccuracy) {
    return { winner: 1, message: '🏆 Player 1 Wins!' };
  } else if (stats.player2.averageAccuracy > stats.player1.averageAccuracy) {
    return { winner: 2, message: '🏆 Player 2 Wins!' };
  } else {
    return { winner: 0, message: '🤝 It\'s a Draw!' };
  }
}

// Debug helpers
export function debugState() {
  console.log('🔍 Current Game State:', gameState);
  console.log('📊 Session Stats:', getSessionStats());
  return gameState;
}