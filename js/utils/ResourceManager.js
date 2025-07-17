/**
 * ResourceManager - Professional resource cleanup and memory management
 * Prevents memory leaks and ensures proper cleanup of timers, listeners, and resources
 */

export class ResourceManager {
  constructor() {
    this.timers = new Set();
    this.intervals = new Set();
    this.listeners = new Map();
    this.audioNodes = new Set();
    this.observers = new Set();
  }

  /**
   * Register a timeout for automatic cleanup
   */
  setTimeout(callback, delay, ...args) {
    const id = setTimeout((...args) => {
      this.timers.delete(id);
      callback(...args);
    }, delay, ...args);
    this.timers.add(id);
    return id;
  }

  /**
   * Register an interval for automatic cleanup
   */
  setInterval(callback, delay, ...args) {
    const id = setInterval(callback, delay, ...args);
    this.intervals.add(id);
    return id;
  }

  /**
   * Register an event listener for automatic cleanup
   */
  addEventListener(element, event, listener, options) {
    if (!this.listeners.has(element)) {
      this.listeners.set(element, []);
    }
    this.listeners.get(element).push({ event, listener, options });
    element.addEventListener(event, listener, options);
  }

  /**
   * Register an audio node for cleanup
   */
  registerAudioNode(node) {
    this.audioNodes.add(node);
  }

  /**
   * Register an observer for cleanup
   */
  registerObserver(observer) {
    this.observers.add(observer);
  }

  /**
   * Clear a specific timeout
   */
  clearTimeout(id) {
    clearTimeout(id);
    this.timers.delete(id);
  }

  /**
   * Clear a specific interval
   */
  clearInterval(id) {
    clearInterval(id);
    this.intervals.delete(id);
  }

  /**
   * Remove a specific event listener
   */
  removeEventListener(element, event, listener) {
    const elementListeners = this.listeners.get(element);
    if (elementListeners) {
      const index = elementListeners.findIndex(l => l.event === event && l.listener === listener);
      if (index !== -1) {
        element.removeEventListener(event, listener);
        elementListeners.splice(index, 1);
        if (elementListeners.length === 0) {
          this.listeners.delete(element);
        }
      }
    }
  }

  /**
   * Clean up all registered resources
   */
  cleanup() {
    // Clear all timers
    this.timers.forEach(id => clearTimeout(id));
    this.timers.clear();

    // Clear all intervals
    this.intervals.forEach(id => clearInterval(id));
    this.intervals.clear();

    // Remove all event listeners
    this.listeners.forEach((listeners, element) => {
      listeners.forEach(({ event, listener }) => {
        try {
          element.removeEventListener(event, listener);
        } catch (e) {
          console.warn('Failed to remove event listener:', e);
        }
      });
    });
    this.listeners.clear();

    // Disconnect audio nodes
    this.audioNodes.forEach(node => {
      try {
        if (typeof node.disconnect === 'function') {
          node.disconnect();
        }
      } catch (e) {
        console.warn('Failed to disconnect audio node:', e);
      }
    });
    this.audioNodes.clear();

    // Disconnect observers
    this.observers.forEach(observer => {
      try {
        if (typeof observer.disconnect === 'function') {
          observer.disconnect();
        }
      } catch (e) {
        console.warn('Failed to disconnect observer:', e);
      }
    });
    this.observers.clear();
  }

  /**
   * Get resource usage statistics
   */
  getStats() {
    return {
      timers: this.timers.size,
      intervals: this.intervals.size,
      listeners: Array.from(this.listeners.values()).reduce((total, arr) => total + arr.length, 0),
      audioNodes: this.audioNodes.size,
      observers: this.observers.size
    };
  }
}

// Global resource manager instance
export const globalResourceManager = new ResourceManager();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalResourceManager.cleanup();
  });
}

export default ResourceManager;
