export type RestoreFocusOnFilterToggleOptions = {
  toggleContainerSelector: string;
  filterPanelSelector: string;
  filterPanelId: string;
};

/**
 * MOJ sets `tabindex="-1"` on the filter panel and then calls
 * `.focus()` on it when expanding, which moves keyboard focus off the toggle
 * button and scrolls the panel into view. Removing `tabindex` makes MOJ's
 * `.focus()` a no-op on the panel.
 */
const neutraliseMojPanelFocus = (filterPanel: HTMLElement): void => {
  filterPanel.removeAttribute('tabindex');
};

/**
 * MOJ hard-codes `aria-haspopup="true"` on the toggle, but the filter
 * panel is a disclosure region — not a popup (menu/listbox/dialog) — so
 * screen readers announce a misleading "has popup".
 */
const removeMisleadingHaspopup = (toggleButton: HTMLButtonElement): void => {
  toggleButton.removeAttribute('aria-haspopup');
};

/**
 * Guarantees the panel has an `id` (so `aria-controls` always resolves) and
 * advertises the disclosure relationship to assistive tech.
 */
const linkToggleToPanel = (toggleButton: HTMLButtonElement, filterPanel: HTMLElement, fallbackId: string): void => {
  if (!filterPanel.id) {
    filterPanel.setAttribute('id', fallbackId);
  }

  toggleButton.setAttribute('aria-controls', filterPanel.id);
};

/**
 * Creates the offscreen "focus ping" element used by
 * {@link bounceFocusViaPingOnToggle} to force a real blur → focus pair on the
 * toggle button. The ping is not marked `aria-hidden` because doing so would
 * hide the focused element from assistive technology (a WAI-ARIA violation
 * the browser flags in the console); the div has no accessible name or
 * content, so nothing is announced in the ~50ms window it holds focus.
 */
const createFocusPingElement = (): HTMLElement => {
  const focusPing = document.createElement('div');

  focusPing.setAttribute('tabindex', '-1');
  focusPing.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;outline:none;';
  document.body.appendChild(focusPing);

  return focusPing;
};

/**
 * Solves two issues with the same "focus ping" mechanism:
 *
 *  - Stale `aria-expanded` announcement: because focus briefly leaves and
 *    re-enters the toggle around MOJ's `showMenu()` call, screen readers can
 *    announce a stale `aria-expanded` state ("collapsed" when the panel has
 *    just been expanded).
 *  - Stranded focus outline: MOJ's `moj-filter-layout` CSS repositions the
 *    toggle button when the panel expands (the action bar moves adjacent to
 *    the newly-visible filter column). The button's DOM node does not
 *    change, but its visual bounding box does — and some browsers do not
 *    repaint the focus outline at the new position, leaving the outline
 *    stranded at the old location.
 *
 * On every click of the toggle container, focus is moved to the offscreen
 * ping element and then back to the toggle button. Blur + re-focus on the
 * same element is optimised away by browsers, so bouncing focus via a
 * different element forces the browser to emit a real blur → focus pair.
 * The ping is scheduled after two animation frames — enough for MOJ's
 * toggle handler, the layout reflow, and paint to complete — and the return
 * focus is scheduled after a short `setTimeout` so the accessibility tree
 * has time to register the ping before the button is re-focused with its
 * new bounds. `preventScroll: true` is used on both `.focus()` calls to
 * avoid scrolling the page when the panel expansion changes the button's
 * position.
 */
const bounceFocusViaPingOnToggle = (toggleContainer: HTMLElement, focusPing: HTMLElement): void => {
  toggleContainer.addEventListener('click', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;

    // Ignore clicks that aren't on the toggle button itself (e.g. bubbled from children).
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

/**
 * Neutralises the MOJ `FilterToggleButton` behaviours that break the DAC
 * focus-order acceptance criterion, and links the toggle to its filter panel
 * via `aria-controls`.
 *
 * The MOJ component ships with four accessibility issues on the toggle, each
 * addressed by a dedicated helper:
 *  - Panel focus theft on expand — {@link neutraliseMojPanelFocus}.
 *  - Misleading `aria-haspopup="true"` on the toggle — {@link removeMisleadingHaspopup}.
 *  - Stale `aria-expanded` announcement by screen readers — {@link bounceFocusViaPingOnToggle}.
 *  - Stranded focus outline after the toggle button is repositioned by the
 *    panel expanding — {@link bounceFocusViaPingOnToggle} (same mechanism as
 *    the stale `aria-expanded` fix).
 *
 * The panel's `id` is set to `filterPanelId` when absent so `aria-controls`
 * always resolves to a real element ({@link linkToggleToPanel}).
 */
export const restoreFocusOnFilterToggle = ({ toggleContainerSelector, filterPanelSelector, filterPanelId }: RestoreFocusOnFilterToggleOptions): void => {
  const toggleContainer = document.querySelector<HTMLElement>(toggleContainerSelector);
  const filterPanel = document.querySelector<HTMLElement>(filterPanelSelector);

  // Bail out on pages that don't render the filter action bar (e.g. login).
  if (!toggleContainer || !filterPanel) {
    return;
  }

  neutraliseMojPanelFocus(filterPanel);

  const toggleButton = toggleContainer.querySelector<HTMLButtonElement>('button');

  if (toggleButton) {
    linkToggleToPanel(toggleButton, filterPanel, filterPanelId);
    removeMisleadingHaspopup(toggleButton);
  }

  const focusPing = createFocusPingElement();

  bounceFocusViaPingOnToggle(toggleContainer, focusPing);
};
