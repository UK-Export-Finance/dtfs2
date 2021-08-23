const { reports, defaults } = require('../../../../pages');

const { auditSupplyContracts } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');

const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));

// test data we want to set up + work with..
const dashboardTestData = require('../../../../../fixtures/deal-dashboard-data');

context('Audit - Report', () => {
  let deals;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(ADMIN_LOGIN);
    cy.insertManyDeals(dashboardTestData, ADMIN_LOGIN)
      .then((insertedDeals) => deals = insertedDeals);
  });

  it('can be filtered by transaction stage', () => {
    cy.login(ADMIN_LOGIN);
    auditSupplyContracts.visit();

    auditSupplyContracts.filterByStatus().select('all');
    auditSupplyContracts.applyFilters().click();

    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    auditSupplyContracts.filterByStatus().should('have.value', 'all');

    // filter by draft
    auditSupplyContracts.filterByStatus().select('draft');
    auditSupplyContracts.applyFilters().click();
    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(6 items)');
    });

    auditSupplyContracts.status().should((status) => { expect(status).to.contain('Draft'); });
    auditSupplyContracts.status().should((status) => { expect(status).not.to.contain("Ready for Checker's approval"); });
    auditSupplyContracts.status().should((status) => { expect(status).not.to.contain("Further Maker's input required"); });
    auditSupplyContracts.status().should((status) => { expect(status).not.to.contain('Abandoned'); });
    auditSupplyContracts.status().should((status) => { expect(status).not.to.contain('Submitted'); });
    auditSupplyContracts.status().should((status) => { expect(status).not.to.contain('Acknowledged by UKEF'); });
    auditSupplyContracts.status().should((status) => { expect(status).not.to.contain('Accepted by UKEF (without conditions)'); });
    auditSupplyContracts.status().should((status) => { expect(status).not.to.contain('Accepted by UKEF (with conditions)'); });
    auditSupplyContracts.status().should((status) => { expect(status).not.to.contain('Rejected by UKEF'); });

    // can repeat this for other filters but not obvious how much value that brings
    //  i guess it proves we have all the right options as per the ACs... but not obvious it brings that much value..
  });
});
