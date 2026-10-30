// The keyboard focus through changes of a list's or a tree's items (since
// 1.32.0), for <glk-list> and <glk-tree>. Taking a node out of the document
// takes the focus with it: a focused item that the page — or a sortable
// list itself — moves with insertBefore() leaves the focus on the body, and
// one it removes leaves it nowhere, and one in a level that closes loses
// it a frame later. After each change of the host's items
// the focus goes back to the element that had it; where that element went,
// or now lies in a closed level, to the item that took its place, the one
// before it, or the nearest open item around it. Only while the focus was
// in the host: one that left it — by Tab, a click, a focus() of the page —
// stays where it went.

/** Whether node lies in host, through shadow roots. */
const within = (node, host) => {
  for (let n = node; n; n = n.parentNode || n.host) if (n === host) return true;
  return false;
};

/**
 * Keeps the focus in host. isItem(node) tells the host's items, focusOf(item)
 * the element of an item that takes the focus (or null), shown(item) whether
 * an item can be seen. Returns { destroy() }.
 */
function keepFocus(host, { isItem, focusOf, shown = () => true }) {
  let last = null;        // the element that had the focus, in a shadow root perhaps
  let lastItem = null;    // the item it belongs to
  const forget = () => { last = lastItem = null; };

  const onFocusIn = (e) => {
    const path = e.composedPath();
    last = path[0];
    lastItem = path.find(n => isItem(n)) ?? null;
  };
  // Gone on purpose, to an element outside; a node taken out of the
  // document leaves no relatedTarget.
  const onFocusOut = (e) => { if (e.relatedTarget && !within(e.relatedTarget, host)) forget(); };
  // A press moves the focus or drops it; a focusable element pressed in the
  // host takes it again right after.
  const onDown = () => forget();

  const take = (item) => {
    const el = item && focusOf(item);
    el?.focus({ preventScroll: true });
    return Boolean(el);
  };
  const usable = (n) => n && n.isConnected && isItem(n) && shown(n);
  /** The nearest item at or around node that can be seen. */
  const openAround = (node) => {
    for (let n = node; n && n !== host; n = n.parentElement) if (usable(n)) return n;
    return null;
  };
  const sibling = (n, dir) => {
    while (n && !usable(n)) n = n[dir];
    return n;
  };

  const restore = (records) => {
    if (!last) return;
    // Through shadow roots (since 1.38.0): in an app's shadow root
    // document.activeElement is only its outermost host.
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    if (active && active !== document.body && active !== document.documentElement) {
      // Still focused, in a level that just closed — the browser drops the
      // focus at the next frame: the open item around it takes it now.
      if (lastItem?.isConnected && within(active, host) && within(lastItem, host) && !shown(lastItem)) take(openAround(lastItem.parentElement));
      return;
    }
    const here = Boolean(lastItem?.isConnected && within(lastItem, host));
    // Moved, in the host or to another list: the same element again.
    if (last.isConnected && (!here || shown(lastItem))) {
      last.focus({ preventScroll: true });
      return;
    }
    // Still here, in a closed level: the open item around it.
    if (here && take(openAround(lastItem.parentElement))) return;
    // Removed: what took its place, the one before it, the item around it.
    for (const r of records) {
      if (![...r.removedNodes].some(n => n === lastItem || n.contains?.(lastItem))) continue;
      if (take(sibling(r.nextSibling, 'nextSibling')) || take(sibling(r.previousSibling, 'previousSibling')) || take(openAround(r.target))) return;
    }
    forget();
  };

  const observer = new MutationObserver(restore);
  observer.observe(host, { childList: true, subtree: true, attributes: true, attributeFilter: ['expanded', 'hidden'] });
  host.addEventListener('focusin', onFocusIn);
  host.addEventListener('focusout', onFocusOut);
  document.addEventListener('pointerdown', onDown, true);
  return {
    destroy() {
      observer.disconnect();
      host.removeEventListener('focusin', onFocusIn);
      host.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('pointerdown', onDown, true);
      forget();
    },
  };
}

export { keepFocus as k };
