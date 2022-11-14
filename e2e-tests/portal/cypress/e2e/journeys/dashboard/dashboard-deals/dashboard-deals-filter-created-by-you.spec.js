const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');

const { dashboardDeals } = require('../../../pages');
const { dashboardFilters, dashboardSubNavigation } = require('../../../partials');
const {
  BSS_DEAL_MIA,
  BSS_DEAL_AIN,
  BSS_DEAL_READY_FOR_CHECK,
  GEF_DEAL_DRAFT,
} = require('../fixtures');

const { BANK1_MAKER1, BANK1_MAKER2, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - Created by you', () => {
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

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneDeal(BSS_DEAL_MIA, BANK1_MAKER2).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER2).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneDeal(BSS_DEAL_READY_FOR_CHECK, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER2).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  before(() => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('should apply the `Created by you` filter', () => {
    dashboardDeals.rows().should('have.length', ALL_DEALS.length);

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    // apply created by you filter
    dashboardDeals.filters.panel.form.createdByYou.label().contains('Created by you');

    // apply created by you filter
    dashboardDeals.filters.panel.form.createdByYou.checkbox().click();

    // submit filters
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('should have the correct number of deals when createdByYou selected', () => {
    const EXPECTED_DEALS = ALL_DEALS.filter(({ maker }) => maker.username === BANK1_MAKER1.username);

    dashboardDeals.rows().should('have.length', EXPECTED_DEALS.length);
  });

  it('should have the correct labels when createdByYou selected', () => {
    dashboardDeals.filters.mainContainer.selectedFilters.createdByYou().should('be.visible');

    filters.showHideButton().click();

    const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().eq(0);

    // does not have heading
    firstAppliedFilterHeading.should('not.be.visible');

    const firstAppliedFilter = filters.panel.selectedFilters.listItem().eq(0);

    firstAppliedFilter.should('be.visible');

    const expectedText = 'Remove this filter Created by you';
    firstAppliedFilter.should('have.text', expectedText);

    dashboardDeals.filters.panel.form.createdByYou.checkbox().should('be.checked');

    dashboardSubNavigation.deals().invoke('attr', 'aria-label').then((label) => {
      expect(label).to.equal('deals: ,Filters selected: , : , Created by you');
    });
  });

  it('should be able to remove filter from filter container and see all deals again', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));

    filters.showHideButton().click();

    // apply created by you filter
    dashboardDeals.filters.panel.form.createdByYou.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    filters.showHideButton().click();

    const firstAppliedFilter = filters.panel.selectedFilters.listItem().eq(0);
    firstAppliedFilter.click();

    filters.panel.selectedFilters.listItem().should('not.exist');
    dashboardDeals.rows().should('have.length', ALL_DEALS.length);
  });

  it('should be able to remove filter from main container and see all deals again', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));

    filters.showHideButton().click();

    // apply created by you filter
    dashboardDeals.filters.panel.form.createdByYou.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    dashboardDeals.filters.mainContainer.selectedFilters.createdByYou().click('');

    dashboardDeals.filters.mainContainer.selectedFilters.createdByYou().should('not.exist');
    dashboardDeals.rows().should('have.length', ALL_DEALS.length);
  });

  it('should be able to select multiple filters and list relevant deals', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));

    filters.showHideButton().click();

    // apply created by you filter
    dashboardDeals.filters.panel.form.createdByYou.checkbox().click();
    dashboardDeals.filters.panel.form.dealType.bssEwcs.checkbox().click();
    dashboardDeals.filters.panel.form.dealType.gef.checkbox().click();
    dashboardDeals.filters.panel.form.status.draft.checkbox().click();
    dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.AIN.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.MIN.checkbox().click();

    filters.panel.form.applyFiltersButton().click();

    const EXPECTED_DEALS = ALL_DEALS.filter(({ maker, status, submissionType }) =>
      (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN)
       && (status === CONSTANTS.DEALS.DEAL_STATUS.DRAFT || status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL)
       && maker.username === BANK1_MAKER1.username);

    dashboardDeals.rows().should('have.length', EXPECTED_DEALS.length);
  });

  it('should be able to select multiple filters and remove created by you filter and list relevant deals', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));

    filters.showHideButton().click();

    // apply created by you filter
    dashboardDeals.filters.panel.form.createdByYou.checkbox().click();
    dashboardDeals.filters.panel.form.dealType.bssEwcs.checkbox().click();
    dashboardDeals.filters.panel.form.dealType.gef.checkbox().click();
    dashboardDeals.filters.panel.form.status.draft.checkbox().click();
    dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.AIN.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.MIN.checkbox().click();

    filters.panel.form.applyFiltersButton().click();

    dashboardDeals.filters.mainContainer.selectedFilters.createdByYou().click('');

    const EXPECTED_DEALS = ALL_DEALS.filter(({ status, submissionType }) =>
      (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN)
       && (status === CONSTANTS.DEALS.DEAL_STATUS.DRAFT || status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL));

    dashboardDeals.rows().should('have.length', EXPECTED_DEALS.length);
  });
});
