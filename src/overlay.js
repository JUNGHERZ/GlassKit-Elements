// Panels that open over the page — <glk-tooltip>, <glk-menu>, <glk-popover>
// and the overflow of <glk-breadcrumbs> — sit in the top layer (the popover
// API) since 1.32.0: above every stacking context and outside every box
// that clips, where the popover used to be cut off by an overflow: hidden
// around it and, closed, still widened the page by its box. Their place is
// measured: next to the anchor on the asked side, flipped to the other side
// where the viewport leaves no room, shifted along the side to stay inside
// it, and kept there while the page scrolls or a size changes. Measured
// rather than CSS anchor positioning: the anchor often sits in the light
// DOM and the panel in a shadow root, where an anchor name does not reach.

const EDGE = 8;   // distance kept from the viewport's edges

const OPPOSITE = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };

// The panels open right now (since 1.36.0), so that a container can tell
// whether one of them lies inside it: a modeless <glk-sheet> leaves Escape
// to an open popover or menu in it, which closes first.
const openPanels = new Set();

/** The node's parent in the flat tree: its slot, its parent, or the shadow root's host. */
function flatParent(node) {
  return node.assignedSlot || node.parentNode || node.host || null;
}

/** Whether a panel opened by openPanel() is open inside container, through slots and shadow roots. */
export function panelOpenWithin(container) {
  for (const panel of openPanels) {
    for (let node = flatParent(panel); node; node = flatParent(node)) {
      if (node === container) return true;
    }
  }
  return false;
}

/** A popover kind the browser knows, else "manual". */
function kindOf(panel, kind) {
  panel.popover = kind;
  if (panel.popover !== kind) panel.popover = 'manual';
  return panel.popover;
}

/**
 * Where a panel goes. side: top, bottom, start or end (start and end follow
 * the anchor's writing direction); align: center, start or end along it.
 */
function position(panel, anchor, { side, align, offset }) {
  const a = anchor.getBoundingClientRect();
  const w = panel.offsetWidth, h = panel.offsetHeight;
  const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
  const rtl = getComputedStyle(anchor).direction === 'rtl';
  let s = side === 'start' ? (rtl ? 'right' : 'left') : side === 'end' ? (rtl ? 'left' : 'right') : side;
  const room = {
    top: a.top - offset - EDGE,
    bottom: vh - a.bottom - offset - EDGE,
    left: a.left - offset - EDGE,
    right: vw - a.right - offset - EDGE,
  };
  const need = s === 'top' || s === 'bottom' ? h : w;
  if (room[s] < need && room[OPPOSITE[s]] > room[s]) s = OPPOSITE[s];

  const clamp = (v, size, limit) => Math.max(EDGE, Math.min(v, limit - EDGE - size));
  let x, y;
  if (s === 'top' || s === 'bottom') {
    y = s === 'top' ? a.top - offset - h : a.bottom + offset;
    const start = rtl ? a.right - w : a.left, end = rtl ? a.left : a.right - w;
    x = align === 'start' ? start : align === 'end' ? end : a.left + a.width / 2 - w / 2;
    x = clamp(x, w, vw);
  } else {
    x = s === 'left' ? a.left - offset - w : a.right + offset;
    y = align === 'start' ? a.top : align === 'end' ? a.bottom - h : a.top + a.height / 2 - h / 2;
    y = clamp(y, h, vh);
  }
  panel.style.left = `${Math.round(x)}px`;
  panel.style.top = `${Math.round(y)}px`;
  panel.dataset.side = s;
}

/**
 * Shows panel in the top layer next to anchor and keeps it there while it
 * is open: on every scroll, a resize, and a size change of either. kind is
 * the popover type ("manual", or "hint" for a tooltip, where the browser
 * knows it). Returns { update(), close() }; close() hides the panel and
 * stops following.
 */
export function openPanel(panel, anchor, { side = 'bottom', align = 'center', offset = 8, kind = 'manual' } = {}) {
  if (panel.popover !== kind) kindOf(panel, kind);
  if (!panel.matches(':popover-open')) panel.showPopover();
  let frame = 0;
  const update = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      if (panel.isConnected && anchor.isConnected) position(panel, anchor, { side, align, offset });
    });
  };
  position(panel, anchor, { side, align, offset });
  const ro = new ResizeObserver(update);
  ro.observe(panel);
  ro.observe(anchor);
  window.addEventListener('scroll', update, { capture: true, passive: true });
  window.addEventListener('resize', update, { passive: true });
  openPanels.add(panel);
  return {
    update,
    close() {
      openPanels.delete(panel);
      cancelAnimationFrame(frame);
      ro.disconnect();
      window.removeEventListener('scroll', update, { capture: true });
      window.removeEventListener('resize', update);
      if (panel.matches(':popover-open')) panel.hidePopover();
    },
  };
}

/**
 * The element that takes the focus for a trigger: the trigger itself, or
 * where it is an element with its own shadow root (<glk-button>, <glk-pill>,
 * <glk-tab-item>), the first focusable element in there.
 */
export function focusTarget(trigger) {
  const inner = trigger?.shadowRoot?.querySelector('button, a[href], input, select, textarea, [tabindex]');
  return inner || trigger;
}

/**
 * The behaviour of a tooltip, for <glk-tooltip> and the items of a rail:
 * shown on hover after delay(), on keyboard focus at once, and by touch on
 * a long press (500 ms) while the finger rests, a moment longer after it
 * lifts — a tap never shows it and is never held up. Hidden when the
 * pointer leaves the control and the tooltip (it may move onto the tooltip,
 * WCAG 1.4.13), on blur, on a press, and on Escape without moving the
 * focus. Returns { show(), hide(), destroy() }.
 */
export function tooltipBehaviour(trigger, panel, { side = () => 'top', delay = () => 400, offset = () => 8, anchor = () => focusTarget(trigger), onChange } = {}) {
  // A popover from the start: closed, the browser keeps it out of the page.
  kindOf(panel, 'hint');
  let showTimer = 0, hideTimer = 0, pressTimer = 0, handle = null, press = null;
  const clear = () => { clearTimeout(showTimer); clearTimeout(hideTimer); clearTimeout(pressTimer); };
  const onKey = e => {
    if (e.key !== 'Escape' || !handle) return;
    e.preventDefault();
    e.stopPropagation();                  // a dialog around stays open
    hide();
  };
  const show = () => {
    clear();
    if (handle || !trigger.isConnected) return;
    handle = openPanel(panel, anchor() || trigger, { side: side(), align: 'center', offset: offset(), kind: 'hint' });
    document.addEventListener('keydown', onKey, true);
    onChange?.(true);
  };
  const hide = () => {
    clear();
    if (!handle) return;
    handle.close();
    handle = null;
    document.removeEventListener('keydown', onKey, true);
    onChange?.(false);
  };
  const enter = e => {
    if (e.pointerType === 'touch') return;
    clearTimeout(hideTimer);
    if (!handle) { clearTimeout(showTimer); showTimer = setTimeout(show, delay()); }
  };
  const leave = e => {
    if (e.pointerType === 'touch') return;
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 120);
  };
  const focusIn = e => { if (e.composedPath()[0]?.matches?.(':focus-visible')) show(); };
  const down = e => {
    if (e.pointerType !== 'touch') { hide(); return; }
    press = { x: e.clientX, y: e.clientY };
    clearTimeout(pressTimer);
    pressTimer = setTimeout(show, 500);
  };
  const move = e => {
    if (press && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 10) { clearTimeout(pressTimer); press = null; }
  };
  const up = e => {
    if (e.pointerType !== 'touch') return;
    clearTimeout(pressTimer);
    press = null;
    if (handle) { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 1500); }
  };
  trigger.addEventListener('pointerenter', enter);
  trigger.addEventListener('pointerleave', leave);
  panel.addEventListener('pointerenter', enter);
  panel.addEventListener('pointerleave', leave);
  trigger.addEventListener('focusin', focusIn);
  trigger.addEventListener('focusout', hide);
  trigger.addEventListener('pointerdown', down);
  trigger.addEventListener('pointermove', move);
  trigger.addEventListener('pointerup', up);
  trigger.addEventListener('pointercancel', up);
  return {
    show, hide,
    get open() { return Boolean(handle); },
    destroy() {
      hide();
      trigger.removeEventListener('pointerenter', enter);
      trigger.removeEventListener('pointerleave', leave);
      panel.removeEventListener('pointerenter', enter);
      panel.removeEventListener('pointerleave', leave);
      trigger.removeEventListener('focusin', focusIn);
      trigger.removeEventListener('focusout', hide);
      trigger.removeEventListener('pointerdown', down);
      trigger.removeEventListener('pointermove', move);
      trigger.removeEventListener('pointerup', up);
      trigger.removeEventListener('pointercancel', up);
    },
  };
}
