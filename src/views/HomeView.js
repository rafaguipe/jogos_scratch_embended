/**
 * HomeView — the course landing page.
 * Shows the hero, the current mission, and all available lessons.
 */
import { Header } from '../components/Header.js';
import { MissionPanel } from '../components/MissionPanel.js';
import { getLessons } from '../services/lessons.js';

export function HomeView({ router }) {
  const lessons = getLessons();

  const view = document.createElement('div');
  view.className = 'view view--home';

  view.append(Header({ router }));

  const container = document.createElement('main');
  container.className = 'container';

  const hero = document.createElement('section');
  hero.className = 'hero';
  hero.innerHTML = `
    <h1 class="hero__title">Scratch Academy</h1>
    <p class="hero__tagline">
      Aprenda programação modificando jogos que já funcionam.
      Nunca comece com a tela em branco.
    </p>`;
  container.append(hero);

  if (lessons.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'Nenhuma missão disponível. Adicione uma pasta em /lessons.';
    container.append(empty);
  } else {
    const list = document.createElement('div');
    list.className = 'mission-list';
    lessons.forEach((lesson, index) => {
      list.append(MissionPanel({ lesson, router, current: index === 0 }));
    });
    container.append(list);
  }

  view.append(container);
  return view;
}
