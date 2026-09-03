/**
 * Header — app bar with the Scratch Academy brand.
 * When a lesson context is active, shows a "Voltar ao Curso" action.
 */
export function Header({ router, backAction = null }) {
  const header = document.createElement('header');
  header.className = 'header';

  const brand = document.createElement('button');
  brand.type = 'button';
  brand.className = 'header__brand';
  brand.setAttribute('aria-label', 'Scratch Academy — início');
  brand.innerHTML = `
    <span class="header__logo" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="34" height="34">
        <rect width="64" height="64" rx="14" fill="#4C97FF"/>
        <path d="M18 30 L10 14 L26 23 Z" fill="#F2A33C"/>
        <path d="M46 30 L54 14 L38 23 Z" fill="#F2A33C"/>
        <circle cx="32" cy="38" r="16" fill="#F2A33C"/>
        <circle cx="26" cy="37" r="2.4" fill="#1A1A1A"/>
        <circle cx="38" cy="37" r="2.4" fill="#1A1A1A"/>
        <path d="M27 46 Q32 50 37 46" stroke="#1A1A1A" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      </svg>
    </span>
    <span class="header__title">Scratch Academy</span>`;
  brand.addEventListener('click', () => router.navigate('/'));
  header.append(brand);

  if (backAction) {
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn btn--ghost';
    back.innerHTML = `<span class="btn__icon">${backAction.icon}</span><span>${backAction.label}</span>`;
    back.addEventListener('click', backAction.onClick);
    header.append(back);
  }

  return header;
}
