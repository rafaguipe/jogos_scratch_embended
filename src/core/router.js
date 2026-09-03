/**
 * Minimal hash-based router.
 *
 * Routes:
 *   #/          -> home (mission list / current mission)
 *   #/play/:id  -> player view for lesson :id
 *   #/edit/:id  -> editor view for lesson :id
 *
 * No dependencies, no history API: hash routing works on any static host.
 */
export class Router {
  /**
   * @param {(route: {name: string, params: Object}) => void} onRoute
   *   Called whenever the route changes (including on start).
   */
  constructor(onRoute) {
    this.onRoute = onRoute;
    this.handleHashChange = this.handleHashChange.bind(this);
  }

  start() {
    window.addEventListener('hashchange', this.handleHashChange);
    this.handleHashChange();
  }

  stop() {
    window.removeEventListener('hashchange', this.handleHashChange);
  }

  /** Navigate to a path (e.g. '/play/lesson1'). */
  navigate(path) {
    const target = `#${path}`;
    if (window.location.hash === target) {
      this.handleHashChange();
    } else {
      window.location.hash = target;
    }
  }

  handleHashChange() {
    const hash = window.location.hash.slice(1) || '/';
    const [path] = hash.split('?');
    const segments = path.split('/').filter(Boolean);

    let name = 'home';
    const params = {};

    if (segments[0] === 'play' && segments[1]) {
      name = 'play';
      params.id = segments[1];
    } else if (segments[0] === 'edit' && segments[1]) {
      name = 'edit';
      params.id = segments[1];
    }

    this.onRoute({ name, params });
  }
}
