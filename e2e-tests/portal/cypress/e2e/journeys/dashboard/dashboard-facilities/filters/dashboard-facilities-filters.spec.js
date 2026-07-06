const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const CONSTANTS = require('../../../../../fixtures/constants');
const { dashboardFacilities } = require('../../../../pages');
const { dashboardFilters, dashboardSubNavigation } = require('../../../../partials');
const { GEF_DEAL_DRAFT, GEF_FACILITY_CASH, GEF_FACILITY_CONTINGENT } = require('../../fixtures');

const { BANK1_MAKER1, BANK1_CHECKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Facilities filters', () => {
  const ALL_FACILITIES = [];

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.createBssEwcsDeal();

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
    it('should render all facilities (Checker)', () => {
      cy.login(BANK1_CHECKER1);
      dashboardFacilities.visit();
      dashboardFacilities.rows().should('be.visible');
      dashboardFacilities.row.nameText(ALL_FACILITIES[0]._id).should('exist');
      dashboardFacilities.row.nameText(ALL_FACILITIES[1]._id).should('exist');
      dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
    });

    it('should render all facilities (Maker)', () => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      dashboardFacilities.rows().should('be.visible');
      dashboardFacilities.row.nameLink(ALL_FACILITIES[0]._id).should('exist');
      dashboardFacilities.row.nameLink(ALL_FACILITIES[1]._id).should('exist');
      dashboardFacilities.rows().should('have.length', ALL_FACILITIES.length);
    });

    it('should hide filters and render `show filter` button', () => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();

      filters.panel.container().should('not.be.visible');

      filters.showHideButton().should('be.visible');
      filters.showHideButton().should('have.text', 'Show filter');
    });
  });

  describe('clicking `show filter` button', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
    });

    beforeEach(() => {
      cy.saveSession();
      dashboardFacilities.visit();

      filters.showHideButton().click();
    });

    it('should render all filters container', () => {
      filters.panel.container().should('be.visible');
    });

    it('should change show/hide button text', () => {
      filters.showHideButton().should('be.visible');
      filters.showHideButton().should('have.text', 'Hide filter');
    });

    it('should render `apply filters` button', () => {
      filters.panel.form.applyFiltersButton().should('be.visible');
      filters.panel.form.applyFiltersButton().contains('Apply filters');
    });

    it('should keep focus on the show/hide toggle button after activation', () => {
      filters.showHideButton().should('have.focus');
    });

    it('should expose `aria-controls` pointing at the filter panel', () => {
      filters
        .showHideButton()
        .invoke('attr', 'aria-controls')
        .then((ariaControls) => {
          expect(ariaControls).to.be.a('string').and.have.length.greaterThan(0);

          filters.panel.container().should('have.attr', 'id', ariaControls);
        });
    });
  });

  describe('keyboard Tab order across the filter panel', () => {
    const TAB_KEYDOWN = { key: 'Tab', code: 'Tab', which: 9, keyCode: 9, bubbles: true };
    const SHIFT_TAB_KEYDOWN = { ...TAB_KEYDOWN, shiftKey: true };

    const panelFocusables = () =>
      filters.panel
        .container()
        .find(
          'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )
        .filter(':visible');

    before(() => {
      cy.login(BANK1_MAKER1);
    });

    beforeEach(() => {
      cy.saveSession();
      dashboardFacilities.visit();

      filters.showHideButton().click();
      filters.showHideButton().should('have.focus');
    });

    it('should move focus into the filter panel on Tab from the Hide filter button', () => {
      filters.showHideButton().should('have.attr', 'aria-expanded', 'true');
      filters.showHideButton().trigger('keydown', TAB_KEYDOWN);

      filters.panel.container().then(($panel) => {
        cy.focused().then(($focused) => {
          expect($panel[0].contains($focused[0])).to.equal(true);
        });
      });
    });

    it('should return focus to the Hide filter button on Shift+Tab from the focused filter control', () => {
      filters.showHideButton().should('have.attr', 'aria-expanded', 'true');
      filters.showHideButton().trigger('keydown', TAB_KEYDOWN);
      cy.focused().trigger('keydown', SHIFT_TAB_KEYDOWN);

      filters.showHideButton().should('have.focus');
    });

    it('should cycle focus back to the Created by you filter on Tab from the last filter control', () => {
      panelFocusables().last().focus();
      cy.focused().tab();

      dashboardFacilities.filters.panel.form.createdByYou.checkbox().should('have.focus');
    });

    it('should return focus to the last filter control on Shift+Tab from the element after the toggle', () => {
      panelFocusables().last().as('lastInPanel').focus();
      cy.focused().tab();
      cy.focused().tab({ shift: true });

      cy.get('@lastInPanel').should('have.focus');
    });
  });

  describe('renders all filters empty/unchecked by default', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
    });

    beforeEach(() => {
      cy.saveSession();
      dashboardFacilities.visit();

      filters.showHideButton().click();
    });

    it('should render keyword filter', () => {
      filters.panel.form.keyword.label().contains('Keyword');
      filters.panel.form.keyword.input().should('be.visible');
      filters.panel.form.keyword.input().should('have.value', '');
    });

    it('should render product/facility type', () => {
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

    it('should render submissionType/notice type', () => {
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

    it('should render bank facility stage/hasBeenIssued', () => {
      // Issued
      dashboardFacilities.filters.panel.form.stage.issued.label().contains(CONSTANTS.FACILITY.FACILITY_STAGE.ISSUED);
      dashboardFacilities.filters.panel.form.stage.issued.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.stage.issued.checkbox().should('not.be.checked');

      // Unissued
      dashboardFacilities.filters.panel.form.stage.unissued.label().contains(CONSTANTS.FACILITY.FACILITY_STAGE.UNISSUED);
      dashboardFacilities.filters.panel.form.stage.unissued.checkbox().should('exist');
      dashboardFacilities.filters.panel.form.stage.unissued.checkbox().should('not.be.checked');
    });

    it('should contain the correct aria-label for no facility filters selected', () => {
      dashboardSubNavigation
        .facilities()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal('facilities: ,Filters selected: none');
        });

      dashboardSubNavigation
        .deals()
        .invoke('attr', 'aria-label')
        .then((label) => {
          expect(label).to.equal('');
        });
    });
  });
});
