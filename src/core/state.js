/**
 * Tiny observable state store.
 *
 * Views read state and subscribe to changes; services write state.
 * This is the single source of truth for cross-view data (e.g. the
 * currently open lesson) and will grow into the store that backs the
 * future platform features (progress, session, etc.).
 */
export class State {
  constructor(initial = {}) {
    this.data = { ...initial };
    this.listeners = new Map(); // event name -> Set of callbacks
  }

  get(key) {
    return this.data[key];
  }

  /** Set a value and notify subscribers. */
  set(key, value) {
    this.data[key] = value;
    this.emit(key, value);
    return value;
  }

  /** Subscribe to a key change. Returns an unsubscribe function. */
  on(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    return () => this.listeners.get(key).delete(callback);
  }

  emit(key, payload) {
    const callbacks = this.listeners.get(key);
    if (!callbacks) return;
    for (const cb of callbacks) cb(payload);
  }
}
