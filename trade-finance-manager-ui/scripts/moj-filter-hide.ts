type FilterToggleButtonConfig = {
  bigModeMediaQuery: string;
  startHidden: boolean;
  toggleButton: {
    showText: string;
    hideText: string;
    classes: string;
  };
  toggleButtonContainer: {
    element: Element;
  };
};

type MOJFrontend = {
  FilterToggleButton: new (root: Element, config: FilterToggleButtonConfig) => object;
};

declare global {
  interface Window {
    MOJFrontend: MOJFrontend;
  }
}

type FilterVisibility = 'SHOWN' | 'HIDDEN';

const toggleButtonContainerSelector = '.moj-action-bar__filter';
const filterComponentSelector = '.moj-filter';

const toggleButtonContainer = document.querySelector(toggleButtonContainerSelector)!;
const toggleButtonContainerDataAttributes = (toggleButtonContainer as HTMLElement).dataset;
const FILTER_VISIBILITY_SESSION_KEY = `${toggleButtonContainerDataAttributes.filteredTableId}-filters-visibility-state`;

/**
 * Sets the visibility state of the filter in session storage.
 * @param visibility - The visibility state to set.
 */
const setFilterVisibility = (visibility: FilterVisibility) => {
  sessionStorage.setItem(FILTER_VISIBILITY_SESSION_KEY, visibility);
};

/**
 * Retrieves the cached filter visibility status from session storage and sets it.
 * If a cached status exists, it updates the filter visibility accordingly.
 * @returns True if the filter should start hidden, false otherwise.
 */
const initialiseFilterVisibility = (): boolean => {
  const cachedVisibilityStatus = sessionStorage.getItem(FILTER_VISIBILITY_SESSION_KEY) as FilterVisibility | null;

  if (cachedVisibilityStatus) {
    setFilterVisibility(cachedVisibilityStatus);
  }

  return cachedVisibilityStatus === 'HIDDEN';
};

/**
 * Initialises the MOJFrontend FilterToggleButton with specified configuration.
 * This function sets up the filter panel toggle functionality for the UI.
 */
const initialiseFilterToggleButton = (): object | undefined => {
  const startHidden = initialiseFilterVisibility();

  const filter = document.querySelector(filterComponentSelector);

  if (filter && toggleButtonContainer) {
    return new window.MOJFrontend.FilterToggleButton(filter, {
      bigModeMediaQuery: '(min-width: 48.063em)',
      startHidden,
      toggleButton: {
        showText: 'Show filters',
        hideText: 'Hide filters',
        classes: 'govuk-button--secondary',
      },
      toggleButtonContainer: {
        element: toggleButtonContainer,
      },
    });
  }

  return undefined;
};

/**
 * Toggles the filter visibility and updates the session storage.
 */
const toggleFilterVisibility = () => {
  const currentStatus = sessionStorage.getItem(FILTER_VISIBILITY_SESSION_KEY) as FilterVisibility;

  setFilterVisibility(currentStatus === 'HIDDEN' ? 'SHOWN' : 'HIDDEN');
};

/**
 * Sets up the event listener for the filter toggle button.
 * This function finds the toggle button and attaches a click event listener
 * that triggers the filter visibility toggle.
 */
const setupFilterToggleButtonListener = (): void => {
  const toggleButton = document.querySelector(`${toggleButtonContainerSelector} > button`) as HTMLButtonElement;

  // Add click event listener to toggle button
  toggleButton.addEventListener('click', toggleFilterVisibility);
};

initialiseFilterToggleButton();

setupFilterToggleButtonListener();
