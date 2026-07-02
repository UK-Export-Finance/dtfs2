/* eslint-disable no-new */
/* eslint-disable no-undef */

/**
 * @file Portal UI bundle entry that wires the MOJ Frontend `FilterToggleButton`
 * to the dashboard "Show filter" / "Hide filter" action bar.
 *
 * The script runs on every page that includes `mojFilters.js`; the underlying
 * MOJ component is a no-op when its target selectors are absent so it is safe
 * to load globally.
 *
 * After the MOJ component is initialised, `restoreFocusOnFilterToggle` is
 * invoked to satisfy the DAC focus-order acceptance criterion: MOJ's default
 * behaviour moves keyboard focus onto the newly revealed filter panel, but
 * screen-reader users expect focus to remain on the toggle button they
 * activated. The helper also wires `aria-controls` on the toggle to the panel
 * so assistive technologies can announce the relationship.
 *
 * GEF UI consumes this same bundle via the reverse proxy, so any change here
 * requires the Subresource Integrity hash to be refreshed in BOTH
 * `portal-ui/templates/index.njk` and `gef-ui/templates/index.njk` (and their
 * matching component-tests/index/index.component-test.* assertions).
 */
import { restoreFocusOnFilterToggle } from '@ukef/dtfs2-common/frontend';

if (typeof MOJFrontend.FilterToggleButton !== 'undefined') {
  new MOJFrontend.FilterToggleButton({
    bigModeMediaQuery: '(min-width: 48.063em)',
    startHidden: true,
    toggleButton: {
      container: $('.moj-action-bar__filter'),
      showText: 'Show filter',
      hideText: 'Hide filter',
      classes: 'govuk-button--secondary',
      attributes: {
        'data-cy': 'show-hide-filters-toggle-button',
      },
    },
    filter: {
      container: $('.moj-filter'),
    },
  });

  restoreFocusOnFilterToggle({
    toggleContainerSelector: '.moj-action-bar__filter',
    filterPanelSelector: '.moj-filter',
    filterPanelId: 'dashboard-filters-panel',
  });
}
