const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals filters - remove a filter', () => {
  const ALL_DEALS = [];

  const BSS_DEAL_DRAFT = {
    dealType: CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS,
    submissionType: CONSTANTS.DEALS.SUBMISSION_TYPE.MIA,
    bankInternalRefName: 'Draft BSS',
    additionalRefName: 'Tibettan submarine acquisition scheme',
    status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
    exporter: {
      companyName: 'mock company',
    },
  };

  const GEF_DEAL_DRAFT = {
    dealType: CONSTANTS.DEALS.DEAL_TYPE.GEF,
    bank: { id: BANK1_MAKER1.bank.id },
    bankInternalRefName: 'Draft GEF',
    status: CONSTANTS.DEALS.DEAL_STATUS.DRAFT,
    exporter: {
      companyName: 'mock company',
    },
  };

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.login(BANK1_MAKER1);
    dashboard.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('applies and removes a filter', () => {
    // toggle to show filters (hidden by default)
    dashboard.filtersShowHideButton().click();

    // apply filter
    dashboard.filterCheckboxSubmissionTypeMIA().click();
    dashboard.filtersApplyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // toggle to show filters (hidden by default)
    dashboard.filtersShowHideButton().click();

    // check the filter is in the applied filters section
    const firstAppliedFilter = dashboard.filtersAppliedListItem().first();
    firstAppliedFilter.should('be.visible');

    // click remove button
    firstAppliedFilter.click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // toggle to show filters (hidden by default)
    dashboard.filtersShowHideButton().click();
    dashboard.filtersContainer().should('be.visible');

    // should have empty applied filters
    dashboard.filtersAppliedContainer().should('not.exist');
    dashboard.filtersAppliedList().should('not.exist');

    // checkbox should be NOT be checked
    dashboard.filterCheckboxSubmissionTypeMIA().should('not.be.checked');

    // should render all deals
    dashboard.rows().should('have.length', ALL_DEALS.length);
  });
});
