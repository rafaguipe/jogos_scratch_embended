/**
 * PlayerView — full-screen TurboWarp player.
 * Loads the lesson's game.sb3 automatically and starts it (autoplay).
 */
import { Header } from '../components/Header.js';
import { Icons } from '../components/Button.js';
import { track } from '../services/tracker.js';
import { markLessonOpened } from '../services/storage.js';

const TURBOWARP_PLAYER = 'https://turbowarp.org/embed.html';

export function PlayerView({ lesson, router }) {
  markLessonOpened(lesson.id);
  track('player:open', { lessonId: lesson.id });

  const projectParam = `project_url=${encodeURIComponent(lesson.gameUrl)}&autoplay`;

  const view = document.createElement('div');
  view.className = 'view view--full';

  view.append(
    Header({
      router,
      backAction: {
        label: 'Voltar ao Curso',
        icon: Icons.back,
        onClick: () => router.navigate('/'),
      },
    }),
  );

  const frame = document.createElement('div');
  frame.className = 'frame';

  const toolbar = document.createElement('div');
  toolbar.className = 'frame__toolbar';
  toolbar.innerHTML = `
    <span class="frame__title">${escapeHtml(lesson.title)} — jogando</span>
    <span class="frame__note">O jogo abre automaticamente. Use a bandeira verde para reiniciar.</span>`;
  frame.append(toolbar);

  const iframe = document.createElement('iframe');
  iframe.className = 'frame__iframe';
  iframe.src = `${TURBOWARP_PLAYER}?${projectParam}`;
  iframe.title = `Jogar — ${lesson.title}`;
  iframe.allow = 'autoplay';
  iframe.setAttribute('allowfullscreen', '');
  frame.append(iframe);

  view.append(frame);
  return view;
}

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
