// Scroll an item to the middle of its scrolling row — shared by
// <glk-date-strip> and <glk-segmented overflow="scroll">. Computed from
// client rects and applied to the row alone, where scrollIntoView would move
// every scrolling ancestor, the page included. A relative scrollBy works in
// both writing directions: scrollLeft runs negative in RTL, the distance on
// screen does not. Returns false while the row has no width — before the
// first layout, or hidden — so the caller can try again from a
// ResizeObserver. Pass smooth for a reveal that follows a value change, not
// for one caused by layout; reduced motion wins over it.

export function revealCentered(scroller, item, smooth) {
  if (!item || !scroller.clientWidth) return false;
  const port = scroller.getBoundingClientRect();
  const box = item.getBoundingClientRect();
  const delta = box.left + box.width / 2 - (port.left + scroller.clientLeft + scroller.clientWidth / 2);
  const glide = smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  scroller.scrollBy({ left: delta, behavior: glide ? 'smooth' : 'instant' });
  return true;
}
