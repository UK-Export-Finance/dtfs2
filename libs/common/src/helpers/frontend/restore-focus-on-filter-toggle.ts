export type RestoreFocusOnFilterToggleOptions = {
  toggleContainerSelector: string;
  filterPanelSelector: string;
  filterPanelId: string;
};

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

const isVisible = (element: HTMLElement): boolean => element.offsetParent !== null;

const getFocusableWithin = (root: HTMLElement): HTMLElement[] => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);

/**
 * Wires a keyboard router that keeps Tab / Shift+Tab order consistent between
 * the toggle button, the filter panel and the element that follows the toggle
 * in the DOM.
 *
 * The MOJ `moj-filter-layout` renders the filter panel BEFORE the toggle and
 * results in the DOM. Without this router, pressing Tab on the expanded toggle
 * jumps forward past the just-revealed panel and lands on the "Clear filters"
 * link or the results table, forcing screen-reader and keyboard-only users to
 * reverse direction with Shift+Tab to interact with the filter form. This
 * violates WCAG 2.4.3 Focus Order.
 *
 * The router only acts while the panel is expanded (checked via the toggle's
 * `aria-expanded` attribute, which MOJ maintains), so the collapsed-state Tab
 * order is unchanged.
 */
const setupFilterPanelTabRouter = (toggleButton: HTMLButtonElement, filterPanel: HTMLElement): void => {
  const isPanelExpanded = (): boolean => toggleButton.getAttribute('aria-expanded') === 'true';

  const findNextFocusableAfterToggle = (): HTMLElement | null => {
    const focusable = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
    const start = focusable.indexOf(toggleButton);

    // If the toggle is not in the list of focusable elements, something is wrong.
    if (start === -1) {
      return null;
    }

    // Find the next focusable element after the toggle that is not inside the filter panel.
    for (let i = start + 1; i < focusable.length; i += 1) {
      const candidate = focusable[i];

      if (candidate && !filterPanel.contains(candidate)) {
        return candidate;
      }
    }

    return null;
  };

  document.addEventListener('keydown', (event) => {
    // Only act on Tab / Shift+Tab when the panel is expanded.
    if (event.key !== 'Tab' || event.defaultPrevented || !isPanelExpanded()) {
      return;
    }
    // Get the currently focused element, if any.
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (!active) {
      return;
    }

    const panelFocusables = getFocusableWithin(filterPanel);
    const firstInPanel = panelFocusables[0];
    const lastInPanel = panelFocusables[panelFocusables.length - 1];

    // Tab from the toggle → first focusable inside the panel.
    if (!event.shiftKey && active === toggleButton && firstInPanel) {
      event.preventDefault();
      firstInPanel.focus({ preventScroll: true });
      return;
    }

    if (filterPanel.contains(active)) {
      // Shift+Tab from the first focusable in the panel → back to the toggle.
      if (event.shiftKey && active === firstInPanel) {
        event.preventDefault();
        toggleButton.focus({ preventScroll: true });
        return;
      }

      // Tab from the last focusable in the panel → first focusable after the toggle.
      if (!event.shiftKey && active === lastInPanel) {
        const next = findNextFocusableAfterToggle();

        if (next) {
          event.preventDefault();
          next.focus({ preventScroll: true });
        }
      }

      return;
    }

    // Shift+Tab from the element that follows the toggle → last focusable in the panel.
    if (event.shiftKey && lastInPanel) {
      const nextAfterToggle = findNextFocusableAfterToggle();

      if (nextAfterToggle && active === nextAfterToggle) {
        event.preventDefault();
        lastInPanel.focus({ preventScroll: true });
      }
    }
  });
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

  if (!toggleContainer || !filterPanel) {
    return;
  }

  if (!filterPanel.id) {
    filterPanel.id = filterPanelId;
  }

  filterPanel.removeAttribute('tabindex');

  const toggleButton = toggleContainer.querySelector<HTMLButtonElement>('button');

  if (toggleButton) {
    toggleButton.setAttribute('aria-controls', filterPanel.id);
    toggleButton.removeAttribute('aria-haspopup');
    setupFilterPanelTabRouter(toggleButton, filterPanel);
  }

  const focusPing = document.createElement('div');
  focusPing.setAttribute('tabindex', '-1');
  focusPing.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;outline:none;';
  document.body.appendChild(focusPing);

  toggleContainer.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;

    if (!target || !toggleContainer.contains(target)) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        focusPing.focus({ preventScroll: true });
        window.setTimeout(() => {
          target.focus({ preventScroll: true });
        }, 50);
      });
    });
  });
};
