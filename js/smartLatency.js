// Smart Audio Latency Compensation
// More conservative and adaptive approach

class SmartLatencyCompensator {
  constructor() {
    this.baseCompensation = this.detectBaseLatency();
    this.adaptiveOffset = 0;
    this.enabled = true;
    this.learningMode = true;
    this.tapHistory = [];
    this.maxHistory = 50; // Track last 50 taps for learning
  }

  // More conservative latency detection
  detectBaseLatency() {
    const userAgent = navigator.userAgent;
    let baseLatency = 165; // Updated based on external Chrome test (165.2ms)
    
    // Browser-specific (updated with real test data)
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      baseLatency = 165; // Based on your actual test: 165.2ms
    } else if (userAgent.includes('Firefox')) {
      baseLatency = 140; // Estimated based on Chrome data
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      baseLatency = 120; // Safari often better, but not as much as we thought
    } else if (userAgent.includes('Edg')) {
      baseLatency = 160; // Similar to Chrome
    }
    
    // OS adjustments (smaller)
    if (userAgent.includes('Mac')) {
      baseLatency *= 0.9; // Your Mac test showed 165ms, so this is already Mac-adjusted
    } else if (userAgent.includes('Windows')) {
      baseLatency *= 1.1;
    }
    
    return Math.round(baseLatency);
  }

  // Get current total compensation
  getCurrentCompensation() {
    if (!this.enabled) return 0;
    return this.baseCompensation + this.adaptiveOffset;
  }

  // Enable/disable compensation
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(`🎵 Smart latency compensation: ${enabled ? 'ON' : 'OFF'}`);
  }

  // Learn from tap patterns
  learnFromTap(tapTime, expectedTime, wasAccurate) {
    if (!this.learningMode) return;

    const timing = {
      tapTime,
      expectedTime,
      difference: tapTime - expectedTime,
      wasAccurate,
      timestamp: Date.now()
    };

    this.tapHistory.push(timing);
    
    // Keep only recent history
    if (this.tapHistory.length > this.maxHistory) {
      this.tapHistory.shift();
    }

    // Analyze and adapt every 10 taps
    if (this.tapHistory.length >= 10 && this.tapHistory.length % 10 === 0) {
      this.analyzeAndAdapt();
    }
  }

  // Analyze tap patterns and adjust compensation
  analyzeAndAdapt() {
    const recentTaps = this.tapHistory.slice(-20); // Last 20 taps
    const accurateTaps = recentTaps.filter(tap => tap.wasAccurate);
    
    if (accurateTaps.length < 5) return; // Need enough accurate taps
    
    // Calculate average timing offset for accurate taps
    const avgOffset = accurateTaps.reduce((sum, tap) => sum + tap.difference, 0) / accurateTaps.length;
    
    // Only adjust if there's a consistent pattern
    if (Math.abs(avgOffset) > 30) { // 30ms threshold
      const adjustment = Math.round(avgOffset * 0.3); // Conservative 30% adjustment
      this.adaptiveOffset = Math.max(-200, Math.min(200, this.adaptiveOffset - adjustment)); // Allow ±200ms range
      
      console.log(`🎵 Adaptive latency adjustment: ${adjustment}ms (total: ${this.getCurrentCompensation()}ms)`);
      console.log(`🎵 Average offset was: ${avgOffset.toFixed(1)}ms (+ = late, - = early)`);
    }
  }

  // Apply compensation to expected time
  compensateExpectedTime(rawExpectedTime) {
    if (!this.enabled) return rawExpectedTime;
    
    const totalCompensation = this.getCurrentCompensation();
    
    // Handle both positive and negative compensation
    // Positive = expect taps earlier (for audio latency)
    // Negative = expect taps later (for anticipation/fast reflexes)
    return rawExpectedTime - totalCompensation;
  }

  // Get compensation info for display
  getInfo() {
    return {
      enabled: this.enabled,
      base: this.baseCompensation,
      adaptive: this.adaptiveOffset,
      total: this.getCurrentCompensation(),
      learning: this.learningMode,
      browser: this.getBrowserName()
    };
  }

  getBrowserName() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edg')) return 'Edge';
    return 'Unknown';
  }

  // Manual override for testing
  setManualCompensation(ms) {
    this.baseCompensation = ms;
    this.adaptiveOffset = 0;
    this.learningMode = false;
    console.log(`🎵 Manual latency compensation set: ${ms}ms`);
  }

  // Quick calibration based on external test
  calibrateFromExternalTest(latencyMs) {
    this.baseCompensation = Math.round(latencyMs);
    this.adaptiveOffset = 0;
    this.learningMode = true; // Keep learning enabled
    console.log(`🎵 Calibrated from external test: ${latencyMs}ms`);
  }

  // Reset learning
  resetLearning() {
    this.tapHistory = [];
    this.adaptiveOffset = 0;
    this.learningMode = true;
    console.log(`🎵 Latency learning reset`);
  }
}

export default SmartLatencyCompensator;
