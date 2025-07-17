/**
 * PerformanceMonitor - Advanced performance monitoring and optimization
 * Tracks timing, memory usage, and provides optimization suggestions
 */

export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      timing: [],
      memory: [],
      fps: [],
      audio: []
    };
    this.observers = [];
    this.isMonitoring = false;
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
    this.setupObservers();
  }

  /**
   * Setup performance observers
   */
  setupObservers() {
    // Performance Observer for navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.processPerformanceEntry(entry);
          }
        });
        
        // Observe different entry types
        observer.observe({ entryTypes: ['navigation', 'measure', 'mark'] });
        this.observers.push(observer);
      } catch (error) {
        console.warn('PerformanceObserver not fully supported:', error);
      }
    }

    // Memory monitoring (if available)
    if ('memory' in performance) {
      this.setupMemoryMonitoring();
    }
  }

  /**
   * Setup memory monitoring
   */
  setupMemoryMonitoring() {
    setInterval(() => {
      if (this.isMonitoring && performance.memory) {
        this.metrics.memory.push({
          timestamp: Date.now(),
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        });
        
        // Keep only last 100 memory measurements
        if (this.metrics.memory.length > 100) {
          this.metrics.memory.shift();
        }
      }
    }, 1000);
  }

  /**
   * Process performance entries
   */
  processPerformanceEntry(entry) {
    switch (entry.entryType) {
      case 'navigation':
        this.metrics.timing.push({
          type: 'navigation',
          timestamp: Date.now(),
          loadTime: entry.loadEventEnd - entry.navigationStart,
          domReady: entry.domContentLoadedEventEnd - entry.navigationStart,
          firstPaint: entry.fetchStart - entry.navigationStart
        });
        break;
        
      case 'measure':
        if (entry.name.startsWith('rhythm-game-')) {
          this.metrics.timing.push({
            type: 'custom',
            name: entry.name,
            timestamp: Date.now(),
            duration: entry.duration
          });
        }
        break;
    }
  }

  /**
   * Start monitoring
   */
  start() {
    this.isMonitoring = true;
    this.startFPSMonitoring();
    console.log('🔍 Performance monitoring started');
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isMonitoring = false;
    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Monitor FPS
   */
  startFPSMonitoring() {
    const measureFPS = (currentTime) => {
      if (!this.isMonitoring) return;
      
      const deltaTime = currentTime - this.lastFrameTime;
      const fps = 1000 / deltaTime;
      
      this.metrics.fps.push({
        timestamp: currentTime,
        fps: fps,
        deltaTime: deltaTime
      });
      
      // Keep only last 60 FPS measurements (1 second at 60fps)
      if (this.metrics.fps.length > 60) {
        this.metrics.fps.shift();
      }
      
      this.lastFrameTime = currentTime;
      this.frameCount++;
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  /**
   * Mark a custom performance point
   */
  mark(name) {
    if ('performance' in window && 'mark' in performance) {
      performance.mark(`rhythm-game-${name}`);
    }
  }

  /**
   * Measure time between two marks
   */
  measure(name, startMark, endMark) {
    if ('performance' in window && 'measure' in performance) {
      try {
        performance.measure(
          `rhythm-game-${name}`,
          `rhythm-game-${startMark}`,
          `rhythm-game-${endMark}`
        );
      } catch (error) {
        console.warn('Performance measurement failed:', error);
      }
    }
  }

  /**
   * Monitor audio performance
   */
  monitorAudio(audioContext) {
    if (!audioContext || !this.isMonitoring) return;
    
    const now = Date.now();
    this.metrics.audio.push({
      timestamp: now,
      state: audioContext.state,
      currentTime: audioContext.currentTime,
      sampleRate: audioContext.sampleRate,
      baseLatency: audioContext.baseLatency || 0,
      outputLatency: audioContext.outputLatency || 0
    });
    
    // Keep only last 50 audio measurements
    if (this.metrics.audio.length > 50) {
      this.metrics.audio.shift();
    }
  }

  /**
   * Get current FPS
   */
  getCurrentFPS() {
    if (this.metrics.fps.length === 0) return 0;
    
    const recent = this.metrics.fps.slice(-10); // Last 10 frames
    const avgFPS = recent.reduce((sum, frame) => sum + frame.fps, 0) / recent.length;
    return Math.round(avgFPS);
  }

  /**
   * Get memory usage percentage
   */
  getMemoryUsage() {
    if (this.metrics.memory.length === 0 || !performance.memory) return 0;
    
    const latest = this.metrics.memory[this.metrics.memory.length - 1];
    return Math.round((latest.used / latest.limit) * 100);
  }

  /**
   * Get performance report
   */
  getReport() {
    const currentFPS = this.getCurrentFPS();
    const memoryUsage = this.getMemoryUsage();
    
    const report = {
      summary: {
        fps: currentFPS,
        memoryUsage: memoryUsage,
        isHealthy: currentFPS >= 30 && memoryUsage < 80
      },
      metrics: {
        timing: this.metrics.timing.slice(-10),
        memory: this.metrics.memory.slice(-10),
        fps: this.metrics.fps.slice(-10),
        audio: this.metrics.audio.slice(-5)
      },
      recommendations: this.getRecommendations(currentFPS, memoryUsage)
    };
    
    return report;
  }

  /**
   * Get optimization recommendations
   */
  getRecommendations(fps, memoryUsage) {
    const recommendations = [];
    
    if (fps < 30) {
      recommendations.push({
        type: 'performance',
        severity: 'high',
        message: 'Low FPS detected. Consider reducing visual effects or pattern complexity.'
      });
    }
    
    if (memoryUsage > 80) {
      recommendations.push({
        type: 'memory',
        severity: 'high',
        message: 'High memory usage. Check for memory leaks or reduce cached data.'
      });
    }
    
    if (this.metrics.audio.length > 0) {
      const latestAudio = this.metrics.audio[this.metrics.audio.length - 1];
      if (latestAudio.baseLatency > 50) {
        recommendations.push({
          type: 'audio',
          severity: 'medium',
          message: 'High audio latency detected. Consider adjusting buffer sizes.'
        });
      }
    }
    
    const avgTimingDuration = this.metrics.timing
      .filter(t => t.type === 'custom')
      .reduce((sum, t, _, arr) => sum + (t.duration || 0) / arr.length, 0);
    
    if (avgTimingDuration > 16.67) { // 60fps = 16.67ms per frame
      recommendations.push({
        type: 'timing',
        severity: 'medium',
        message: 'Slow operations detected. Consider optimizing heavy calculations.'
      });
    }
    
    return recommendations;
  }

  /**
   * Log performance report to console
   */
  logReport() {
    const report = this.getReport();
    
    console.group('🔍 Performance Report');
    console.log(`FPS: ${report.summary.fps}`);
    console.log(`Memory: ${report.summary.memoryUsage}%`);
    console.log(`Health: ${report.summary.isHealthy ? '✅ Good' : '⚠️ Issues detected'}`);
    
    if (report.recommendations.length > 0) {
      console.group('📋 Recommendations');
      report.recommendations.forEach(rec => {
        const emoji = rec.severity === 'high' ? '🚨' : '⚠️';
        console.log(`${emoji} [${rec.type}] ${rec.message}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  /**
   * Clean up observers
   */
  cleanup() {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Failed to disconnect observer:', error);
      }
    });
    this.observers = [];
    this.stop();
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();

export default PerformanceMonitor;
