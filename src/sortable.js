// Reordering by drag and drop, shared by <glk-list sortable> and
// <glk-tree sortable>, with <glk-breadcrumbs> as drop targets (since
// 1.32.0). By mouse and pen after a few pixels, by touch after a long press
// (before it a swipe scrolls), by keyboard with Space, the arrow keys and
// Escape. Lists of the same group exchange items, and so do trees; both drop
// onto breadcrumbs of that group. Without a group a list or a tree keeps its
// items to itself, while breadcrumbs with drop-target still take them.
//
// The events go to the element that owns the dragged item, all with
// via: 'mouse' | 'touch' | 'keyboard': glk-sort-start { item, from },
// glk-sort-over { item, target, position } while the target changes —
// cancelable: cancelled, the target shows that it refuses the item and a
// drop there does nothing — glk-sort { item, from, to, target, position }
// on the drop, cancelable and before anything moves, and glk-sort-cancel
// { item }. Not cancelled, the element moves the dragged node itself;
// cancelled, it leaves the DOM to the page, which renders the new order
// from its state — the items glide into place either way, once the new
// order is in the DOM. A drop on a crumb moves nothing: that level is not
// in the DOM.

const groups = new Map();           // group name → Set of hosts
const DRAG_START = 6;               // px of pointer travel before a drag
const LONG_PRESS = 500;             // ms a finger rests before it lifts an item
const OPEN_DELAY = 600;             // ms over a closed container before it opens
const EDGE = 40;                    // px from a scroller's edge where it scrolls

export const SORT_MESSAGES = {
  roleDescription: 'sortable',
  instructions: 'Press Space to pick up. Arrow keys move it, Space drops it, Escape cancels.',
  pickedUp: ({ label, position, size, container }) => `${label}, picked up. Position ${position} of ${size} in ${container}.`,
  moved: ({ position, size }) => `Position ${position} of ${size}.`,
  into: ({ container, position, size }) => `Into ${container}, position ${position} of ${size}.`,
  onto: ({ container }) => `Onto ${container}.`,
  dropped: ({ label }) => `${label} dropped.`,
  cancelled: ({ label, position, size }) => `Move cancelled, ${label} is back at position ${position} of ${size}.`,
};

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const groupOf = host => host.getAttribute('group') || '';

export function joinGroup(host) {
  const name = groupOf(host);
  if (!groups.has(name)) groups.set(name, new Set());
  groups.get(name).add(host);
  return () => groups.get(name)?.delete(host);
}

/**
 * The hosts a dragged item of host can land in. Without a group a list or a
 * tree keeps its items to itself; breadcrumbs with drop-target and no group
 * still take them.
 */
const members = host => {
  const name = groupOf(host);
  const all = [...(groups.get(name) ?? [])].filter(h => h.isConnected);
  return name ? all : all.filter(h => h === host || h.localName === 'glk-breadcrumbs');
};

/** The nearest box that scrolls vertically, or the page. */
function scrollerOf(el) {
  for (let n = el; n; n = n.parentElement || n.getRootNode()?.host) {
    if (!(n instanceof Element)) continue;
    const cs = getComputedStyle(n);
    if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1) return n;
  }
  return document.scrollingElement;
}

/**
 * Makes host's items sortable. adapter tells the host's own structure:
 *   items()          the draggable items, in order
 *   rowOf(item)      the element that is the item's row (for its box)
 *   focusOf(item)    the element that takes the focus
 *   containerOf(item) the list, the tree, or the parent item
 *   childrenOf(container) the items in a container, in order
 *   canContain(item) whether an item takes others inside it
 *   nameOf(container) a container's name, for the announcements
 *   open(item)       opens a closed container (a tree item)
 * Returns { keydown(e, item) → handled, dragging, sync(), destroy() }.
 */
export function attachSortable(host, adapter) {
  host._sortAdapter = adapter;
  const leave = joinGroup(host);
  let drag = null;              // the drag going on
  let press = null;             // a pointer down, not yet a drag
  let pressTimer = 0, scrollFrame = 0, openTimer = 0, eatClick = false;

  // ── Announcements ──
  const live = document.createElement('div');
  live.setAttribute('aria-live', 'polite');
  live.style.cssText = 'position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
  host.shadowRoot.appendChild(live);
  const messages = () => ({ ...SORT_MESSAGES, ...(host.messages || {}) });
  const say = text => {
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = text; });
  };

  // ── The ghost that follows the pointer ──
  const ghost = document.createElement('div');
  ghost.className = 'glass-sort__ghost';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.popover = 'manual';
  host.shadowRoot.appendChild(ghost);

  const labelOf = item => item.label || item.title || item.textContent.replace(/\s+/g, ' ').trim();
  const draggable = item => item && !item.hasAttribute('no-drag');
  const handleOf = item => item.querySelector(':scope > [slot="handle"]');
  const positionIn = (container, item) => {
    const list = adapter.childrenOf(container);
    return { position: list.indexOf(item) + 1, size: list.length };
  };

  /** Keeps the focusable parts of the items announced as sortable. */
  const sync = () => {
    if (drag && !drag.item.isConnected) cancel();            // the page took it away
    const m = messages();
    for (const item of adapter.items()) {
      adapter.mark?.(item, draggable(item) ? m : null);
      const handle = handleOf(item);
      if (handle) handle.style.touchAction = 'none';          // a finger on the handle drags at once
    }
  };

  // ── Targets ──
  const hostOfItem = item => members(host).find(h => h._sortAdapter?.owns(item));

  /** What lies under the pointer: an item of a member, or a crumb. */
  const targetAt = (x, y) => {
    for (const crumbs of members(host)) {
      if (crumbs.localName !== 'glk-breadcrumbs') continue;
      const hit = crumbs._dropTargetAt(x, y);
      // The current crumb stands for the level a list shows: its own.
      if (hit && !(hit.current && host.localName === 'glk-list')) return { kind: 'crumb', host: crumbs, ...hit, position: 'inside' };
    }
    for (const el of document.elementsFromPoint(x, y)) {
      if (!el.localName.endsWith('-item')) continue;
      const owner = hostOfItem(el);
      if (!owner || el.localName !== drag.item.localName) continue;
      if (el === drag.item || drag.item.contains(el)) return null;
      const a = owner._sortAdapter;
      const r = a.rowOf(el).getBoundingClientRect();
      const rel = (y - r.top) / r.height;
      if (rel > 1) continue;                        // below its row: a child of it is hit next
      const inside = a.canContain(el) && rel > 0.25 && rel < 0.75;
      return { kind: 'item', host: owner, item: el, el: a.rowOf(el), position: inside ? 'inside' : rel < 0.5 ? 'before' : 'after' };
    }
    return null;
  };

  /** Where a target puts the item: { container, index } (null for a crumb). */
  const destination = (target, item) => {
    if (!target) return null;
    if (target.kind === 'crumb') return { container: target.item, index: null };
    const a = target.host._sortAdapter;
    if (target.position === 'inside') {
      const list = a.childrenOf(target.item).filter(i => i !== item);
      return { container: target.item, index: list.length };
    }
    const container = a.containerOf(target.item);
    const list = a.childrenOf(container).filter(i => i !== item);
    const at = list.indexOf(target.item);
    return { container, index: target.position === 'after' ? at + 1 : at };
  };

  const clearMarks = () => {
    for (const h of members(host)) {
      if (h.localName === 'glk-breadcrumbs') { h._markDrop(null); h._hoverOverflow(false); continue; }
      for (const item of h._sortAdapter?.items() ?? []) {
        h._sortAdapter.rowOf(item)?.classList.remove('is-sort-before', 'is-sort-after', 'is-sort-inside', 'is-sort-refused');
      }
    }
  };

  const mark = (target, refused) => {
    clearMarks();
    if (!target) return;
    if (target.kind === 'crumb') {
      if (target.overflow) target.host._hoverOverflow(true);
      else target.host._markDrop(target.el, refused ? 'refused' : 'target');
      return;
    }
    target.el.classList.add(`is-sort-${target.position}`);
    if (refused) target.el.classList.add('is-sort-refused');
  };

  /** A new target: glk-sort-over, marks, a container that opens after a while. */
  const aim = target => {
    const same = (a, b) => a?.item === b?.item && a?.el === b?.el && a?.position === b?.position;
    if (same(target, drag.target)) return;
    drag.target = target;
    drag.refused = Boolean(target && !target.overflow
      && !host.emit('glk-sort-over', { item: drag.item, target: target.item ?? null, position: target.position, via: drag.via }, { cancelable: true }));
    mark(target, drag.refused);
    clearTimeout(openTimer);
    if (target?.kind === 'item' && target.position === 'inside') {
      openTimer = setTimeout(() => target.host._sortAdapter.open?.(target.item), OPEN_DELAY);
    }
  };

  // ── FLIP: the items glide from where they were to where they are ──
  const allItems = () => members(host).flatMap(h => h._sortAdapter?.items() ?? []);
  const measure = () => new Map(allItems().map(el => [el, el.getBoundingClientRect()]));
  const glide = before => {
    if (reducedMotion()) return;
    const cs = getComputedStyle(host);
    const duration = parseFloat(cs.getPropertyValue('--gl-sort-duration')) || 180;
    const easing = cs.getPropertyValue('--gl-sort-easing').trim() || 'ease-out';
    for (const el of allItems()) {
      const a = before.get(el);
      if (!a) continue;
      const b = el.getBoundingClientRect();
      const dx = a.left - b.left, dy = a.top - b.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
      el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }], { duration, easing });
    }
  };
  /** Cancelled glk-sort: the page renders the order, the glide follows it. */
  const glideOnNextChange = before => {
    const watched = members(host).filter(h => h._sortAdapter);
    const mo = new MutationObserver(() => {
      mo.disconnect();
      clearTimeout(timer);
      requestAnimationFrame(() => glide(before));
    });
    for (const h of watched) mo.observe(h, { childList: true, subtree: true });
    const timer = setTimeout(() => mo.disconnect(), 1500);
  };

  /**
   * glk-sort, then the move, unless cancelled. Back where it came from is
   * no move: glk-sort-cancel instead. Returns whether it was a move.
   */
  const commit = (item, target, to, via) => {
    const fromContainer = adapter.containerOf(item);
    const from = { container: fromContainer, index: adapter.childrenOf(fromContainer).indexOf(item) };
    if (to.container === from.container && to.index === from.index) {
      host.emit('glk-sort-cancel', { item, via });
      return false;
    }
    const detail = { item, from, to, target: target.item ?? null, position: target.position, via };
    const before = measure();
    if (!host.emit('glk-sort', detail, { cancelable: true })) { glideOnNextChange(before); return true; }
    if (target.kind === 'crumb') return true;                  // that level is the page's
    const a = target.host._sortAdapter;
    const list = a.childrenOf(to.container).filter(i => i !== item);
    if (a.insert(to.container, item, list[to.index] ?? null) === false) return true;
    if (to.container.localName?.endsWith('-item')) a.open?.(to.container);
    requestAnimationFrame(() => glide(before));
    return true;
  };

  // ── Pointer ──
  const startDrag = (item, via, x, y) => {
    const row = adapter.rowOf(item);
    const r = row.getBoundingClientRect();
    drag = { item, via, target: null, refused: false, grab: { x: x - r.left, y: y - r.top }, x, y };
    row.classList.add('is-sort-source');
    if (via !== 'keyboard') {
      ghost.textContent = labelOf(item);
      ghost.style.width = `${Math.min(r.width, 360)}px`;
      ghost.showPopover();
      placeGhost();
      getSelection()?.removeAllRanges();
    }
    host.emit('glk-sort-start', { item, from: adapter.containerOf(item), via });
    window.addEventListener('touchmove', holdPage, { passive: false });
  };
  const placeGhost = () => {
    ghost.style.left = `${Math.round(drag.x - drag.grab.x)}px`;
    ghost.style.top = `${Math.round(drag.y - drag.grab.y)}px`;
  };
  const holdPage = e => { if (drag) e.preventDefault(); };     // a lifted item, not a scroll

  const autoScroll = () => {
    cancelAnimationFrame(scrollFrame);
    if (!drag || drag.via === 'keyboard') return;
    const scroller = scrollerOf(host);
    const page = scroller === document.scrollingElement;
    const top = page ? 0 : scroller.getBoundingClientRect().top;
    const bottom = page ? innerHeight : scroller.getBoundingClientRect().bottom;
    const v = drag.y < top + EDGE ? -1 : drag.y > bottom - EDGE ? 1 : 0;
    if (!v) return;
    scrollFrame = requestAnimationFrame(() => {
      scroller.scrollTop += v * 8;
      if (drag) { aim(targetAt(drag.x, drag.y)); autoScroll(); }
    });
  };

  const endDrag = () => {
    if (!drag) return;
    adapter.rowOf(drag.item)?.classList.remove('is-sort-source');
    clearMarks();
    clearTimeout(openTimer);
    cancelAnimationFrame(scrollFrame);
    window.removeEventListener('touchmove', holdPage);
    drag = null;
  };

  const hideGhost = (to) => {
    if (!ghost.matches(':popover-open')) return;
    if (!to || reducedMotion()) { ghost.hidePopover(); return; }
    const g = ghost.getBoundingClientRect();
    const anim = ghost.animate([{ transform: 'none', opacity: 1 }, { transform: `translate(${to.left - g.left}px, ${to.top - g.top}px)`, opacity: 0.6 }],
      { duration: 160, easing: 'ease-out' });
    anim.onfinish = () => { if (ghost.matches(':popover-open')) ghost.hidePopover(); };
  };

  const cancel = () => {
    if (!drag) return;
    const item = drag.item;
    const container = adapter.containerOf(item);
    const { position, size } = positionIn(container, item);
    host.emit('glk-sort-cancel', { item, via: drag.via });
    if (drag.via === 'keyboard') say(messages().cancelled({ label: labelOf(item), position, size }));
    hideGhost(null);
    endDrag();
  };

  const down = e => {
    if (drag || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const path = e.composedPath();
    const item = path.find(n => n.localName?.endsWith('-item') && adapter.owns(n));
    if (!draggable(item)) return;
    const handle = handleOf(item);
    if (handle && !path.includes(handle)) return;               // with a handle, only the handle
    if (path.some(n => n.matches?.('input, textarea, select, [contenteditable]'))) return;
    press = { item, id: e.pointerId, x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch', onHandle: Boolean(handle) };
    if (press.touch && !press.onHandle) {
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => {
        if (!press) return;
        startDrag(press.item, 'touch', press.x, press.y);
        navigator.vibrate?.(10);
      }, LONG_PRESS);
    }
  };
  const move = e => {
    if (press && e.pointerId === press.id && !drag) {
      const far = Math.hypot(e.clientX - press.x, e.clientY - press.y) > DRAG_START;
      if (press.touch && !press.onHandle) {
        if (far) { clearTimeout(pressTimer); press = null; }   // a swipe: the page scrolls
        return;
      }
      if (!far) return;
      startDrag(press.item, press.touch ? 'touch' : 'mouse', press.x, press.y);
    }
    if (!drag || drag.via === 'keyboard' || (press && e.pointerId !== press.id)) return;
    drag.x = e.clientX;
    drag.y = e.clientY;
    placeGhost();
    aim(targetAt(drag.x, drag.y));
    autoScroll();
  };
  const up = e => {
    clearTimeout(pressTimer);
    if (!press || e.pointerId !== press.id) return;
    press = null;
    if (!drag || drag.via === 'keyboard') return;
    eatClick = true;
    setTimeout(() => { eatClick = false; }, 400);
    if (e.type === 'pointercancel') { cancel(); return; }
    const { item, target, refused, via } = drag;
    const to = destination(target, item);
    if (!target || refused || !to || target.overflow) { cancel(); return; }
    endDrag();
    commit(item, target, to, via);
    // It glides to the item's row; one the page took away or put out of
    // sight leaves no place to go.
    const row = item.isConnected ? adapter.rowOf(item)?.getBoundingClientRect() : null;
    hideGhost(row && row.width ? row : null);
  };
  const click = e => { if (eatClick) { eatClick = false; e.stopPropagation(); e.preventDefault(); } };
  const escape = e => { if (e.key === 'Escape' && drag && drag.via !== 'keyboard') { e.preventDefault(); cancel(); } };
  // A held mouse selects no text and drags no link or image of its own.
  const still = e => { if (press || (drag && drag.via !== 'keyboard')) e.preventDefault(); };

  host.addEventListener('pointerdown', down);
  document.addEventListener('selectstart', still);
  host.addEventListener('dragstart', still);
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  host.addEventListener('click', click, true);
  document.addEventListener('keydown', escape, true);

  // ── Keyboard ──
  /** The keyboard's place: a container and an index in it, without the item. */
  const kbTarget = () => {
    const { container, index } = drag.kb;
    if (container.localName === 'glk-breadcrumb') {
      const crumbs = members(host).find(h => h.localName === 'glk-breadcrumbs' && h._entries?.some(x => x.item === container));
      const entry = crumbs?._entries.find(x => x.item === container);
      return entry ? { kind: 'crumb', host: crumbs, item: container, el: entry.el, position: 'inside' } : null;
    }
    const list = adapter.childrenOf(container).filter(i => i !== drag.item);
    if (list.length === 0) return container === host ? null : { kind: 'item', host, item: container, el: adapter.rowOf(container), position: 'inside' };
    return index < list.length
      ? { kind: 'item', host, item: list[index], el: adapter.rowOf(list[index]), position: 'before' }
      : { kind: 'item', host, item: list[list.length - 1], el: adapter.rowOf(list[list.length - 1]), position: 'after' };
  };
  const announcePlace = () => {
    const { container, index } = drag.kb;
    const m = messages();
    if (container.localName === 'glk-breadcrumb') { say(m.onto({ container: labelOf(container) })); return; }
    const size = adapter.childrenOf(container).filter(i => i !== drag.item).length + 1;
    const where = { position: index + 1, size };
    say(container === drag.kb.home ? m.moved(where) : m.into({ ...where, container: adapter.nameOf(container) }));
  };

  const keydown = (e, item) => {
    if (!drag) {
      if (e.key !== ' ' || !draggable(item)) return false;
      // Space on the item itself, or on a handle that takes the focus; a
      // handle limits only where a pointer starts, so one that cannot take
      // the focus (an <svg>) still leaves the keyboard a way.
      const handle = handleOf(item);
      const path = e.composedPath();
      if (!(handle && path.includes(handle)) && path[0] !== adapter.focusOf(item)) return false;
      e.preventDefault();
      const container = adapter.containerOf(item);
      startDrag(item, 'keyboard', 0, 0);
      ghost.hidePopover();                                    // the line shows the place
      drag.kb = { container, index: adapter.childrenOf(container).indexOf(item), home: container };
      const { position, size } = positionIn(container, item);
      say(messages().pickedUp({ label: labelOf(item), position, size, container: adapter.nameOf(container) }));
      aim(kbTarget());
      return true;
    }
    if (drag.via !== 'keyboard') return false;
    const kb = drag.kb;
    const list = () => adapter.childrenOf(kb.container).filter(i => i !== drag.item);
    const rtl = getComputedStyle(host).direction === 'rtl';
    const key = e.key === 'ArrowRight' ? (rtl ? 'out' : 'in') : e.key === 'ArrowLeft' ? (rtl ? 'in' : 'out') : e.key;
    if (kb.container.localName === 'glk-breadcrumb' && ['ArrowUp', 'ArrowDown', 'Home', 'End', 'in', 'out'].includes(key)) {
      e.preventDefault();
      if (key !== 'in') return true;
      kb.container = kb.home;                                 // back down into the list
      kb.index = adapter.childrenOf(kb.home).indexOf(drag.item);
      aim(kbTarget());
      announcePlace();
      return true;
    }
    switch (key) {
      case 'ArrowUp': kb.index = Math.max(0, kb.index - 1); break;
      case 'ArrowDown': kb.index = Math.min(list().length, kb.index + 1); break;
      case 'Home': kb.index = 0; break;
      case 'End': kb.index = list().length; break;
      case 'in': {
        const above = list()[kb.index - 1];
        if (!above || !adapter.canContain(above)) { e.preventDefault(); return true; }
        kb.container = above;
        kb.index = adapter.childrenOf(above).filter(i => i !== drag.item).length;
        adapter.open?.(above);
        break;
      }
      case 'out': {
        if (kb.container === host) {
          // The top of a list: the level above is the crumb before the current one.
          const crumbs = members(host).find(h => h.localName === 'glk-breadcrumbs');
          const parent = crumbs?._parentTarget;
          if (!parent) { e.preventDefault(); return true; }
          kb.container = parent.item;
          kb.index = null;
          break;
        }
        const outer = adapter.containerOf(kb.container);
        kb.index = adapter.childrenOf(outer).filter(i => i !== drag.item).indexOf(kb.container) + 1;
        kb.container = outer;
        break;
      }
      case ' ': {
        e.preventDefault();
        const { item: it, target, refused } = drag;
        const to = destination(target, it);
        if (!target || refused || !to) { cancel(); return true; }
        endDrag();
        const moved = commit(it, target, to, 'keyboard');
        const { position, size } = positionIn(adapter.containerOf(it), it);
        say(moved ? messages().dropped({ label: labelOf(it) }) : messages().cancelled({ label: labelOf(it), position, size }));
        requestAnimationFrame(() => adapter.focusOf(it)?.focus?.());
        return true;
      }
      case 'Escape':
        e.preventDefault();
        cancel();
        return true;
      case 'Tab':
        cancel();
        return true;                                          // the focus moves on
      default:
        return false;
    }
    e.preventDefault();
    aim(kbTarget());
    announcePlace();
    return true;
  };

  sync();

  return {
    keydown,
    sync,
    get dragging() { return Boolean(drag) || eatClick; },
    destroy() {
      if (drag) cancel();
      leave();
      host.removeEventListener('pointerdown', down);
      document.removeEventListener('selectstart', still);
      host.removeEventListener('dragstart', still);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      host.removeEventListener('click', click, true);
      document.removeEventListener('keydown', escape, true);
      clearTimeout(pressTimer);
      for (const item of adapter.items()) adapter.mark?.(item, null);
      live.remove();
      ghost.remove();
      delete host._sortAdapter;
    },
  };
}
