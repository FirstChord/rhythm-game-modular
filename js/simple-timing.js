// Simple, reliable timing system for rhythm game
// This replaces the complex timing logic in main.js

class SimpleRhythmTracker {
  constructor(bpm = 100) {
    this.bpm = bpm;
    this.beatInterval = 60000 / bpm; // ms between beats
    this.isRecording = false;
    this.recordedTaps = [];
    this.expectedBeats = [];
    this.startTime = 0;
    this.tolerance = 300; // ms tolerance for tap matching
    
    // Audio latency compensation system
    this.audioLatencyCompensation = this.detectAudioLatency();
    this.adaptiveCompensation = true;
    this.compensationHistory = [];
  }

  // Detect audio latency based on browser and system
  detectAudioLatency() {
    const userAgent = navigator.userAgent;
    let baseLatency = 100; // Default fallback
    
    // Browser-specific baselines (from testing)
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      baseLatency = 250; // Based on your Chrome test
    } else if (userAgent.includes('Firefox')) {
      baseLatency = 200; // Firefox typically lower
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      baseLatency = 150; // Safari often better on Mac
    } else if (userAgent.includes('Edg')) {
      baseLatency = 220; // Edge similar to Chrome
    }
    
    // OS-specific adjustments
    if (userAgent.includes('Mac')) {
      baseLatency *= 0.9; // Macs often have better audio
    } else if (userAgent.includes('Windows')) {
      baseLatency *= 1.1; // Windows can have more latency
    }
    
    console.log(`🎵 Auto-detected audio latency: ${baseLatency.toFixed(0)}ms`);
    return baseLatency;
  }
  
  // Manual override for custom latency
  setAudioLatencyCompensation(latencyMs) {
    this.audioLatencyCompensation = latencyMs;
    console.log(`🎵 Manual audio latency set: ${latencyMs}ms`);
  }
  
  // Enable/disable adaptive compensation
  setAdaptiveCompensation(enabled) {
    this.adaptiveCompensation = enabled;
    console.log(`🎵 Adaptive compensation: ${enabled ? 'ON' : 'OFF'}`);
  }
  startRecording() {
    this.isRecording = true;
    this.recordedTaps = [];
    this.expectedBeats = [];
    this.startTime = performance.now();
    
    console.log('🎵 Simple timing: Recording started!');
    console.log(`⏰ Beat interval: ${this.beatInterval}ms (${this.bpm} BPM)`);
  }

  // Stop recording and analyze
  stopRecording() {
    this.isRecording = false;
    console.log('🎵 Simple timing: Recording stopped');
    return this.analyzePerformance();
  }

  // Record a tap
  recordTap(timestamp = performance.now()) {
    if (!this.isRecording) return;
    
    const tapTime = timestamp - this.startTime; // Relative to start
    this.recordedTaps.push(tapTime);
    
    console.log(`🎹 Tap recorded: ${tapTime.toFixed(0)}ms from start`);
  }

  // Set expected beats for a pattern
  setExpectedBeats(numBeats, startDelay = 0) {
    this.expectedBeats = [];
    
    for (let i = 0; i < numBeats; i++) {
      const baseTime = startDelay + (i * this.beatInterval);
      // Apply audio latency compensation
      const compensatedTime = baseTime + this.audioLatencyCompensation;
      this.expectedBeats.push(compensatedTime);
    }
    
    console.log(`🎯 Expected beats (compensated): ${this.expectedBeats.map(t => t.toFixed(0)).join(', ')}ms`);
    console.log(`🎵 Applied ${this.audioLatencyCompensation.toFixed(0)}ms latency compensation`);
  }

  // Simple tap matching - match in order
  analyzePerformance() {
    console.log('\n🔍 SIMPLE TIMING ANALYSIS');
    console.log('========================');
    
    if (this.recordedTaps.length === 0) {
      console.log('❌ No taps recorded');
      return { hits: 0, misses: this.expectedBeats.length, results: [] };
    }

    const results = [];
    let hits = 0;
    let usedTaps = new Set();

    // Match each expected beat to closest unused tap
    this.expectedBeats.forEach((expectedTime, beatIndex) => {
      let bestTap = null;
      let bestDiff = Infinity;

      // Find closest unused tap within tolerance
      this.recordedTaps.forEach((tapTime, tapIndex) => {
        if (usedTaps.has(tapIndex)) return;
        
        const diff = Math.abs(tapTime - expectedTime);
        if (diff < this.tolerance && diff < bestDiff) {
          bestTap = { index: tapIndex, time: tapTime, diff };
          bestDiff = diff;
        }
      });

      if (bestTap) {
        usedTaps.add(bestTap.index);
        hits++;
        
        const timingDiff = bestTap.time - expectedTime;
        const result = {
          beat: beatIndex + 1,
          hit: true,
          timing: timingDiff,
          accuracy: bestTap.diff
        };
        
        results.push(result);
        console.log(`✅ Beat ${beatIndex + 1}: HIT (${timingDiff >= 0 ? '+' : ''}${timingDiff.toFixed(0)}ms)`);
      } else {
        results.push({
          beat: beatIndex + 1,
          hit: false,
          timing: 0,
          accuracy: 0
        });
        console.log(`❌ Beat ${beatIndex + 1}: MISSED`);
      }
    });

    const accuracy = Math.round((hits / this.expectedBeats.length) * 100);
    
    // Adaptive compensation learning
    if (this.adaptiveCompensation && results.length > 0) {
      this.updateCompensation(results);
    }
    
    console.log('========================');
    console.log(`🎯 Final score: ${hits}/${this.expectedBeats.length} beats hit (${accuracy}%)`);
    console.log(`🎹 Your taps: ${this.recordedTaps.map(t => t.toFixed(0)).join(', ')}ms`);
    console.log(`🎯 Expected: ${this.expectedBeats.map(t => t.toFixed(0)).join(', ')}ms`);
    console.log(`🎵 Current compensation: ${this.audioLatencyCompensation.toFixed(0)}ms`);
    
    return {
      hits,
      misses: this.expectedBeats.length - hits,
      accuracy,
      results,
      compensation: this.audioLatencyCompensation
    };
  }
  
  // Update compensation based on performance
  updateCompensation(results) {
    const hitResults = results.filter(r => r.hit);
    if (hitResults.length < 2) return; // Need enough data
    
    const avgTiming = hitResults.reduce((sum, r) => sum + r.timing, 0) / hitResults.length;
    
    // If consistently early/late, adjust compensation
    if (Math.abs(avgTiming) > 50) {
      const adjustment = avgTiming * 0.5; // Conservative adjustment
      this.audioLatencyCompensation += adjustment;
      this.compensationHistory.push(this.audioLatencyCompensation);
      
      // Keep history limited
      if (this.compensationHistory.length > 10) {
        this.compensationHistory.shift();
      }
      
      console.log(`🎵 Adaptive compensation adjusted: ${adjustment.toFixed(0)}ms (now ${this.audioLatencyCompensation.toFixed(0)}ms)`);
    }
  }
  
  // Get current compensation info
  getCompensationInfo() {
    return {
      current: this.audioLatencyCompensation,
      adaptive: this.adaptiveCompensation,
      history: this.compensationHistory,
      browser: this.detectBrowser()
    };
  }
  
  // Detect browser for logging
  // Detect browser for logging
  detectBrowser() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    return 'Unknown';
  }
}

// Export for use in main.js
export default SimpleRhythmTracker;
