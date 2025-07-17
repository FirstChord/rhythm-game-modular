// Notation Module - Handles music notation rendering with VexFlow
// Now with professional optimization and performance improvements

import { vexflowFactory } from '../utils/VexFlowPatternFactory.js';
import { globalPerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { globalResourceManager } from '../utils/ResourceManager.js';

let vexflowRenderer = null;
let vexflowContext = null;
let currentStave = null;
let currentNotes = []; // Store current notes for highlighting
let currentVoice = null;
let currentBeams = [];
let currentVexFlowData = null; // Cache current rendered data

// Initialize VexFlow
export function initNotation(containerId = 'vexflowOutput') {
  console.log('🎼 Initializing VexFlow notation...');
  
  // Check if VexFlow is loaded
  if (typeof Vex === 'undefined') {
    console.error('❌ VexFlow not loaded! Make sure the VexFlow script is included.');
    return false;
  }
  
  const container = document.getElementById(containerId);
  if (!container) {
    console.error('❌ Container element not found:', containerId);
    return false;
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Create VexFlow renderer
  vexflowRenderer = new Vex.Flow.Renderer(container, Vex.Flow.Renderer.Backends.SVG);
  vexflowRenderer.resize(600, 150);
  vexflowContext = vexflowRenderer.getContext();
  
  console.log('✅ VexFlow notation initialized');
  return true;
}

// Optimized pattern conversion using professional factory
function convertPatternToVexFlow(flatPattern) {
  globalPerformanceMonitor.mark('pattern-conversion-start');
  
  try {
    // Use optimized factory for pattern conversion
    const vexflowData = vexflowFactory.convertPatternToVexFlow(flatPattern);
    
    globalPerformanceMonitor.mark('pattern-conversion-end');
    globalPerformanceMonitor.measure('pattern-conversion', 'pattern-conversion-start', 'pattern-conversion-end');
    
    return vexflowData.notes; // Return notes for backward compatibility
  } catch (error) {
    console.error('❌ Pattern conversion failed:', error);
    return [];
  }
}

// Group notes for beaming (VexFlow handles this automatically for 8th and 16th notes)
function createBeams(notes) {
  const beams = [];
  
  // Find groups of beamable notes (8th and 16th notes that aren't rests)
  let currentGroup = [];
  
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const duration = note.getDuration();
    
    // Check if note can be beamed (8th or 16th note, not a rest)
    if ((duration === '8' || duration === '16') && !note.isRest()) {
      currentGroup.push(note);
    } else {
      // End current group and start beam if we have 2+ notes
      if (currentGroup.length >= 2) {
        beams.push(new Vex.Flow.Beam(currentGroup));
      }
      currentGroup = [];
    }
  }
  
  // Handle final group
  if (currentGroup.length >= 2) {
    beams.push(new Vex.Flow.Beam(currentGroup));
  }
  
  return beams;
}

// Render a pattern using VexFlow (OPTIMIZED VERSION)
export function renderPattern(flatPattern) {
  if (!vexflowContext) {
    console.error('❌ VexFlow not initialized. Call initNotation() first.');
    return false;
  }

  globalPerformanceMonitor.mark('vexflow-render-start');
  console.log('🎼 Rendering pattern with optimized VexFlow...', flatPattern);
  
  try {
    // Get optimized VexFlow data from factory
    currentVexFlowData = vexflowFactory.convertPatternToVexFlow(flatPattern);
    currentNotes = currentVexFlowData.notes; // Store for highlighting
    currentBeams = currentVexFlowData.beams; // Store beams
    
    if (currentNotes.length === 0) {
      console.warn('⚠️ No notes to render');
      return false;
    }

    // Create optimized stave
    const stave = new Vex.Flow.Stave(50, 10, 500);
    stave.addClef('treble').addTimeSignature('4/4');
    currentStave = stave;
    
    // Use factory's optimized rendering
    const success = vexflowFactory.renderOptimized(vexflowContext, stave, currentVexFlowData);
    
    globalPerformanceMonitor.mark('vexflow-render-end');
    globalPerformanceMonitor.measure('vexflow-render', 'vexflow-render-start', 'vexflow-render-end');
    
    if (success) {
      console.log('✅ Pattern rendered successfully with optimization');
      return true;
    } else {
      console.warn('⚠️ Optimized rendering failed, attempting fallback');
      return renderPatternFallback(flatPattern);
    }
    
  } catch (error) {
    console.error('❌ Error in optimized rendering:', error);
    return renderPatternFallback(flatPattern);
  }
}

// Fallback rendering method (original approach)
function renderPatternFallback(flatPattern) {
  try {
    console.log('🔄 Using fallback rendering...');
    
    // Clear previous notation
    vexflowContext.clear();
    
    // Create a staff (musical staff lines)
    const stave = new Vex.Flow.Stave(50, 10, 500);
    currentStave = stave;
    
    // Add treble clef and time signature
    stave.addClef('treble').addTimeSignature('4/4');
    
    // Draw the staff
    stave.setContext(vexflowContext).draw();
    
    // Convert pattern to VexFlow notes (simplified version)
    const notes = convertPatternToVexFlow(flatPattern);
    currentNotes = notes; // Store for highlighting
    
    if (notes.length === 0) {
      console.warn('⚠️ No notes to render');
      return false;
    }
    
    // Use VexFlow's FormatAndDraw helper for simplicity
    Vex.Flow.Formatter.FormatAndDraw(vexflowContext, stave, notes);
    
    // Create and draw beams using VexFlow automatic beaming
    const beams = Vex.Flow.Beam.generateBeams(notes);
    currentBeams = beams;
    beams.forEach(beam => {
      beam.setContext(vexflowContext).draw();
    });
    
    console.log('✅ Fallback pattern rendered successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Fallback rendering also failed:', error);
    return false;
  }
}

// Highlight a specific beat in the notation
export function highlightBeat(beatIndex, color = '#ff6b6b') {
  if (!currentNotes || beatIndex >= currentNotes.length || beatIndex < 0) {
    return false;
  }
  
  try {
    const note = currentNotes[beatIndex];
    
    // Get the note's SVG element and highlight it
    const svg = vexflowRenderer.getContext().svg;
    const noteElements = svg.querySelectorAll('.vf-stavenote');
    
    if (noteElements[beatIndex]) {
      // Reset all notes first
      clearAllHighlights();
      
      // Highlight current note
      noteElements[beatIndex].style.fill = color;
      noteElements[beatIndex].style.stroke = color;
      
      console.log(`🎯 Highlighted beat ${beatIndex}`);
      return true;
    }
    
  } catch (error) {
    console.error('❌ Error highlighting beat:', error);
  }
  
  return false;
}

// Clear all note highlights
export function clearAllHighlights() {
  try {
    const svg = vexflowRenderer.getContext().svg;
    const noteElements = svg.querySelectorAll('.vf-stavenote');
    
    noteElements.forEach(element => {
      element.style.fill = '#000000';  // Reset to black
      element.style.stroke = '#000000';
    });
    
  } catch (error) {
    console.error('❌ Error clearing highlights:', error);
  }
}

// Highlight the next beat in sequence (for real-time playback)
let currentHighlightIndex = -1;

export function highlightNextBeat() {
  currentHighlightIndex++;
  
  if (currentHighlightIndex >= currentNotes.length) {
    // End of pattern - clear highlights and reset
    clearAllHighlights();
    currentHighlightIndex = -1;
    return false;
  }
  
  return highlightBeat(currentHighlightIndex, '#4CAF50'); // Green highlight for current beat
}

// Reset beat highlighting to start
export function resetBeatHighlighting() {
  currentHighlightIndex = -1;
  clearAllHighlights();
}

// Get current highlight position (keeping for compatibility)
export function getCurrentHighlightIndex() {
  return currentHighlightIndex;
}

// Real-time tracking state
let isRealTimeTracking = false;
let realTimeCurrentBeat = -1;
let realTimePattern = [];

// Start real-time tracking mode
export function startRealTimeTracking(pattern) {
  isRealTimeTracking = true;
  realTimeCurrentBeat = -1;
  realTimePattern = pattern.filter(note => !note.isBarline); // Remove barlines for tracking
  resetBeatHighlighting();
  console.log('🎯 Real-time tracking started', realTimePattern);
}

// Stop real-time tracking mode
export function stopRealTimeTracking() {
  isRealTimeTracking = false;
  realTimeCurrentBeat = -1;
  realTimePattern = [];
  clearAllHighlights();
  console.log('⏹ Real-time tracking stopped');
}

// Advance to next beat in real-time tracking
export function advanceRealTimeBeat() {
  if (!isRealTimeTracking) return false;
  
  realTimeCurrentBeat++;
  
  if (realTimeCurrentBeat >= realTimePattern.length) {
    // End of pattern
    stopRealTimeTracking();
    return false;
  }
  
  // Highlight current beat
  highlightBeat(realTimeCurrentBeat, '#4CAF50'); // Green for current beat
  console.log(`🎯 Advanced to beat ${realTimeCurrentBeat + 1}/${realTimePattern.length}`);
  return true;
}

// Check if a tap hits the current beat (for input feedback)
export function checkTapTiming(tapTime, expectedTime, tolerance = { perfect: 70, good: 170 }) {
  if (!isRealTimeTracking) return null;
  
  const timeDiff = Math.abs(tapTime - expectedTime);
  
  if (timeDiff <= tolerance.perfect) {
    return 'perfect';
  } else if (timeDiff <= tolerance.good) {
    return 'good';
  } else {
    return 'miss';
  }
}

// Show tap feedback on the notation
export function showTapFeedback(beatIndex, result) {
  if (beatIndex < 0 || beatIndex >= currentNotes.length) return false;
  
  let color;
  switch (result) {
    case 'perfect':
      color = '#4CAF50'; // Green
      break;
    case 'good':
      color = '#FFC107'; // Yellow
      break;
    case 'miss':
      color = '#F44336'; // Red
      break;
    default:
      color = '#9E9E9E'; // Gray
  }
  
  // Highlight the beat with feedback color
  highlightBeat(beatIndex, color);
  
  // Add visual indicator
  setTimeout(() => {
    // Return to normal color after feedback
    if (beatIndex === realTimeCurrentBeat) {
      highlightBeat(beatIndex, '#4CAF50'); // Back to current beat color
    }
  }, 300);
  
  console.log(`🎹 Tap feedback: ${result} on beat ${beatIndex + 1}`);
  return true;
}

// Game flow states
let gameFlowState = 'ready'; // 'ready', 'counting', 'playing', 'complete'
let countInBeat = 0;

// Start count-in sequence
export function startCountIn() {
  gameFlowState = 'counting';
  countInBeat = 0;
  clearAllHighlights();
  
  // Show count-in indicator
  showCountInIndicator(countInBeat + 1);
  console.log('🎼 Count-in started: 1...');
  
  return true;
}

// Advance count-in beat
export function advanceCountIn() {
  countInBeat++;
  
  if (countInBeat >= 4) {
    // Count-in complete, start game
    gameFlowState = 'playing';
    showGameStartIndicator();
    console.log('🚀 Count-in complete - Game starting!');
    return { complete: true, beat: countInBeat };
  } else {
    // Continue counting
    showCountInIndicator(countInBeat + 1);
    console.log(`🎼 Count-in: ${countInBeat + 1}...`);
    return { complete: false, beat: countInBeat };
  }
}

// Show count-in number overlay
function showCountInIndicator(number) {
  // Find or create count-in overlay
  let overlay = document.getElementById('countInOverlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'countInOverlay';
    overlay.style.position = 'absolute';
    overlay.style.top = '50%';
    overlay.style.left = '50%';
    overlay.style.transform = 'translate(-50%, -50%)';
    overlay.style.fontSize = '4rem';
    overlay.style.fontWeight = 'bold';
    overlay.style.color = '#2196F3';
    overlay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.3)';
    overlay.style.zIndex = '1000';
    overlay.style.pointerEvents = 'none';
    
    // Add to the notation container
    const container = document.getElementById('vexflowOutput');
    if (container) {
      container.style.position = 'relative';
      container.appendChild(overlay);
    }
  }
  
  overlay.textContent = number.toString();
  overlay.style.display = 'block';
  
  // Add animation
  overlay.style.transform = 'translate(-50%, -50%) scale(1.5)';
  overlay.style.opacity = '1';
  
  setTimeout(() => {
    if (overlay) {
      overlay.style.transform = 'translate(-50%, -50%) scale(1)';
    }
  }, 100);
}

// Show "GO!" indicator when game starts
function showGameStartIndicator() {
  let overlay = document.getElementById('countInOverlay');
  
  if (overlay) {
    overlay.textContent = 'GO!';
    overlay.style.color = '#4CAF50';
    overlay.style.transform = 'translate(-50%, -50%) scale(1.8)';
    
    // Hide after short time
    setTimeout(() => {
      if (overlay) {
        overlay.style.display = 'none';
      }
    }, 800);
  }
}

// Hide count-in overlay
export function hideCountInIndicator() {
  const overlay = document.getElementById('countInOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

// Check timing with first-beat leeway
export function checkTapTimingWithLeeway(tapTime, expectedTime, beatIndex, tolerance = { perfect: 70, good: 170 }) {
  if (!isRealTimeTracking) return null;
  
  // Generous leeway for first beat
  let adjustedTolerance = tolerance;
  if (beatIndex === 0) {
    adjustedTolerance = {
      perfect: 150,  // Much more generous
      good: 300      // Even more generous
    };
  }
  
  const timeDiff = Math.abs(tapTime - expectedTime);
  
  if (timeDiff <= adjustedTolerance.perfect) {
    return 'perfect';
  } else if (timeDiff <= adjustedTolerance.good) {
    return 'good';
  } else {
    return 'miss';
  }
}

// Get current game flow state
export function getGameFlowState() {
  return {
    state: gameFlowState,
    countInBeat: countInBeat,
    isCountingIn: gameFlowState === 'counting',
    isPlaying: gameFlowState === 'playing',
    isComplete: gameFlowState === 'complete'
  };
}

// Reset game flow
export function resetGameFlow() {
  gameFlowState = 'ready';
  countInBeat = 0;
  hideCountInIndicator();
  stopRealTimeTracking();
}

// Complete the pattern
export function completePattern() {
  gameFlowState = 'complete';
  stopRealTimeTracking();
  
  // Show completion indicator
  showCompletionIndicator();
  
  console.log('🎉 Pattern completed!');
}

// Show completion message
function showCompletionIndicator() {
  let overlay = document.getElementById('countInOverlay');
  
  if (overlay) {
    overlay.textContent = '🎉 COMPLETE! 🎉';
    overlay.style.color = '#FF6B35';
    overlay.style.fontSize = '2.5rem';
    overlay.style.display = 'block';
    overlay.style.transform = 'translate(-50%, -50%) scale(1.2)';
    overlay.style.opacity = '1';
    
    // Animate
    setTimeout(() => {
      if (overlay) {
        overlay.style.transform = 'translate(-50%, -50%) scale(1)';
      }
    }, 200);
  }
}

// Get current real-time tracking state (keeping for compatibility)
export function getRealTimeState() {
  return {
    isTracking: isRealTimeTracking,
    currentBeat: realTimeCurrentBeat,
    totalBeats: realTimePattern.length,
    pattern: realTimePattern
  };
}

// Render the current pattern from the patterns module
export function renderCurrentPattern(getCurrentPatternFunction) {
  const currentPattern = getCurrentPatternFunction();
  return renderPattern(currentPattern);
}

// Test function - render a simple pattern
export function testNotation() {
  console.log('🧪 Testing VexFlow with simple pattern...');
  
  // Simple test pattern: quarter, eighth, eighth, quarter
  const testPattern = [
    { type: 'quarter', rest: false },
    { type: 'eighth', rest: false },
    { type: 'eighth', rest: false },
    { type: 'quarter', rest: false }
  ];
  
  return renderPattern(testPattern);
}

// Get VexFlow status for debugging
export function getNotationStatus() {
  return {
    vexflowLoaded: typeof Vex !== 'undefined',
    rendererInitialized: vexflowRenderer !== null,
    contextReady: vexflowContext !== null,
    notesCount: currentNotes ? currentNotes.length : 0,
    currentHighlight: currentHighlightIndex
  };
}

// Test beat highlighting
export function testBeatHighlighting() {
  console.log('🧪 Testing beat highlighting...');
  
  if (!currentNotes || currentNotes.length === 0) {
    console.error('❌ No notes to highlight. Render a pattern first.');
    return false;
  }
  
  let beatIndex = 0;
  
  const highlightNext = () => {
    if (beatIndex >= currentNotes.length) {
      clearAllHighlights();
      console.log('✅ Beat highlighting test complete');
      return;
    }
    
    highlightBeat(beatIndex, '#ff6b6b');
    console.log(`🎯 Highlighting beat ${beatIndex + 1}/${currentNotes.length}`);
    beatIndex++;
    
    setTimeout(highlightNext, 500); // Highlight next beat every 500ms
  };
  
  highlightNext();
  return true;
}

// Professional cleanup and resource management
export function cleanupNotation() {
  console.log('🧹 Cleaning up VexFlow resources...');
  
  // Clear cache in factory
  vexflowFactory.clearCache();
  
  // Clear current state
  currentNotes = [];
  currentBeams = [];
  currentVoice = null;
  currentStave = null;
  currentVexFlowData = null;
  
  // Clear context if available
  if (vexflowContext) {
    try {
      vexflowContext.clear();
    } catch (error) {
      console.warn('Warning: Could not clear VexFlow context:', error);
    }
  }
  
  console.log('✅ VexFlow cleanup complete');
}

// Get performance statistics
export function getNotationStats() {
  return {
    cacheStats: vexflowFactory.getCacheStats(),
    currentNotes: currentNotes.length,
    currentBeams: currentBeams.length,
    isInitialized: !!vexflowContext
  };
}

// Register cleanup with resource manager
if (typeof globalResourceManager !== 'undefined') {
  globalResourceManager.addEventListener(window, 'beforeunload', cleanupNotation);
}

// Performance monitoring integration
export function benchmarkNotationPerformance(pattern, iterations = 10) {
  console.log(`🏃‍♂️ Benchmarking notation performance (${iterations} iterations)...`);
  
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    renderPattern(pattern);
    const end = performance.now();
    times.push(end - start);
  }
  
  const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  const results = {
    average: avgTime.toFixed(2) + 'ms',
    minimum: minTime.toFixed(2) + 'ms', 
    maximum: maxTime.toFixed(2) + 'ms',
    iterations,
    cacheStats: vexflowFactory.getCacheStats()
  };
  
  console.log('📊 Notation Performance Results:', results);
  return results;
}