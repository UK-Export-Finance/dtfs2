/* eslint-disable no-new */
/* eslint-disable no-undef */
if (typeof MOJFrontend.FilterToggleButton !== 'undefined') {
  const filter = document.querySelector('.moj-filter');
  const toggleButtonContainer = document.querySelector('.moj-action-bar__filter');

  if (filter && toggleButtonContainer) {
    new MOJFrontend.FilterToggleButton(filter, {
      bigModeMediaQuery: '(min-width: 48.063em)',
      startHidden: true,
      toggleButton: {
        showText: 'Show filter',
        hideText: 'Hide filter',
        classes: 'govuk-button--secondary',
      },
      toggleButtonContainer: {
        element: toggleButtonContainer,
      },
    });
  }
}
