/**
 * VexFlow Pattern Factory - Optimized pattern generation
 * Based on VexFlow best practices and performance research
 */

export class VexFlowPatternFactory {
  constructor() {
    this.noteCache = new Map();
    this.beamCache = new Map();
    this.formatCache = new Map();
  }

  /**
   * Create optimized StaveNote with caching
   */
  createStaveNote(config) {
    const cacheKey = JSON.stringify(config);
    
    if (this.noteCache.has(cacheKey)) {
      // Return cloned note to avoid sharing state
      return this.cloneStaveNote(this.noteCache.get(cacheKey));
    }

    const { keys, duration, rest = false, dotted = false } = config;
    
    // Use VexFlow best practices for note creation
    const note = new Vex.Flow.StaveNote({
      keys: keys,
      duration: rest ? `${duration}r` : duration,
      auto_stem: true // Let VexFlow determine stem direction
    });

    // Add modifiers efficiently
    if (dotted) {
      Vex.Flow.Dot.buildAndAttach([note], { all: true });
    }

    // Cache the note
    this.noteCache.set(cacheKey, note);
    return this.cloneStaveNote(note);
  }

  /**
   * Clone a StaveNote for reuse (prevents state sharing)
   */
  cloneStaveNote(originalNote) {
    // Create new note with same properties
    const cloned = new Vex.Flow.StaveNote({
      keys: originalNote.keys,
      duration: originalNote.duration,
      auto_stem: originalNote.auto_stem
    });
    
    // Copy modifiers if any
    if (originalNote.modifiers) {
      originalNote.modifiers.forEach(modifier => {
        if (modifier.constructor.name === 'Dot') {
          Vex.Flow.Dot.buildAndAttach([cloned], { all: true });
        }
      });
    }
    
    return cloned;
  }

  /**
   * Optimized pattern conversion with caching
   */
  convertPatternToVexFlow(flatPattern) {
    const cacheKey = this.createPatternCacheKey(flatPattern);
    
    if (this.formatCache.has(cacheKey)) {
      return this.formatCache.get(cacheKey);
    }

    const notes = [];
    const restPositions = new Set();

    // Convert pattern to notes efficiently
    for (let i = 0; i < flatPattern.length; i++) {
      const element = flatPattern[i];
      
      // Skip barlines
      if (element.isBarline) continue;

      const noteConfig = this.createNoteConfig(element, i);
      const note = this.createStaveNote(noteConfig);
      
      notes.push(note);
      
      if (element.rest) {
        restPositions.add(i);
      }
    }

    const result = {
      notes,
      restPositions,
      beams: this.createOptimizedBeams(notes),
      voices: this.createOptimizedVoices(notes)
    };

    // Cache the result
    this.formatCache.set(cacheKey, result);
    return result;
  }

  /**
   * Create optimized beams using VexFlow's automatic beaming
   */
  createOptimizedBeams(notes) {
    try {
      // Use VexFlow's automatic beam generation (most efficient)
      return Vex.Flow.Beam.generateBeams(notes, {
        beam_rests: false,
        beam_middle_only: true,
        show_stemlets: false
      });
    } catch (error) {
      console.warn('Automatic beaming failed, falling back to manual:', error);
      return this.createManualBeams(notes);
    }
  }

  /**
   * Fallback manual beaming (more control, less efficient)
   */
  createManualBeams(notes) {
    const beams = [];
    let currentGroup = [];

    for (const note of notes) {
      const duration = note.getDuration();
      
      // Only beam 8th and 16th notes that aren't rests
      if ((duration === '8' || duration === '16') && !note.isRest()) {
        currentGroup.push(note);
      } else {
        // End current group
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

  /**
   * Create optimized voices
   */
  createOptimizedVoices(notes) {
    if (notes.length === 0) return [];

    const voice = new Vex.Flow.Voice({
      num_beats: 4,
      beat_value: 4,
      resolution: Vex.Flow.RESOLUTION
    });

    voice.addTickables(notes);
    return [voice];
  }

  /**
   * Create cache key for pattern
   */
  createPatternCacheKey(pattern) {
    return pattern
      .filter(el => !el.isBarline)
      .map(el => `${el.type}:${el.rest}:${el.dotted}`)
      .join('|');
  }

  /**
   * Create note configuration from pattern element
   */
  createNoteConfig(element, index) {
    // Determine note keys based on element type and position
    const keys = element.rest ? ['b/4'] : this.calculateNoteKeys(element, index);
    
    return {
      keys,
      duration: this.convertDuration(element.type),
      rest: element.rest,
      dotted: element.dotted
    };
  }

  /**
   * Calculate note keys for visual variety
   */
  calculateNoteKeys(element, index) {
    // Create visual variety while keeping it simple
    const baseNotes = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4'];
    return [baseNotes[index % baseNotes.length]];
  }

  /**
   * Convert duration types to VexFlow format
   */
  convertDuration(type) {
    const durationMap = {
      'whole': 'w',
      'half': 'h', 
      'quarter': 'q',
      'eighth': '8',
      'sixteenth': '16',
      'thirty-second': '32'
    };
    
    return durationMap[type] || 'q';
  }

  /**
   * Render pattern with optimized formatting
   */
  renderOptimized(context, stave, vexflowData) {
    try {
      // Clear context efficiently
      context.clear();
      
      // Draw stave
      stave.setContext(context).draw();
      
      // Use VexFlow's optimized formatter
      Vex.Flow.Formatter.FormatAndDraw(context, stave, vexflowData.notes);
      
      // Draw beams efficiently
      vexflowData.beams.forEach(beam => {
        beam.setContext(context).draw();
      });
      
      return true;
    } catch (error) {
      console.error('VexFlow rendering failed:', error);
      return false;
    }
  }

  /**
   * Clear all caches to prevent memory leaks
   */
  clearCache() {
    this.noteCache.clear();
    this.beamCache.clear();
    this.formatCache.clear();
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats() {
    return {
      notes: this.noteCache.size,
      beams: this.beamCache.size,
      formats: this.formatCache.size
    };
  }
}

// Export singleton instance
export const vexflowFactory = new VexFlowPatternFactory();

export default VexFlowPatternFactory;
