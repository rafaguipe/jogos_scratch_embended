// Scratch Academy — root application component.
// Owns the router, the shared state store, and view mounting.
import { Router } from './core/router.js';
import { State } from './core/state.js';
import { getLesson } from './services/lessons.js';
import { HomeView } from './views/HomeView.js';
import { PlayerView } from './views/PlayerView.js';
import { EditorView } from './views/EditorView.js';

export class App {
  constructor(root) {
    this.root = root;
    this.state = new State({ currentLesson: null });
    this.router = new Router((route) => this.render(route));
  }

  mount() {
    this.router.start();
  }

  render(route) {
    const { name, params } = route;
    const root = this.root;

    if (name === 'play' || name === 'edit') {
      const lesson = getLesson(params.id);
      if (!lesson) {
        this.renderNotFound();
        return;
      }
      this.state.set('currentLesson', lesson);
      const View = name === 'play' ? PlayerView : EditorView;
      root.replaceChildren(View({ root, state: this.state, lesson, router: this.router }));
      return;
    }

    // Home (default).
    this.state.set('currentLesson', null);
    root.replaceChildren(HomeView({ root, state: this.state, router: this.router }));
  }

  renderNotFound() {
    this.root.innerHTML = `
      <div class="not-found">
        <h1>Missão não encontrada</h1>
        <p>A lição que você procurou não existe.</p>
        <button class="btn btn--primary" id="nf-back">Voltar ao Curso</button>
      </div>`;
    this.root.querySelector('#nf-back').addEventListener('click', () => {
      this.router.navigate('/');
    });
  }
}
