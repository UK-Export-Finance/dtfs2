const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

context('Dashboard Deals filters', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      ALL_DEALS.push(deal);
    });
  });

  describe('by default', () => {
    it('renders all deals', () => {
      cy.login(BANK1_MAKER1);
      dashboard.visit();

      dashboard.rows().should('be.visible');
      dashboard.rows().should('have.length', ALL_DEALS.length);
    });

    it('hides filters and renders `show filter` button', () => {
      dashboard.filters.panel.container().should('not.be.visible');

      dashboard.filters.showHideButton().should('be.visible');
      dashboard.filters.showHideButton().should('have.text', 'Show filter');
    });
  });

  describe('clicking `show filter` button', () => {
    it('renders all filters container', () => {
      dashboard.filters.showHideButton().click();

      dashboard.filters.panel.container().should('be.visible');
    });

    it('changes show/hide button text', () => {
      dashboard.filters.showHideButton().should('be.visible');
      dashboard.filters.showHideButton().should('have.text', 'Hide filter');
    });

    it('renders `apply filters` button', () => {
      dashboard.filters.panel.form.applyFiltersButton().should('be.visible');
      dashboard.filters.panel.form.applyFiltersButton().contains('Apply filters');
    });
  });

  describe('renders all filters empty/unchecked by default', () => {
    it('keyword', () => {
      dashboard.filters.panel.form.keyword.label().contains('Keyword');
      dashboard.filters.panel.form.keyword.input().should('be.visible');
      dashboard.filters.panel.form.keyword.input().should('have.value', '');
    });

    it('product/dealType', () => {
      dashboard.filters.panel.form.dealType.bssEwcs.label().contains(CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS);
      dashboard.filters.panel.form.dealType.bssEwcs.checkbox().should('exist');
      dashboard.filters.panel.form.dealType.bssEwcs.checkbox().should('not.be.checked');

      dashboard.filters.panel.form.dealType.gef.label().contains(CONSTANTS.DEALS.DEAL_TYPE.GEF);
      dashboard.filters.panel.form.dealType.gef.checkbox().should('exist');
      dashboard.filters.panel.form.dealType.gef.checkbox().should('not.be.checked');
    });

    it('submissionType/notice type', () => {
      // AIN
      dashboard.filters.panel.form.submissionType.AIN.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.AIN);
      dashboard.filters.panel.form.submissionType.AIN.checkbox().should('exist');
      dashboard.filters.panel.form.submissionType.AIN.checkbox().should('not.be.checked');

      // MIA
      dashboard.filters.panel.form.submissionType.MIA.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
      dashboard.filters.panel.form.submissionType.MIA.checkbox().should('exist');
      dashboard.filters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');

      // MIN
      dashboard.filters.panel.form.submissionType.MIN.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIN);
      dashboard.filters.panel.form.submissionType.MIN.checkbox().should('exist');
      dashboard.filters.panel.form.submissionType.MIN.checkbox().should('not.be.checked');
    });

    it('status', () => {
      // all statuses
      dashboard.filters.panel.form.status.all.label().contains('All statuses');
      dashboard.filters.panel.form.status.all.checkbox().should('exist');
      dashboard.filters.panel.form.status.all.checkbox();

      // draft
      dashboard.filters.panel.form.status.draft.label().contains(CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
      dashboard.filters.panel.form.status.draft.checkbox().should('exist');
      dashboard.filters.panel.form.status.draft.checkbox().should('not.be.checked');

      // ready for checker
      dashboard.filters.panel.form.status.readyForChecker.label().contains(CONSTANTS.DEALS.DEAL_STATUS.READY_FOR_APPROVAL);
      dashboard.filters.panel.form.status.readyForChecker.checkbox().should('exist');
      dashboard.filters.panel.form.status.readyForChecker.checkbox().should('not.be.checked');

      // maker's input required
      dashboard.filters.panel.form.status.makerInputRequired.label().contains(CONSTANTS.DEALS.DEAL_STATUS.CHANGES_REQUIRED);
      dashboard.filters.panel.form.status.makerInputRequired.checkbox().should('exist');
      dashboard.filters.panel.form.status.makerInputRequired.checkbox().should('not.be.checked');

      // submitted
      dashboard.filters.panel.form.status.submitted.label().contains(CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF);
      dashboard.filters.panel.form.status.submitted.checkbox().should('exist');
      dashboard.filters.panel.form.status.submitted.checkbox().should('not.be.checked');

      // acknowledged by UKEF
      dashboard.filters.panel.form.status.acknowledgedByUKEF.label().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
      dashboard.filters.panel.form.status.acknowledgedByUKEF.checkbox().should('exist');
      dashboard.filters.panel.form.status.acknowledgedByUKEF.checkbox().should('not.be.checked');

      // in progress by UKEF
      dashboard.filters.panel.form.status.inProgressByUKEF.label().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_IN_PROGRESS);
      dashboard.filters.panel.form.status.inProgressByUKEF.checkbox().should('exist');
      dashboard.filters.panel.form.status.inProgressByUKEF.checkbox().should('not.be.checked');

      // acccepted by UKEF (with conditions)
      dashboard.filters.panel.form.status.acceptedByUKEFWithConditions.label().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS);
      dashboard.filters.panel.form.status.acceptedByUKEFWithConditions.checkbox().should('exist');
      dashboard.filters.panel.form.status.acceptedByUKEFWithConditions.checkbox().should('not.be.checked');

      // acccepted by UKEF (without conditions)
      dashboard.filters.panel.form.status.acceptedByUKEFWithoutConditions.label().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS);
      dashboard.filters.panel.form.status.acceptedByUKEFWithoutConditions.checkbox().should('exist');
      dashboard.filters.panel.form.status.acceptedByUKEFWithoutConditions.checkbox().should('not.be.checked');

      // rejected by UKEF
      dashboard.filters.panel.form.status.rejectedByUKEF.label().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_REFUSED);
      dashboard.filters.panel.form.status.rejectedByUKEF.checkbox().should('exist');
      dashboard.filters.panel.form.status.rejectedByUKEF.checkbox().should('not.be.checked');

      // abandoned
      dashboard.filters.panel.form.status.abandoned.label().contains(CONSTANTS.DEALS.DEAL_STATUS.ABANDONED);
      dashboard.filters.panel.form.status.abandoned.checkbox().should('exist');
      dashboard.filters.panel.form.status.abandoned.checkbox().should('not.be.checked');
    });
  });
});
