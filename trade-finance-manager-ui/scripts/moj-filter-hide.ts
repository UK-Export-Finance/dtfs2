/* eslint-disable no-new */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import $ from 'jquery';

declare global {
  interface Window {
    MOJFrontend: any;
  }
}

type FilterVisibility = 'SHOWN' | 'HIDDEN';

const filterSelector = '.moj-filter-layout__filter';
const toggleButtonContainerSelector = '.moj-action-bar__filter';
const toggleButtonContainer = document.querySelector(toggleButtonContainerSelector)!;

const params = (toggleButtonContainer as HTMLElement).dataset;
const FILTER_VISIBILITY_SESSION_KEY = `${params.filteredTableId}-filters-visibility-state`;

const setFilterVisibility = (visibility: FilterVisibility) => {
  sessionStorage.setItem(FILTER_VISIBILITY_SESSION_KEY, visibility);
};

const cachedShownStatus = sessionStorage.getItem(FILTER_VISIBILITY_SESSION_KEY) as FilterVisibility | null;

if (cachedShownStatus) {
  setFilterVisibility(cachedShownStatus);
}

// Initially display filters, but hide them if they were previously hidden
const startHidden = cachedShownStatus === 'HIDDEN';

new window.MOJFrontend.FilterToggleButton({
  bigModeMediaQuery: '(min-width: 48.063em)',
  startHidden,
  toggleButton: {
    container: $(toggleButtonContainerSelector),
    showText: 'Show filters',
    hideText: 'Hide filters',
    classes: 'govuk-button--secondary',
  },
  filter: {
    container: $(filterSelector),
  },
}); // NOSONAR

const toggleButton = document.querySelector(`${toggleButtonContainerSelector} > button`) as HTMLButtonElement;

toggleButton.addEventListener('click', () => {
  const currentStatus = sessionStorage.getItem(FILTER_VISIBILITY_SESSION_KEY) as FilterVisibility;

  setFilterVisibility(currentStatus === 'HIDDEN' ? 'SHOWN' : 'HIDDEN');
});
