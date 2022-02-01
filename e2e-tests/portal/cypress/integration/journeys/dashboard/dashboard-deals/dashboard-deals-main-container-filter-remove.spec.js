const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { dashboard } = require('../../../pages');
const {
  BSS_DEAL_DRAFT,
  GEF_DEAL_DRAFT,
} = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker') && user.username === 'BANK1_MAKER1'));

context('Dashboard Deals - main container selected filters - remove a filter', () => {
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

    cy.login(BANK1_MAKER1);
    dashboard.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('applies and removes a filter', () => {
    // toggle to show filters (hidden by default)
    dashboard.filters.showHideButton().click();

    // apply filter
    dashboard.filters.panel.form.submissionType.MIA.checkbox().click();
    dashboard.filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // check the filter is in the applied filters section
    dashboard.filters.mainContainer.selectedFilters.noticeMIA().should('be.visible');

    // click remove button
    dashboard.filters.mainContainer.selectedFilters.noticeMIA().click();

    // should be redirected
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // should have empty applied filter
    dashboard.filters.mainContainer.selectedFilters.noticeMIA().should('not.exist');

    // checkbox should be NOT be checked
    dashboard.filters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');

    // should render all deals
    dashboard.rows().should('have.length', ALL_DEALS.length);
  });

  it('retains other filters when one is removed', () => {
    cy.login(BANK1_MAKER1);
    dashboard.visit();

    // toggle to show filters (hidden by default)
    dashboard.filters.showHideButton().click();

    // apply filters
    dashboard.filters.panel.form.status.draft.checkbox().click();
    dashboard.filters.panel.form.submissionType.MIA.checkbox().click();
    dashboard.filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // remove one of the filters
    dashboard.filters.mainContainer.selectedFilters.statusDraft().click();

    // should have removed the filter
    dashboard.filters.mainContainer.selectedFilters.statusDraft().should('not.exist');

    // should NOT have removed the other filter
    dashboard.filters.mainContainer.selectedFilters.noticeMIA().should('exist');

    // toggle to show filters (hidden by default)
    dashboard.filters.showHideButton().click();

    // check checkboxes
    dashboard.filters.panel.form.status.draft.checkbox().should('not.be.checked');
    dashboard.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');
  });
});
