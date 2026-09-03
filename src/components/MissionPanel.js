/**
 * MissionPanel — renders one lesson's mission card on the home page:
 * title, subtitle, difficulty, the rendered instructions (markdown),
 * collapsible hints, and the two primary actions: Jogar / Modificar.
 */
import { Button, Icons } from './Button.js';
import { renderMarkdown } from '../lib/markdown.js';

export function MissionPanel({ lesson, router, current = false }) {
  const section = document.createElement('section');
  section.className = `card mission ${current ? 'mission--current' : ''}`;

  const head = document.createElement('div');
  head.className = 'mission__head';

  const titles = document.createElement('div');
  titles.innerHTML = `
    <h2 class="mission__title">${escapeHtml(lesson.title)}</h2>
    ${lesson.subtitle ? `<p class="mission__subtitle">${escapeHtml(lesson.subtitle)}</p>` : ''}`;
  head.append(titles);

  if (current) {
    const badge = document.createElement('span');
    badge.className = 'mission__badge';
    badge.textContent = 'Missão atual';
    head.append(badge);
  }

  if (lesson.difficulty) {
    const diff = document.createElement('span');
    diff.className = 'mission__difficulty';
    diff.textContent = `Dificuldade ${'★'.repeat(lesson.difficulty)}${'☆'.repeat(5 - lesson.difficulty)}`;
    head.append(diff);
  }
  section.append(head);

  if (lesson.instructions) {
    const body = document.createElement('div');
    body.className = 'mission__instructions';
    body.innerHTML = renderMarkdown(lesson.instructions);
    section.append(body);
  }

  if (lesson.hints) {
    const details = document.createElement('details');
    details.className = 'mission__hints';
    const summary = document.createElement('summary');
    summary.innerHTML = `<span class="btn__icon">${Icons.hint}</span> Dicas`;
    details.append(summary);
    const hintsBody = document.createElement('div');
    hintsBody.innerHTML = renderMarkdown(lesson.hints);
    details.append(hintsBody);
    section.append(details);
  }

  const actions = document.createElement('div');
  actions.className = 'mission__actions';
  actions.append(
    Button({
      label: 'Jogar',
      variant: 'primary',
      icon: Icons.play,
      onClick: () => router.navigate(`/play/${lesson.id}`),
    }),
    Button({
      label: 'Modificar',
      variant: 'secondary',
      icon: Icons.edit,
      onClick: () => router.navigate(`/edit/${lesson.id}`),
    }),
  );
  section.append(actions);

  return section;
}

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
