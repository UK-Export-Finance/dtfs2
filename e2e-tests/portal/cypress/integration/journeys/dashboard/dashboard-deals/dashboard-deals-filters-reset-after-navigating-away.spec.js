const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');
const CONSTANTS = require('../../../../fixtures/constants');
const { header, dashboard } = require('../../../pages');
const { BSS_DEAL_MIA } = require('./fixtures');

const BANK1_MAKER1 = mockUsers.find((user) => (user.roles.includes('maker')));

context('Dashboard Deals filters - reset after applying and navigating away', () => {
  const ALL_DEALS = [];

  before(() => {
    cy.deleteGefApplications(BANK1_MAKER1);
    cy.deleteDeals(BANK1_MAKER1);

    cy.insertOneDeal(BSS_DEAL_MIA, BANK1_MAKER1);
  });

  before(() => {
    cy.login(BANK1_MAKER1);
    dashboard.visit();
    cy.url().should('eq', relative('/dashboard/deals/0'));
  });

  it('resets filters after navigating away from the dashboard', () => {
    // toggle to show filters (hidden by default)
    dashboard.filters.showHideButton().click();

    // apply filter 1
    dashboard.filters.panel.form.status.draft.checkbox().click();

    // apply filter 2
    dashboard.filters.panel.form.submissionType.MIA.checkbox().click();

    // submit filters
    dashboard.filters.panel.form.applyFiltersButton().click();

    cy.url().should('eq', relative('/dashboard/deals/0'));

    // check the filters are applied
    dashboard.filters.showHideButton().click();

    dashboard.filters.panel.form.status.draft.checkbox().should('be.checked');
    dashboard.filters.panel.form.submissionType.MIA.checkbox().should('be.checked');

    // navigate somewhere else
    cy.visit('/dashboard/facilities/gef');
    cy.url().should('eq', relative('/dashboard/facilities/gef'));

    // go back to dashboard
    header.dashboard().click();
    cy.url().should('eq', relative('/dashboard/deals/0'));

    // previously applied filters should not be applied
    dashboard.filters.panel.form.status.draft.checkbox().should('not.be.checked');
    dashboard.filters.panel.form.submissionType.MIA.checkbox().should('not.be.checked');
  });
});
