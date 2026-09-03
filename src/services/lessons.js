/**
 * Lesson registry — the heart of the platform.
 *
 * A lesson is a plain folder under /lessons/<lesson-id>/ containing:
 *
 *   lesson.json       machine-readable lesson definition (id, order, files)
 *   metadata.json     authoring/curriculum metadata (title, difficulty, tags)
 *   game.sb3          the starting project the student modifies
 *   solution.sb3      reference solution (future: verification / hints)
 *   instructions.md   the mission text, rendered on the home page
 *   hints.md          progressive hints, rendered as a collapsible panel
 *
 * Lessons are discovered at build time with Vite's import.meta.glob.
 * Adding a new lesson = copy a folder and run `npm run dev` (dev picks it
 * up automatically; a production build re-discovers it at build time).
 *
 * All URLs returned are absolute so they can be passed to the TurboWarp
 * iframe, which runs on another origin and cannot resolve relative paths.
 */

const lessonManifests = import.meta.glob('/lessons/*/lesson.json', {
  eager: true,
  import: 'default',
});
const metadataMap = import.meta.glob('/lessons/*/metadata.json', {
  eager: true,
  import: 'default',
});
const gameUrls = import.meta.glob('/lessons/*/game.sb3', {
  eager: true,
  import: 'default',
  query: '?url',
});
const solutionUrls = import.meta.glob('/lessons/*/solution.sb3', {
  eager: true,
  import: 'default',
  query: '?url',
});
const instructionTexts = import.meta.glob('/lessons/*/instructions.md', {
  eager: true,
  import: 'default',
  query: '?raw',
});
const hintTexts = import.meta.glob('/lessons/*/hints.md', {
  eager: true,
  import: 'default',
  query: '?raw',
});

const lessonIdFromPath = (path) => path.split('/')[2];

/** Index a glob result by lesson id. */
const byId = (map) =>
  Object.fromEntries(
    Object.entries(map).map(([path, value]) => [lessonIdFromPath(path), value]),
  );

const manifests = byId(lessonManifests);
const metadata = byId(metadataMap);
const games = byId(gameUrls);
const solutions = byId(solutionUrls);
const instructions = byId(instructionTexts);
const hints = byId(hintTexts);

const absoluteUrl = (url) => (url ? new URL(url, window.location.href).href : null);

/** All lessons, sorted by their `order` field. */
export function getLessons() {
  return Object.values(manifests)
    .map((manifest) => buildLesson(manifest))
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
}

/** One lesson by id, or null when unknown. */
export function getLesson(id) {
  const manifest = manifests[id];
  return manifest ? buildLesson(manifest) : null;
}

function buildLesson(manifest) {
  const id = manifest.id;
  const meta = metadata[id] ?? {};
  return {
    ...manifest,
    ...meta,
    id,
    // Display fields: "Missão 1" + descriptive subtitle.
    title: manifest.title ?? meta.title ?? id,
    subtitle: meta.subtitle ?? meta.objectives?.slice(0, 2).join(' · ') ?? '',
    gameUrl: absoluteUrl(games[id]),
    solutionUrl: absoluteUrl(solutions[id] ?? null),
    instructions: instructions[id] ?? '',
    hints: hints[id] ?? '',
  };
}
