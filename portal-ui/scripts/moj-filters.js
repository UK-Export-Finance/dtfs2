/* eslint-disable no-new */
/* eslint-disable no-undef */
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
}
