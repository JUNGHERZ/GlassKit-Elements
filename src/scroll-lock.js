// Keep the page still behind an open <glk-modal> or <glk-sheet> (since
// 1.30.0). The top layer makes the page inert for pointer and keyboard, but
// a wheel or a finger over the dimmed area still scrolled the document.
// overflow: hidden on the root scroller stops that; inner scrollers of the
// page cannot be reached through the overlay, and the page's own scripts can
// still scroll it. One count for every open overlay, so closing one of two
// keeps the lock. Where a classic scrollbar disappears with it, the body
// takes its width as padding, so the page does not shift sideways; measured
// before and after, so a gutter the browser keeps is not paid twice.

let locks = 0;
let saved = null;

function lockPageScroll() {
  if (locks++ > 0) return;
  const root = document.documentElement, body = document.body;
  const bar = window.innerWidth - root.clientWidth;
  saved = { overflow: root.style.overflow, padding: body.style.paddingRight };
  const padding = getComputedStyle(body).paddingRight;
  root.style.overflow = 'hidden';
  const gone = bar - (window.innerWidth - root.clientWidth);
  if (gone > 0) body.style.paddingRight = `calc(${padding} + ${gone}px)`;
}

function unlockPageScroll() {
  if (locks === 0 || --locks > 0) return;
  document.documentElement.style.overflow = saved.overflow;
  document.body.style.paddingRight = saved.padding;
  saved = null;
}

/**
 * One overlay's share of the lock: hold() while it is open, release() on
 * every way it closes — both are safe to call twice.
 */
export function scrollLock() {
  let held = false;
  return {
    hold() { if (!held) { held = true; lockPageScroll(); } },
    release() { if (held) { held = false; unlockPageScroll(); } },
  };
}
