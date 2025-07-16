// Notation Module - Handles music notation rendering with VexFlow

let vexflowRenderer = null;
let vexflowContext = null;
let currentStave = null;
let currentNotes = []; // Store current notes for highlighting
let currentVoice = null;
let currentBeams = [];

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

// Convert pattern data to VexFlow format
function convertPatternToVexFlow(flatPattern) {
  const vexflowNotes = [];
  
  for (let i = 0; i < flatPattern.length; i++) {
    const note = flatPattern[i];
    
    // Skip barlines in flattened pattern
    if (note.isBarline) continue;
    
    let duration;
    let noteType;
    
    // Convert note type to VexFlow duration
    switch (note.type) {
      case 'quarter':
        duration = 'q';
        break;
      case 'eighth':
        duration = '8';
        break;
      case 'sixteenth':
        duration = '16';
        break;
      default:
        duration = 'q'; // fallback
    }
    
    // Add rest suffix if it's a rest
    if (note.rest) {
      duration += 'r';
      noteType = 'rest';
    } else {
      noteType = 'note';
    }
    
    // Handle dotted notes
    if (note.dotted) {
      duration += 'd';
    }
    
    // Create VexFlow note object
    if (note.rest) {
      vexflowNotes.push(
        new Vex.Flow.StaveNote({
          keys: ['b/4'], // Rest position doesn't matter much
          duration: duration
        })
      );
    } else {
      vexflowNotes.push(
        new Vex.Flow.StaveNote({
          keys: ['b/4'], // Middle line for rhythm notation
          duration: duration
        })
      );
    }
  }
  
  return vexflowNotes;
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

// Render a pattern using VexFlow
export function renderPattern(flatPattern) {
  if (!vexflowContext) {
    console.error('❌ VexFlow not initialized. Call initNotation() first.');
    return false;
  }
  
  console.log('🎼 Rendering pattern with VexFlow...', flatPattern);
  
  try {
    // Clear previous notation
    vexflowContext.clear();
    
    // Create a staff (musical staff lines)
    const stave = new Vex.Flow.Stave(50, 10, 500);
    currentStave = stave;
    
    // Add treble clef and time signature
    stave.addClef('treble').addTimeSignature('4/4');
    
    // Draw the staff
    stave.setContext(vexflowContext).draw();
    
    // Convert pattern to VexFlow notes
    const notes = convertPatternToVexFlow(flatPattern);
    currentNotes = notes; // Store for highlighting
    
    if (notes.length === 0) {
      console.warn('⚠️ No notes to render');
      return false;
    }
    
    // Create a voice (musical voice) to hold the notes
    const voice = new Vex.Flow.Voice({
      num_beats: 4,
      beat_value: 4
    });
    currentVoice = voice;
    
    // Add notes to voice
    voice.addTickables(notes);
    
    // Format the voice to fit the staff
    const formatter = new Vex.Flow.Formatter();
    formatter.joinVoices([voice]).format([voice], 400);
    
    // Create beams for grouped notes
    const beams = createBeams(notes);
    currentBeams = beams;
    
    // Draw everything
    voice.draw(vexflowContext, stave);
    
    // Draw beams
    beams.forEach(beam => {
      beam.setContext(vexflowContext).draw();
    });
    
    console.log('✅ Pattern rendered successfully');
    return true;
    
  } catch (error) {
    console.error('❌ Error rendering pattern:', error);
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

// Get current real-time tracking state
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