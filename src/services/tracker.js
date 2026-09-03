/**
 * Analytics stub.
 *
 * MVP 0.1: logs events to the console and dispatches a CustomEvent so the
 * app (or future tooling) can react without coupling.
 *
 * Future: this module becomes the single gateway to the analytics backend
 * (event ingestion, session tracking, funnels). No view calls the backend
 * directly — they call track().
 */
export function track(event, data = {}) {
  const payload = { event, ...data, ts: Date.now() };
  console.info('[track]', payload);
  window.dispatchEvent(new CustomEvent('scratch-academy:track', { detail: payload }));
}
