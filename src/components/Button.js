/**
 * Button — the only button style used across views.
 * Variants: primary (solid), secondary (outline), ghost (plain).
 * Icons are inline SVG strings passed via `icon`.
 */
export function Button({ label, variant = 'primary', onClick, icon = null, extraClass = '' }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `btn btn--${variant} ${extraClass}`.trim();

  if (icon) {
    const iconSpan = document.createElement('span');
    iconSpan.className = 'btn__icon';
    iconSpan.innerHTML = icon;
    button.append(iconSpan);
  }

  const labelSpan = document.createElement('span');
  labelSpan.textContent = label;
  button.append(labelSpan);

  if (onClick) button.addEventListener('click', onClick);
  return button;
}

/** Shared inline icons (kept here so views don't duplicate SVG markup). */
export const Icons = {
  play: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  edit: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>',
  back: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>',
  hint: '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2a7 7 0 0 0-4 12.74c.6.42 1 .98 1 1.76V18h6v-1.5c0-.78.4-1.34 1-1.76A7 7 0 0 0 12 2zm-1 14v-2h2v2h-2zm0-4h2V6h-2v6z"/></svg>',
};
