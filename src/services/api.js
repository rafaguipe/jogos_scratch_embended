/**
 * Backend API client — STUB.
 *
 * This module defines the future contract of the platform backend
 * (login, student progress, ranking, missions, AI tutor, LLM integration).
 * Nothing here is implemented in MVP 0.1: every method fails loudly and
 * documents the shape the real implementation must keep.
 *
 * The frontend is already wired so that these features can be added
 * without changing any view: views talk to storage.js / tracker.js, and
 * those are the only modules that will start calling api.js.
 */

export class ApiNotImplementedError extends Error {
  constructor(method) {
    super(`api.${method}() is not implemented in MVP 0.1. See src/services/api.js.`);
    this.name = 'ApiNotImplementedError';
  }
}

export const api = {
  /** POST /auth/login — returns { token, user }. */
  async login(email, password) {
    throw new ApiNotImplementedError('login');
  },

  /** POST /progress/:lessonId — stores student progress server-side. */
  async submitProgress(lessonId, data) {
    throw new ApiNotImplementedError('submitProgress');
  },

  /** GET /ranking — global student ranking. */
  async getRanking() {
    throw new ApiNotImplementedError('getRanking');
  },

  /** POST /assist — AI tutor: asks the LLM for a hint about this lesson. */
  async askTutor(lessonId, question) {
    throw new ApiNotImplementedError('askTutor');
  },
};
