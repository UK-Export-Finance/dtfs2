const MOCK_USERS = require('../../../../fixtures/users');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboardFacilities } = require('../../../pages');
const { dashboardFilters, dashboardSubNavigation } = require('../../../partials');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
  GEF_FACILITY_CASH,
  GEF_FACILITY_CONTINGENT,
} = require('../fixtures');

const { BANK1_MAKER1, BANK1_CHECKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Deals filters', () => {
  const ALL_FACILITIES = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_DRAFT, BANK1_MAKER1);

    cy.insertOneGefApplication(GEF_DEAL_DRAFT, BANK1_MAKER1).then((deal) => {
      const { _id: dealId } = deal;

      const facilities = [
        { ...GEF_FACILITY_CASH, dealId, name: 'Cash Facility name' },
        { ...GEF_FACILITY_CONTINGENT, dealId, name: 'Contingent Facility name' },
      ];

      cy.insertManyGefFacilities(facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility.details);
        });
      });
    });
  });

  describe('by default', () => {
    it('renders all facilities (Checker)', () => {
      cy.login(BANK1_CHECKER1);
      dashboardFacilities.visit();
      dashboardFacilities.rows().should('be.visible');
      dashboardFacilities.row.nameText(ALL_FACILITIES[0]._id).should('exist');
      dashboardFacilities.row.nameText(ALL_FACILITIES[1]._id).should('exist');
      dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
    });
    it('renders all facilities (Maker)', () => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      dashboardFacilities.rows().should('be.visible');
      dashboardFacilities.row.nameLink(ALL_FACILITIES[0]._id).should('exist');
      dashboardFacilities.row.nameLink(ALL_FACILITIES[1]._id).should('exist');
      dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
    });

    it('renders all facilities (Admin)', () => {
      cy.login(ADMIN);
      dashboardFacilities.visit();
      dashboardFacilities.rows().should('be.visible');
      dashboardFacilities.row.nameLink(ALL_FACILITIES[0]._id).should('exist');
      dashboardFacilities.row.nameLink(ALL_FACILITIES[1]._id).should('exist');
      dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
    });

    it('hides filters and renders `show filter` button', () => {
      filters.panel.container().should('not.be.visible');

      filters.showHideButton().should('be.visible');
      filters.showHideButton().should('have.text', 'Show filter');
    });
  });

  describe('clicking `show filter` button', () => {
    it('renders all filters container', () => {
      filters.showHideButton().click();

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

    it('product/facility type', () => {
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
      dashboardFacilities.filters.panel.form.submissionType.AIN.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.AIN);
      dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.submissionType.AIN.checkbox().should('not.be.checked');

      // MIA
      dashboardFacilities.filters.panel.form.submissionType.MIA.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIA);
      dashboardFacilities.filters.panel.form.submissionType.MIA.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');

      // MIN
      dashboardFacilities.filters.panel.form.submissionType.MIN.label().contains(CONSTANTS.DEALS.SUBMISSION_TYPE.MIN);
      dashboardFacilities.filters.panel.form.submissionType.MIN.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.submissionType.MIN.checkbox().should('not.be.checked');
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

    it('contains the correct aria-label for no facility filters selected', () => {
      dashboardSubNavigation.facilities().invoke('attr', 'aria-label').then((label) => {
        expect(label).to.equal('facilities: ,Filters selected: none');
      });

      dashboardSubNavigation.deals().invoke('attr', 'aria-label').then((label) => {
        expect(label).to.equal('');
      });
    });
  });
});
