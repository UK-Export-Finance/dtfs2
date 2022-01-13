const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

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
      dashboard.filtersContainer().should('not.be.visible');

      dashboard.filtersShowHideButton().should('be.visible');
      dashboard.filtersShowHideButton().should('have.text', 'Show filter');
    });
  });

  describe('clicking `show filter` button', () => {
    it('renders all filters container', () => {
      dashboard.filtersShowHideButton().click();

      dashboard.filtersContainer().should('be.visible');
    });

    it('changes show/hide button text', () => {
      dashboard.filtersShowHideButton().should('be.visible');
      dashboard.filtersShowHideButton().should('have.text', 'Hide filter');
    });

    it('renders `apply filters` button', () => {
      dashboard.filtersApplyFiltersButton().should('be.visible');
      dashboard.filtersApplyFiltersButton().contains('Apply filters');
    });
  });

  describe('renders all filters empty/unchecked by default', () => {
    it('keyword', () => {
      dashboard.filterLabelKeyword().contains('Keyword');
      dashboard.filterInputKeyword().should('be.visible');
      dashboard.filterInputKeyword().should('have.value', '');
    });

    it('product/dealType', () => {
      dashboard.filterLabelDealTypeBssEwcs().contains(CONSTANTS.DEALS.DEAL_TYPE.BSS_EWCS);
      dashboard.filterCheckboxDealTypeBssEwcs().should('exist');
      dashboard.filterCheckboxDealTypeBssEwcs().should('not.be.checked');

      dashboard.filterLabelDealTypeGef().contains(CONSTANTS.DEALS.DEAL_TYPE.GEF);
      dashboard.filterCheckboxDealTypeGef().should('exist');
      dashboard.filterCheckboxDealTypeGef().should('not.be.checked');
    });

    it('submissionType/notice type', () => {
      // AIN
      dashboard.filterLabelSubmissionTypeAIN().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.AIN);
      dashboard.filterCheckboxSubmissionTypeAIN().should('exist');
      dashboard.filterCheckboxSubmissionTypeAIN().should('not.be.checked');

      // MIA
      dashboard.filterLabelSubmissionTypeMIA().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
      dashboard.filterCheckboxSubmissionTypeMIA().should('exist');
      dashboard.filterCheckboxSubmissionTypeMIA().should('not.be.checked');

      // MIN
      dashboard.filterLabelSubmissionTypeMIN().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIN);
      dashboard.filterCheckboxSubmissionTypeMIN().should('exist');
      dashboard.filterCheckboxSubmissionTypeMIN().should('not.be.checked');
    });

    it('status', () => {
      // status - all statuses
      dashboard.filterLabelStatusAllStatuses().contains('All statuses');
      dashboard.filterCheckboxStatusAllStatuses().should('exist');
      dashboard.filterCheckboxStatusAllStatuses()

      // draft
      dashboard.filterLabelStatusDraft().contains(CONSTANTS.DEALS.DEAL_STATUS.DRAFT);
      dashboard.filterCheckboxStatusDraft().should('exist');
      dashboard.filterCheckboxStatusDraft().should('not.be.checked');

      // ready for checker
      dashboard.filterLabelStatusReadyForChecker().contains(CONSTANTS.DEALS.DEAL_STATUS.BANK_CHECK);
      dashboard.filterCheckboxStatusReadyForChecker().should('exist');
      dashboard.filterCheckboxStatusReadyForChecker().should('not.be.checked');

      // maker's input required
      dashboard.filterLabelStatusMakerInputRequired().contains(CONSTANTS.DEALS.DEAL_STATUS.CHANGES_REQUIRED);
      dashboard.filterCheckboxStatusMakerInputRequired().should('exist');
      dashboard.filterCheckboxStatusMakerInputRequired().should('not.be.checked');

      // submitted
      dashboard.filterLabelStatusSubmitted().contains(CONSTANTS.DEALS.DEAL_STATUS.SUBMITTED_TO_UKEF);
      dashboard.filterCheckboxStatusSubmitted().should('exist');
      dashboard.filterCheckboxStatusSubmitted().should('not.be.checked');

      // acknowledged by UKEF
      dashboard.filterLabelStatusAcknowledgedByUKEF().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_ACKNOWLEDGED);
      dashboard.filterCheckboxStatusAcknowledgedByUKEF().should('exist');
      dashboard.filterCheckboxStatusAcknowledgedByUKEF().should('not.be.checked');

      // in progress by UKEF
      dashboard.filterLabelStatusInProgressByUKEF().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_IN_PROGRESS);
      dashboard.filterCheckboxStatusInProgressByUKEF().should('exist');
      dashboard.filterCheckboxStatusInProgressByUKEF().should('not.be.checked');

      // acccepted by UKEF (with conditions)
      dashboard.filterLabelStatusAcceptedByUKEFWithConditions().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS);
      dashboard.filterCheckboxStatusAcceptedByUKEFWithConditions().should('exist');
      dashboard.filterCheckboxStatusAcceptedByUKEFWithConditions().should('not.be.checked');

      // acccepted by UKEF (without conditions)
      dashboard.filterLabelStatusAcceptedByUKEFWithoutConditions().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS);
      dashboard.filterCheckboxStatusAcceptedByUKEFWithoutConditions().should('exist');
      dashboard.filterCheckboxStatusAcceptedByUKEFWithoutConditions().should('not.be.checked');

      // rejected by UKEF
      dashboard.filterLabelStatusRejectedByUKEF().contains(CONSTANTS.DEALS.DEAL_STATUS.UKEF_REFUSED);
      dashboard.filterCheckboxStatusRejectedByUKEF().should('exist');
      dashboard.filterCheckboxStatusRejectedByUKEF().should('not.be.checked');

      // abandoned
      dashboard.filterLabelStatusAbandoned().contains(CONSTANTS.DEALS.DEAL_STATUS.ABANDONED);
      dashboard.filterCheckboxStatusAbandoned().should('exist');
      dashboard.filterCheckboxStatusAbandoned().should('not.be.checked');
    });
  });
});
