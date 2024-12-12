const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../../fixtures/constants');
const { dashboardDeals } = require('../../../../pages');
const { dashboardFilters, dashboardSubNavigation } = require('../../../../partials');
const { BSS_DEAL_DRAFT } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.createGefDeal({}).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.login(BANK1_MAKER1);
  });

  beforeEach(() => {
    cy.saveSession();
    dashboardDeals.visit();

    // toggle to show filters (hidden by default)
    filters.showHideButton().click();
  });

  describe('by default', () => {
    it('renders all deals', () => {
      dashboardDeals.rows().should('be.visible');
      dashboardDeals.rows().should('have.length', ALL_DEALS.length);
    });

    it('hides filters and renders `show filter` button', () => {
      // toggle to show filters (hidden by default)
      filters.showHideButton().click();

      filters.panel.container().should('not.be.visible');

      filters.showHideButton().should('be.visible');
      filters.showHideButton().should('have.text', 'Show filter');
    });
  });

  describe('clicking `show filter` button', () => {
    it('renders all filters container', () => {
      filters.panel.container().should('be.visible');
    });

    it('changes show/hide button text', () => {
      filters.showHideButton().should('be.visible');
      filters.showHideButton().should('have.text', 'Hide filter');
    });

    it('renders `apply filters` button', () => {
      filters.panel.form.applyFiltersButton().should('be.visible');
      filters.panel.form.applyFiltersButton().contains('Apply filters');
    });
  });

  describe('renders all filters empty/unchecked by default', () => {
    it('keyword', () => {
      filters.panel.form.keyword.label().contains('Keyword');
      filters.panel.form.keyword.input().should('be.visible');
      filters.panel.form.keyword.input().should('have.value', '');
    });

    it('product/dealType', () => {
      dashboardDeals.filters.panel.form.dealType.bssEwcs.label().contains(CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS);
      dashboardDeals.filters.panel.form.dealType.bssEwcs.checkbox().should('exist');
      dashboardDeals.filters.panel.form.dealType.bssEwcs.checkbox().should('not.be.checked');

      dashboardDeals.filters.panel.form.dealType.gef.label().contains(CONSTANTS.DEALS.DEAL_TYPE.GEF);
      dashboardDeals.filters.panel.form.dealType.gef.checkbox().should('exist');
      dashboardDeals.filters.panel.form.dealType.gef.checkbox().should('not.be.checked');
    });

    it('submissionType/notice type', () => {
      // AIN
      dashboardDeals.filters.panel.form.submissionType.AIN.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.AIN);
      dashboardDeals.filters.panel.form.submissionType.AIN.checkbox().should('exist');
      dashboardDeals.filters.panel.form.submissionType.AIN.checkbox().should('not.be.checked');

      // MIA
      dashboardDeals.filters.panel.form.submissionType.MIA.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
      dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('exist');
      dashboardDeals.filters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');

      // MIN
      dashboardDeals.filters.panel.form.submissionType.MIN.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIN);
      dashboardDeals.filters.panel.form.submissionType.MIN.checkbox().should('exist');
      dashboardDeals.filters.panel.form.submissionType.MIN.checkbox().should('not.be.checked');
    });

    it('status', () => {
      // all statuses
      dashboardDeals.filters.panel.form.status.all.label().contains('All statuses');
      dashboardDeals.filters.panel.form.status.all.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.all.checkbox();

      // draft
      dashboardDeals.filters.panel.form.status.draft.label().contains(CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
      dashboardDeals.filters.panel.form.status.draft.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.draft.checkbox().should('not.be.checked');

      // ready for checker
      dashboardDeals.filters.panel.form.status.readyForChecker.label().contains(CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);
      dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.readyForChecker.checkbox().should('not.be.checked');

      // maker's input required
      dashboardDeals.filters.panel.form.status.makerInputRequired.label().contains(CONSTANTS.DEALS.DEAL_STATUS.CHANGES_REQUIRED);
      dashboardDeals.filters.panel.form.status.makerInputRequired.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.makerInputRequired.checkbox().should('not.be.checked');

      // submitted
      dashboardDeals.filters.panel.form.status.submitted.label().contains(CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF);
      dashboardDeals.filters.panel.form.status.submitted.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.submitted.checkbox().should('not.be.checked');

      // Acknowledged
      dashboardDeals.filters.panel.form.status.acknowledgedByUKEF.label().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
      dashboardDeals.filters.panel.form.status.acknowledgedByUKEF.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.acknowledgedByUKEF.checkbox().should('not.be.checked');

      // in progress by UKEF
      dashboardDeals.filters.panel.form.status.inProgressByUKEF.label().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_IN_PROGRESS);
      dashboardDeals.filters.panel.form.status.inProgressByUKEF.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.inProgressByUKEF.checkbox().should('not.be.checked');

      // accepted by UKEF (with conditions)
      dashboardDeals.filters.panel.form.status.acceptedByUKEFWithConditions.label().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS);
      dashboardDeals.filters.panel.form.status.acceptedByUKEFWithConditions.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.acceptedByUKEFWithConditions.checkbox().should('not.be.checked');

      // accepted by UKEF (without conditions)
      dashboardDeals.filters.panel.form.status.acceptedByUKEFWithoutConditions.label().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS);
      dashboardDeals.filters.panel.form.status.acceptedByUKEFWithoutConditions.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.acceptedByUKEFWithoutConditions.checkbox().should('not.be.checked');

      // rejected by UKEF
      dashboardDeals.filters.panel.form.status.rejectedByUKEF.label().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_REFUSED);
      dashboardDeals.filters.panel.form.status.rejectedByUKEF.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.rejectedByUKEF.checkbox().should('not.be.checked');

      // abandoned
      dashboardDeals.filters.panel.form.status.abandoned.label().contains(CONSTANTS.DEALS.DEAL_STATUS.ABANDONED);
      dashboardDeals.filters.panel.form.status.abandoned.checkbox().should('exist');
      dashboardDeals.filters.panel.form.status.abandoned.checkbox().should('not.be.checked');
    });

    it('contains the correct aria-label for no deal filters selected', () => {
      dashboardSubNavigation
        .deals()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal('deals: ,Filters selected: none');
        });

      dashboardSubNavigation
        .facilities()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal('');
        });
    });
  });
});
