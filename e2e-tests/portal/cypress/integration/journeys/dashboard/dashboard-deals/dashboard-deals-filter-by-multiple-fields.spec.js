const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboardDeals } = require('../../../pages');
const {
  BSS_DEAL_MIA,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Deals filters - filter by multiple fields', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_MIA, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneDeal(BSS_DEAL_MIA, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  before(() => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('submits the filters and redirects to the dashboard', () => {
    // toggle to show filters (hidden by default)
    dashboardDeals.filters.showHideButton().click();

    // apply filter 1
    dashboardDeals.filters.panel.form.status.draft.checkbox().click();

    // apply filter 2
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();

    // submit filters
    dashboardDeals.filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('renders checked checkboxes', () => {
    // toggle to show filters (hidden by default)
    dashboardDeals.filters.showHideButton().click();

    dashboardDeals.filters.panel.form.status.draft.checkbox().should('be.checked');
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');
  });

  it('renders the applied filters in the `applied filters` section', () => {
    dashboardDeals.filters.panel.selectedFilters.container().should('be.visible');
    dashboardDeals.filters.panel.selectedFilters.list().should('be.visible');

    // applied filter 1
    const firstAppliedFilterHeading = dashboardDeals.filters.panel.selectedFilters.heading().eq(0);

    firstAppliedFilterHeading.should('be.visible');
    firstAppliedFilterHeading.should('have.text', 'Notice Type');

    const firstAppliedFilter = dashboardDeals.filters.panel.selectedFilters.listItem().eq(0);

    firstAppliedFilter.should('be.visible');

    let expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
    firstAppliedFilter.should('have.text', expectedText);

    // applied filter 2
    const secondAppliedFilterHeading = dashboardDeals.filters.panel.selectedFilters.heading().eq(1);

    secondAppliedFilterHeading.should('be.visible');
    secondAppliedFilterHeading.should('have.text', 'Status');

    const secondAppliedFilter = dashboardDeals.filters.panel.selectedFilters.listItem().eq(1);

    secondAppliedFilter.should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
    secondAppliedFilter.should('have.text', expectedText);
  });

  it('renders the applied filters in the `main container selected filters` section', () => {
    // applied filter 1
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().should('be.visible');

    let expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().contains(expectedText);

    // applied filter 2
    dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
    dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().contains(expectedText);
  });

  it('renders only deals that have matching fields - MIA and Draft status', () => {
    const EXPECTED_MIA_DRAFT_DEALS = ALL_DEALS.filter(({ submissionType, status }) =>
      status === CONSTANTS.DEALS.DEAL_STATUS.DRAFT
      || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);

    dashboardDeals.rows().should('have.length', EXPECTED_MIA_DRAFT_DEALS.length);

    const miaDraftDeal1 = EXPECTED_MIA_DRAFT_DEALS[0];
    const miaDraftDeal2 = EXPECTED_MIA_DRAFT_DEALS[1];

    dashboardDeals.row.status(miaDraftDeal1._id).should('have.text', CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
    dashboardDeals.row.type(miaDraftDeal1._id).should('have.text', CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);

    dashboardDeals.row.status(miaDraftDeal2._id).should('have.text', CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
    dashboardDeals.row.type(miaDraftDeal2._id).should('have.text', CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
