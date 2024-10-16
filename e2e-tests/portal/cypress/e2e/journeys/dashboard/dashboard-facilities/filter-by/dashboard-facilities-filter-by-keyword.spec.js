const relative = require('../../../../relativeURL');
const MOCK_USERS = require('../../../../../../../e2e-fixtures');
const { dashboardFacilities } = require('../../../../pages');
const { dashboardFilters } = require('../../../../partials');
const { BSS_DEAL_AIN, BSS_FACILITY_BOND_ISSUED, BSS_FACILITY_BOND_UNISSUED } = require('../../fixtures');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

const filters = dashboardFilters;

context('Dashboard Facilities filters - filter by keyword', () => {
  const MOCK_KEYWORD = 'Special facility';

  const ALL_FACILITIES = [];

  const BSS_FACILITY_SPECIAL_NAME = {
    ...BSS_FACILITY_BOND_ISSUED,
    name: MOCK_KEYWORD,
  };

  before(() => {
    cy.deleteGefApplications(ADMIN);
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(BSS_DEAL_AIN, BANK1_MAKER1).then((deal) => {
      const dealId = deal._id;

      const facilities = [BSS_FACILITY_SPECIAL_NAME, BSS_FACILITY_BOND_UNISSUED];

      cy.createFacilities(dealId, facilities, BANK1_MAKER1).then((insertedFacilities) => {
        insertedFacilities.forEach((facility) => {
          ALL_FACILITIES.push(facility);
        });
      });
    });
  });

  describe('Keyword', () => {
    before(() => {
      cy.login(BANK1_MAKER1);
      dashboardFacilities.visit();
      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    beforeEach(() => {
      cy.saveSession();
      dashboardFacilities.visit();

      // toggle to show filters (hidden by default)
      filters.showHideButton().click();
    });

    it('submits the filter and redirects to the dashboard', () => {
      // apply filter
      cy.keyboardInput(filters.panel.form.keyword.input(), MOCK_KEYWORD);
      filters.panel.form.applyFiltersButton().click();

      cy.url().should('eq', relative('/dashboard/facilities/0'));
    });

    it('renders submitted keyword', () => {
      // apply filter
      cy.keyboardInput(filters.panel.form.keyword.input(), MOCK_KEYWORD);
      filters.panel.form.keyword.input().should('have.value', MOCK_KEYWORD);
    });

    it('renders the applied keyword in the `applied filters` section', () => {
      // apply filter
      cy.keyboardInput(filters.panel.form.keyword.input(), MOCK_KEYWORD);
      filters.panel.form.applyFiltersButton().click();

      // toggle to show filters (hidden by default)
      filters.showHideButton().click();

      filters.panel.selectedFilters.container().should('be.visible');
      filters.panel.selectedFilters.list().should('be.visible');

      const firstAppliedFilterHeading = filters.panel.selectedFilters.heading().first();

      firstAppliedFilterHeading.should('be.visible');
      firstAppliedFilterHeading.should('have.text', 'Keyword');

      const firstAppliedFilter = filters.panel.selectedFilters.listItem().first();

      firstAppliedFilter.should('be.visible');

      const expectedText = `Remove this filter ${MOCK_KEYWORD}`;
      firstAppliedFilter.should('have.text', expectedText);
    });

    it('renders the applied keyword in the `main container selected filters` section', () => {
      // apply filter
      cy.keyboardInput(filters.panel.form.keyword.input(), MOCK_KEYWORD);
      filters.panel.form.applyFiltersButton().click();

      // toggle to show filters (hidden by default)
      filters.showHideButton().click();

      filters.mainContainer.selectedFilters.keyword(MOCK_KEYWORD).should('be.visible');

      const expectedText = `Remove this filter ${MOCK_KEYWORD}`;
      filters.mainContainer.selectedFilters.keyword(MOCK_KEYWORD).contains(expectedText);
    });

    it(`renders only facilities that have ${MOCK_KEYWORD} in a field`, () => {
      // apply filter
      cy.keyboardInput(filters.panel.form.keyword.input(), MOCK_KEYWORD);
      filters.panel.form.applyFiltersButton().click();

      // toggle to show filters (hidden by default)
      filters.showHideButton().click();

      const ALL_KEYWORD_FACILITIES = ALL_FACILITIES.filter(({ name }) => name === MOCK_KEYWORD);
      dashboardFacilities.rows().should('have.length', ALL_KEYWORD_FACILITIES.length);

      const firstDraftDeal = ALL_KEYWORD_FACILITIES[0];

      dashboardFacilities.row.nameLink(firstDraftDeal._id).contains(MOCK_KEYWORD);
    });
  });
});
