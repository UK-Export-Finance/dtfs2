const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');
const {
  BSS_DEAL_MIA,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals filters - filter by multiple fields', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

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
    dashboard.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('submits the filters and redirects to the dashboard', () => {
    // toggle to show filters (hidden by default)
    dashboard.filtersShowHideButton().click();

    // apply filter 1
    dashboard.filterCheckboxStatusDraft().click();

    // apply filter 2
    dashboard.filterCheckboxSubmissionTypeMIA().click();

    // submit filters
    dashboard.filtersApplyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('renders checked checkboxes', () => {
    // toggle to show filters (hidden by default)
    dashboard.filtersShowHideButton().click();

    dashboard.filterCheckboxStatusDraft().should('be.checked');
    dashboard.filterCheckboxSubmissionTypeMIA().should('be.checked');
  });

  it('renders the applied filters in the `applied filters` section', () => {
    dashboard.filtersAppliedContainer().should('be.visible');
    dashboard.filtersAppliedList().should('be.visible');

    // applied filter 1
    const firstAppliedFilterHeading = dashboard.filtersAppliedHeading().eq(0);

    firstAppliedFilterHeading.should('be.visible');
    firstAppliedFilterHeading.should('have.text', 'Notice Type');

    const firstAppliedFilter = dashboard.filtersAppliedListItem().eq(0);

    firstAppliedFilter.should('be.visible');

    let expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
    firstAppliedFilter.should('have.text', expectedText);

    // applied filter 2
    const secondAppliedFilterHeading = dashboard.filtersAppliedHeading().eq(1);

    secondAppliedFilterHeading.should('be.visible');
    secondAppliedFilterHeading.should('have.text', 'Status');

    const secondAppliedFilter = dashboard.filtersAppliedListItem().eq(1);

    secondAppliedFilter.should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
    secondAppliedFilter.should('have.text', expectedText);
  });

  it('renders the applied filters in the `main container selected filters` section', () => {
    // applied filter 1
    dashboard.filtersSelectedMainContainerNoticeMIA().should('be.visible');

    let expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
    dashboard.filtersSelectedMainContainerNoticeMIA().contains(expectedText);

    // applied filter 2
    dashboard.filtersSelectedMainContainerStatusDraft().should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
    dashboard.filtersSelectedMainContainerStatusDraft().contains(expectedText);
  });

  it('renders only deals that have matching fields - MIA and Draft status', () => {
    const EXPECTED_MIA_DRAFT_DEALS = ALL_DEALS.filter(({ submissionType, status }) =>
      status === CONSTANTS.DEALS.DEAL_STATUS.DRAFT
      && submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);

    dashboard.rows().should('have.length', EXPECTED_MIA_DRAFT_DEALS.length);

    const miaDraftDeal1 = EXPECTED_MIA_DRAFT_DEALS[0];
    const miaDraftDeal2 = EXPECTED_MIA_DRAFT_DEALS[1];

    dashboard.row.status(miaDraftDeal1._id).should('have.text', CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
    dashboard.row.type(miaDraftDeal1._id).should('have.text', CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);

    dashboard.row.status(miaDraftDeal2._id).should('have.text', CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
    dashboard.row.type(miaDraftDeal2._id).should('have.text', CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });
});
