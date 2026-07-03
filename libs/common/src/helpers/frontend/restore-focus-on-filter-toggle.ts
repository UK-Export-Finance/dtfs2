export type RestoreFocusOnFilterToggleOptions = {
  toggleContainerSelector: string;
  filterPanelSelector: string;
  filterPanelId: string;
};

/**
 * Neutralises the MOJ `FilterToggleButton` behaviours that break the DAC
 * focus-order acceptance criterion, and links the toggle to its filter panel
 * via `aria-controls`.
 *
 * The MOJ component ships with three accessibility issues on the toggle:
 *  1. It sets `tabindex="-1"` on the filter panel and then calls `.focus()`
 *     on it when expanding, which moves keyboard focus off the toggle button
 *     and scrolls the panel into view.
 *  2. It hard-codes `aria-haspopup="true"` on the toggle, but the filter
 *     panel is a disclosure region — not a popup (menu/listbox/dialog) — so
 *     screen readers announce a misleading "has popup".
 *  3. Because focus briefly leaves and re-enters the toggle around MOJ's
 *     `showMenu()` call, screen readers can announce a stale `aria-expanded`
 *     state ("collapsed" when the panel has just been expanded).
 *
 * Additionally, MOJ's `moj-filter-layout` CSS repositions the toggle button
 * when the panel expands (the action bar moves adjacent to the newly-visible
 * filter column). The button's DOM node does not change, but its visual
 * bounding box does — and some browsers do not repaint the focus outline at
 * the new position, leaving the outline stranded at the old location. Screen
 * readers can also miss the `aria-expanded` state change because MOJ mutates
 * `aria-expanded` *and* the button label synchronously with the click.
 *
 * The helper works around all of these:
 *  - Removes `tabindex` from the panel so MOJ's `.focus()` on it is a no-op
 *    (fixes 1 and 3).
 *  - Removes `aria-haspopup` from the button (fixes 2).
 *  - On every click of the toggle container, moves focus to a hidden
 *    offscreen "focus ping" element and then back to the toggle button.
 *    Blur + re-focus on the same element is optimised away by browsers,
 *    so bouncing focus via a different element forces the browser to
 *    emit a real blur → focus pair. The ping is scheduled after two
 *    animation frames — enough for MOJ's toggle handler, the layout
 *    reflow, and paint to complete — and the return focus is scheduled
 *    after a short `setTimeout` so the accessibility tree has time to
 *    register the ping before the button is re-focused with its new
 *    bounds. `preventScroll: true` is used on both `.focus()` calls to
 *    avoid scrolling the page when the panel expansion changes the
 *    button's position. The ping element is not marked `aria-hidden`
 *    because doing so would hide the focused element from assistive
 *    technology (a WAI-ARIA violation the browser flags in the console);
 *    the div has no accessible name or content, so nothing is announced
 *    in the ~50ms window it holds focus.
 *
 * The panel's `id` is set to `filterPanelId` when absent so `aria-controls`
 * always resolves to a real element.
 */
export const restoreFocusOnFilterToggle = ({ toggleContainerSelector, filterPanelSelector, filterPanelId }: RestoreFocusOnFilterToggleOptions): void => {
  const toggleContainer = document.querySelector<HTMLElement>(toggleContainerSelector);
  const filterPanel = document.querySelector<HTMLElement>(filterPanelSelector);

  // Bail out on pages that don't render the filter action bar (e.g. login).
  if (!toggleContainer || !filterPanel) {
    return;
  }

  // Guarantee the panel has an id so `aria-controls` below always resolves.
  if (!filterPanel.id) {
    filterPanel.id = filterPanelId;
  }

  // Neutralise MOJ's `tabindex="-1"` so its `.focus()` on the panel becomes a no-op.
  filterPanel.removeAttribute('tabindex');

  const toggleButton = toggleContainer.querySelector<HTMLButtonElement>('button');

  if (toggleButton) {
    // Advertise the disclosure relationship to assistive tech.
    toggleButton.setAttribute('aria-controls', filterPanel.id);
    // MOJ's default `aria-haspopup="true"` is misleading — the panel is a disclosure, not a popup.
    toggleButton.removeAttribute('aria-haspopup');
  }

  // Offscreen "focus ping" used to force a real blur → focus pair on the toggle
  // (browsers optimise away blur+re-focus on the same element).
  const focusPing = document.createElement('div');
  focusPing.setAttribute('tabindex', '-1');
  focusPing.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;outline:none;';
  document.body.appendChild(focusPing);

  toggleContainer.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;

    // Ignore clicks that aren't on the toggle button itself (e.g. bubbled from children).
    if (!target || !toggleContainer.contains(target)) {
      return;
    }

    // Two rAFs wait for MOJ's toggle handler + layout reflow + paint to finish
    // before we bounce focus via the ping and restore it to the toggle. The
    // setTimeout gives the accessibility tree a beat to register the ping.
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        focusPing.focus({ preventScroll: true });
        window.setTimeout(() => {
          // `preventScroll` avoids jumping the page when the toggle's new
          // position (after the panel expands/collapses) would otherwise scroll.
          target.focus({ preventScroll: true });
        }, 50);
      });
    });
  });
};
