const relative = require('../../../relativeURL');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');

// UI actions and assertions for each filter test.
// just need to pass in relevant field type/value/heading etc to each function.

const filters = dashboardFilters;

const submitRedirectsToDashboard = (cypressElementSelector) => {
  // apply filter
  cypressElementSelector.click();

  dashboardFilters.panel.form.applyFiltersButton().click();

  cy.url().should('eq', relative('/dashboard/facilities/0'));
};

const shouldRenderCheckedCheckbox = (cypressElementSelector) => {
  cypressElementSelector.should('be.checked');
};

const shouldRenderAppliedFilterInPanelSelectedFilters = (expectedHeading, expectedValue) => {
  filters.panel.selectedFilters.container().should('be.visible');
  filters.panel.selectedFilters.list().should('be.visible');

  const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

  firstAppliedFilterHeading.should('be.visible');
  firstAppliedFilterHeading.should('have.text', expectedHeading);

  const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

  firstAppliedFilter.should('be.visible');

  const expectedText = `Remove this filter ${expectedValue}`;
  firstAppliedFilter.should('have.text', expectedText);
};

const shouldRenderAppliedFilterInMainContainerSelectedFilters = (cypressElementSelector, expectedValue) => {
  cypressElementSelector.should('be.visible');

  const expectedText = `Remove this filter ${expectedValue}`;
  cypressElementSelector.contains(expectedText);
};

const shouldRenderOnlyGivenTypes = (FACILITIES, fieldName, expectedType) => {
  const EXPECTED_FACILITIES = FACILITIES.filter((facility) => facility[fieldName] === expectedType);
  dashboardFacilities.rows().should('have.length', EXPECTED_FACILITIES.length);

  const firstFacility = EXPECTED_FACILITIES[0];

  dashboardFacilities.row.type(firstFacility._id).should('exist');
};

module.exports = {
  submitRedirectsToDashboard,
  shouldRenderCheckedCheckbox,
  shouldRenderAppliedFilterInPanelSelectedFilters,
  shouldRenderAppliedFilterInMainContainerSelectedFilters,
  shouldRenderOnlyGivenTypes,
};
