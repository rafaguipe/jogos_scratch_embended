/**
 * Local progress storage.
 *
 * MVP 0.1: persists which lesson the student last opened. Nothing more.
 *
 * Future: this module is the single seam that will be swapped for the
 * backend API (login, per-student progress, ranking). Views never touch
 * localStorage directly — they call these functions, so replacing the
 * implementation later touches one file only.
 */

const STORAGE_KEY = 'scratch-academy:v1';

function read() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) ?? {};
  } catch {
    return {};
  }
}

function write(progress) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

/** Progress for one lesson (MVP: { openedAt }). */
export function getLessonProgress(lessonId) {
  return read().lessons?.[lessonId] ?? {};
}

/** Record that the student opened a lesson (player or editor). */
export function markLessonOpened(lessonId) {
  const progress = read();
  progress.lastOpenedLesson = lessonId;
  progress.lessons = progress.lessons ?? {};
  progress.lessons[lessonId] = {
    ...progress.lessons[lessonId],
    openedAt: new Date().toISOString(),
  };
  write(progress);
}

/** Whether a lesson was ever opened. (Completion tracking comes later.) */
export function hasOpenedLesson(lessonId) {
  return Boolean(getLessonProgress(lessonId).openedAt);
}
