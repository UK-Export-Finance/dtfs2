const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters } = require('../../../partials');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
  GEF_FACILITY_CASH,
  GEF_FACILITY_CONTINGENT,
} = require('../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Dashboard Deals filters', () => {
  const ALL_FACILITIES = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      /// facility...
    });

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      const { _id: dealId } = deal;

      const facilities = [
        { ...GEF_FACILITY_CASH, dealId },
        { ...GEF_FACILITY_CONTINGENT, dealId } ,
      ];

      cy.insertManyGefFacilities(facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility.details);
        });
      });
    });
  });

  describe('by default', () => {
    it('renders all facilities', () => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();

      dashboardFacilities.rows().should('be.visible');
      dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
    });

    it('hides filters and renders `show filter` button', () => {
      dashboardFilters.panel.container().should('not.be.visible');

      dashboardFilters.showHideButton().should('be.visible');
      dashboardFilters.showHideButton().should('have.text', 'Show filter');
    });
  });

  describe('clicking `show filter` button', () => {
    it('renders all filters container', () => {
      dashboardFilters.showHideButton().click();

      dashboardFilters.panel.container().should('be.visible');
    });

    it('changes show/hide button text', () => {
      dashboardFilters.showHideButton().should('be.visible');
      dashboardFilters.showHideButton().should('have.text', 'Hide filter');
    });

    it('renders `apply filters` button', () => {
      dashboardFilters.panel.form.applyFiltersButton().should('be.visible');
      dashboardFilters.panel.form.applyFiltersButton().contains('Apply filters');
    });
  });

  describe('renders all filters empty/unchecked by default', () => {
    it('keyword', () => {
      dashboardFilters.panel.form.keyword.label().contains('Keyword');
      dashboardFilters.panel.form.keyword.input().should('be.visible');
      dashboardFilters.panel.form.keyword.input().should('have.value', '');
    });

    it('product/facility type', () => {
      // GEF
      dashboardFacilities.filters.panel.form.type.gef.label().contains(CONSTANTS.DEALS.DEAL_TYPE.GEF);
      dashboardFacilities.filters.panel.form.type.gef.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.type.gef.checkbox().should('not.be.checked');

      // Cash
      dashboardFacilities.filters.panel.form.type.cash.label().contains(CONSTANTS.FACILITY.FACILITY_TYPE.CASH);
      dashboardFacilities.filters.panel.form.type.cash.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.type.cash.checkbox().should('not.be.checked');

      // Contingent
      dashboardFacilities.filters.panel.form.type.contingent.label().contains(CONSTANTS.FACILITY.FACILITY_TYPE.CONTINGENT);
      dashboardFacilities.filters.panel.form.type.contingent.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.type.contingent.checkbox().should('not.be.checked');

      // Bond
      dashboardFacilities.filters.panel.form.type.bond.label().contains(CONSTANTS.FACILITY.FACILITY_TYPE.BOND);
      dashboardFacilities.filters.panel.form.type.bond.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.type.bond.checkbox().should('not.be.checked');

      // Loan
      dashboardFacilities.filters.panel.form.type.loan.label().contains(CONSTANTS.FACILITY.FACILITY_TYPE.LOAN);
      dashboardFacilities.filters.panel.form.type.loan.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.type.loan.checkbox().should('not.be.checked');
    });

    it('submissionType/notice type', () => {
      // AIN
      dashboardFilters.panel.form.submissionType.AIN.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.AIN);
      dashboardFilters.panel.form.submissionType.AIN.checkbox().should('exist');
      dashboardFilters.panel.form.submissionType.AIN.checkbox().should('not.be.checked');

      // MIA
      dashboardFilters.panel.form.submissionType.MIA.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
      dashboardFilters.panel.form.submissionType.MIA.checkbox().should('exist');
      dashboardFilters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');

      // MIN
      dashboardFilters.panel.form.submissionType.MIN.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIN);
      dashboardFilters.panel.form.submissionType.MIN.checkbox().should('exist');
      dashboardFilters.panel.form.submissionType.MIN.checkbox().should('not.be.checked');
    });

    it('bank facility stage/hasBeenIssued', () => {
      // Issued
      dashboardFacilities.filters.panel.form.hasBeenIssued.issued.label().contains(CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED);
      dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.hasBeenIssued.issued.checkbox().should('not.be.checked');

      // Unissued
      dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.label().contains(CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED);
      dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.hasBeenIssued.unissued.checkbox().should('not.be.checked');
    });
  });
});
