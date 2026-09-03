/**
 * EditorView — transition screen for the TurboWarp editor.
 *
 * The TurboWarp editor cannot run inside an iframe: turbowarp.org refuses to
 * render when window.parent !== window (the "Invalid TurboWarp Embed :(" page).
 * So this view opens the editor in a new tab and offers a clear way back.
 */
import { Header } from '../components/Header.js';
import { Button, Icons } from '../components/Button.js';
import { track } from '../services/tracker.js';
import { markLessonOpened } from '../services/storage.js';

const TURBOWARP_EDITOR = 'https://turbowarp.org/editor';

export function EditorView({ lesson, router }) {
  markLessonOpened(lesson.id);
  track('editor:open', { lessonId: lesson.id });

  const editorUrl = `${TURBOWARP_EDITOR}?project_url=${encodeURIComponent(lesson.gameUrl)}`;

  const openEditor = () => {
    window.open(editorUrl, '_blank', 'noopener');
  };

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
    <span class="frame__title">${escapeHtml(lesson.title)} — modificando</span>
    <span class="frame__note">O editor abre em uma nova aba. Edite, teste com a bandeira verde e salve em <strong>Arquivo → Salvar</strong>.</span>`;
  frame.append(toolbar);

  const body = document.createElement('div');
  body.className = 'frame__body';
  body.innerHTML = `
    <p class="frame__body-title">O editor abriu em uma nova aba.</p>
    <p class="frame__body-note">Se nada abriu, seu navegador pode ter bloqueado a janela. Use o botão abaixo.</p>`;

  const actions = document.createElement('div');
  actions.className = 'frame__actions';
  actions.append(
    Button({
      label: 'Abrir editor',
      variant: 'primary',
      icon: Icons.edit,
      onClick: openEditor,
    }),
    Button({
      label: 'Voltar ao Curso',
      variant: 'secondary',
      icon: Icons.back,
      onClick: () => router.navigate('/'),
    }),
  );
  body.append(actions);
  frame.append(body);

  view.append(frame);

  // Open the editor immediately when the view mounts. The navigation that led
  // here came from a user click, so popup blockers usually allow this.
  openEditor();

  return view;
}

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
