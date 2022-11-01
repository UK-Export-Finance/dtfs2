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

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters - filter by multiple fields with multiple values', () => {
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
    filters.showHideButton().click();

    // apply filter 1
    dashboardDeals.filters.panel.form.status.draft.checkbox().click();

    // apply filter 2
    dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().click();

    // apply filter 3
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();

    // apply filter 4
    dashboardDeals.filters.panel.form.submissionType.AIN.checkbox().click();

    // submit filters
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('renders checked checkboxes', () => {
    // toggle to show filters (hidden by default)
    filters.showHideButton().click();

    dashboardDeals.filters.panel.form.status.draft.checkbox().should('be.checked');
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');
    dashboardDeals.filters.panel.form.submissionType.AIN.checkbox().should('be.checked');
  });

  it('renders the applied filters in the `applied filters` section', () => {
    filters.panel.selectedFilters.container().should('be.visible');
    filters.panel.selectedFilters.list().should('be.visible');

    // applied filter 1
    const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().eq(0);

    firstAppliedFilterHeading.should('be.visible');
    firstAppliedFilterHeading.should('have.text', 'Notice Type');

    const firstAppliedFilter = filters.panel.selectedFilters.listItem().eq(0);

    firstAppliedFilter.should('be.visible');

    let expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.AIN}`;
    firstAppliedFilter.should('have.text', expectedText);

    // applied filter 2
    const secondAppliedFilter = filters.panel.selectedFilters.listItem().eq(1);

    secondAppliedFilter.should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
    secondAppliedFilter.should('have.text', expectedText);

    // applied filter 3
    const thirdAppliedFilterHeading = filters.panel.selectedFilters.heading().eq(1);

    thirdAppliedFilterHeading.should('be.visible');
    thirdAppliedFilterHeading.should('have.text', 'Status');

    const thirdAppliedFilter = filters.panel.selectedFilters.listItem().eq(2);

    thirdAppliedFilter.should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
    thirdAppliedFilter.should('have.text', expectedText);

    // applied filter 4
    const fourthAppliedFilter = filters.panel.selectedFilters.listItem().eq(3);

    fourthAppliedFilter.should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL}`;
    fourthAppliedFilter.should('have.text', expectedText);
  });

  it('renders the applied filters in the `main container selected filters` section', () => {
    // applied filter 1
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().should('be.visible');

    let expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.MIA}`;
    dashboardDeals.filters.mainContainer.selectedFilters.noticeMIA().contains(expectedText);

    // applied filter 2
    dashboardDeals.filters.mainContainer.selectedFilters.noticeAIN().should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.SUBMISSION_TYPE.AIN}`;
    dashboardDeals.filters.mainContainer.selectedFilters.noticeAIN().contains(expectedText);

    // applied filter 3
    dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.DRAFT}`;
    dashboardDeals.filters.mainContainer.selectedFilters.statusDraft().contains(expectedText);

    // applied filter 3
    dashboardDeals.filters.mainContainer.selectedFilters.statusReadyForChecker().should('be.visible');

    expectedText = `Remove this filter ${CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL}`;
    dashboardDeals.filters.mainContainer.selectedFilters.statusReadyForChecker().contains(expectedText);
  });

  it('renders only deals that have matching fields - MIA, AIN, Draft status, Ready for check status', () => {
    const EXPECTED_DEALS = ALL_DEALS.filter(({ submissionType, status }) =>
      (status === CONSTANTS.DEALS.DEAL_STATUS.DRAFT || status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL)
      && (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA
      || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN));

    dashboardDeals.rows().should('have.length', EXPECTED_DEALS.length);

    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('renders the correct aria-labels based on filter selected', () => {
    dashboardSubNavigation.deals().invoke('attr', 'aria-label').then((label) => {
      expect(label).to.equal('deals: ,Filters selected: , Notice Type: , Automatic Inclusion Notice, Manual Inclusion Application, Status: , Draft, Ready for Checker\'s approval');
    });

    dashboardSubNavigation.facilities().invoke('attr', 'aria-label').then((label) => {
      expect(label).to.equal('');
    });
  });

  it('renders only deals that have matching fields - Draft status, Ready for check status', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();

    filters.showHideButton().click();
    dashboardDeals.filters.panel.form.status.draft.checkbox().click();
    dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    const EXPECTED_DEALS = ALL_DEALS.filter(({ status }) =>
      status === CONSTANTS.DEALS.DEAL_STATUS.DRAFT || status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);

    dashboardDeals.rows().should('have.length', EXPECTED_DEALS.length);
  });

  it('renders only deals that have matching fields - AIN, MIA', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();

    filters.showHideButton().click();
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.AIN.checkbox().click();
    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    const EXPECTED_DEALS = ALL_DEALS.filter(({ submissionType }) =>
      submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN);

    dashboardDeals.rows().should('have.length', EXPECTED_DEALS.length);
  });

  it('renders only deals that have matching fields for all filters', () => {
    cy.login(BANK1_MAKER1);
    dashboardDeals.visit();

    filters.showHideButton().click();
    dashboardDeals.filters.panel.form.status.draft.checkbox().click();
    dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().click();
    dashboardDeals.filters.panel.form.status.makerInputRequired.checkbox().click();
    dashboardDeals.filters.panel.form.status.submitted.checkbox().click();
    dashboardDeals.filters.panel.form.status.acknowledgedByUKEF.checkbox().click();
    dashboardDeals.filters.panel.form.status.inProgressByUKEF.checkbox().click();
    dashboardDeals.filters.panel.form.status.acceptedByUKEFWithConditions.checkbox().click();
    dashboardDeals.filters.panel.form.status.acceptedByUKEFWithoutConditions.checkbox().click();
    dashboardDeals.filters.panel.form.status.rejectedByUKEF.checkbox().click();
    dashboardDeals.filters.panel.form.status.abandoned.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.AIN.checkbox().click();
    dashboardDeals.filters.panel.form.submissionType.MIN.checkbox().click();
    dashboardDeals.filters.panel.form.dealType.gef.checkbox().click();
    dashboardDeals.filters.panel.form.dealType.bssEwcs.checkbox().click();

    filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    const EXPECTED_DEALS = ALL_DEALS.filter(({ dealType, status, submissionType }) =>
      (submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIA
        || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.AIN || submissionType === CONSTANTS.DEALS.SUBMISSION_TYPE.MIN)
      && (dealType === CONSTANTS.DEALS.DEAL_TYPE.GEF || dealType === CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS) && (
        status === CONSTANTS.DEALS.DEAL_STATUS.DRAFT || status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL
        || status === CONSTANTS.DEALS.DEAL_STATUS.CHANGES_REQUIRED || status === CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL
        || status === CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF || status === CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED
        || status === CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED || status === CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS
        || status === CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS || status === CONSTANTS.DEALS.DEAL_STATUS.UKEF_IN_PROGRESS
        || status === CONSTANTS.DEALS.DEAL_STATUS.ABANDONED
      ));

    dashboardDeals.rows().should('have.length', EXPECTED_DEALS.length);
  });
});
