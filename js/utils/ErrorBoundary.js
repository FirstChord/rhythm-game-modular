/**
 * ErrorBoundary - Professional error handling and recovery system
 * Provides graceful error handling and automatic recovery for the rhythm game
 */

export class ErrorBoundary {
  constructor() {
    this.errorCount = 0;
    this.maxErrors = 5;
    this.errorLog = [];
    this.recoveryCallbacks = new Map();
    this.setupGlobalErrorHandling();
  }

  /**
   * Setup global error handling
   */
  setupGlobalErrorHandling() {
    // Handle uncaught JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'uncaught', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'promise', {
        promise: event.promise
      });
      event.preventDefault(); // Prevent console error
    });

    // Handle audio context errors
    this.setupAudioErrorHandling();
  }

  /**
   * Setup audio-specific error handling
   */
  setupAudioErrorHandling() {
    // Audio context state monitoring
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      const originalAudioContext = window.AudioContext || window.webkitAudioContext;
      
      // Monitor audio context creation
      const contextInstances = new WeakSet();
      
      // Override AudioContext constructor to monitor instances
      const AudioContextWrapper = function(...args) {
        const context = new originalAudioContext(...args);
        contextInstances.add(context);
        
        // Monitor context state changes
        const originalClose = context.close.bind(context);
        const originalSuspend = context.suspend.bind(context);
        const originalResume = context.resume.bind(context);
        
        context.close = async function() {
          try {
            return await originalClose();
          } catch (error) {
            this.handleError(error, 'audio-close');
          }
        }.bind(this);
        
        return context;
      }.bind(this);
      
      // Preserve original methods
      Object.setPrototypeOf(AudioContextWrapper, originalAudioContext);
      AudioContextWrapper.prototype = originalAudioContext.prototype;
      
      window.AudioContext = AudioContextWrapper;
      if (window.webkitAudioContext) {
        window.webkitAudioContext = AudioContextWrapper;
      }
    }
  }

  /**
   * Register a recovery callback for specific error types
   */
  registerRecovery(errorType, callback) {
    if (!this.recoveryCallbacks.has(errorType)) {
      this.recoveryCallbacks.set(errorType, []);
    }
    this.recoveryCallbacks.get(errorType).push(callback);
  }

  /**
   * Handle an error with automatic recovery
   */
  handleError(error, type = 'unknown', context = {}) {
    this.errorCount++;
    
    const errorInfo = {
      error: error,
      type: type,
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    this.errorLog.push(errorInfo);
    
    // Keep only last 20 errors
    if (this.errorLog.length > 20) {
      this.errorLog.shift();
    }
    
    console.error(`🚨 Error [${type}]:`, error, context);
    
    // Attempt recovery
    this.attemptRecovery(type, errorInfo);
    
    // If too many errors, show user-friendly message
    if (this.errorCount >= this.maxErrors) {
      this.showCriticalErrorMessage();
    }
    
    return errorInfo;
  }

  /**
   * Attempt automatic recovery
   */
  attemptRecovery(errorType, errorInfo) {
    const callbacks = this.recoveryCallbacks.get(errorType) || [];
    
    callbacks.forEach(callback => {
      try {
        callback(errorInfo);
      } catch (recoveryError) {
        console.warn('Recovery callback failed:', recoveryError);
      }
    });
    
    // Built-in recovery strategies
    switch (errorType) {
      case 'audio-close':
      case 'audio':
        this.recoverAudio();
        break;
      case 'timing':
        this.recoverTiming();
        break;
      case 'render':
        this.recoverRender();
        break;
    }
  }

  /**
   * Audio recovery strategy
   */
  recoverAudio() {
    try {
      // Try to resume audio context if suspended
      if (window.getAudioContext && window.getAudioContext().state === 'suspended') {
        window.getAudioContext().resume();
      }
    } catch (error) {
      console.warn('Audio recovery failed:', error);
    }
  }

  /**
   * Timing recovery strategy
   */
  recoverTiming() {
    try {
      // Clear any stuck timers
      for (let i = 1; i < 10000; i++) {
        clearTimeout(i);
        clearInterval(i);
      }
    } catch (error) {
      console.warn('Timing recovery failed:', error);
    }
  }

  /**
   * Render recovery strategy
   */
  recoverRender() {
    try {
      // Force DOM refresh
      document.body.style.display = 'none';
      document.body.offsetHeight; // Trigger reflow
      document.body.style.display = '';
    } catch (error) {
      console.warn('Render recovery failed:', error);
    }
  }

  /**
   * Show critical error message to user
   */
  showCriticalErrorMessage() {
    const errorDialog = document.createElement('div');
    errorDialog.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #fff;
      border: 2px solid #e74c3c;
      border-radius: 8px;
      padding: 20px;
      z-index: 10000;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    errorDialog.innerHTML = `
      <h3 style="color: #e74c3c; margin-top: 0;">⚠️ Technical Issue Detected</h3>
      <p>The rhythm game encountered multiple technical issues. Would you like to reload the page?</p>
      <button onclick="window.location.reload()" style="
        background: #3498db;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin: 0 5px;
      ">Reload Page</button>
      <button onclick="this.parentElement.remove()" style="
        background: #95a5a6;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        margin: 0 5px;
      ">Continue Anyway</button>
    `;
    
    document.body.appendChild(errorDialog);
  }

  /**
   * Get error statistics
   */
  getStats() {
    return {
      errorCount: this.errorCount,
      recentErrors: this.errorLog.slice(-5),
      recoveryCallbacks: this.recoveryCallbacks.size
    };
  }

  /**
   * Reset error count (useful after successful operations)
   */
  reset() {
    this.errorCount = 0;
  }

  /**
   * Get error log for debugging
   */
  getErrorLog() {
    return [...this.errorLog];
  }
}

// Global error boundary instance
export const globalErrorBoundary = new ErrorBoundary();

export default ErrorBoundary;
