const { reports } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');
// test data we want to set up + work with..
const dashboardTestData = require('../../../../../fixtures/deal-dashboard-data');

const { auditSupplyContracts } = reports;

const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));

context('Audit - Report', () => {
  before(() => {
    cy.deleteGefApplications(ADMIN_LOGIN);
    cy.deleteDeals(ADMIN_LOGIN);

    cy.insertManyDeals(dashboardTestData, ADMIN_LOGIN);
  });

  it('can be filtered by transaction stage', () => {
    cy.login(ADMIN_LOGIN);
    auditSupplyContracts.visit();

    auditSupplyContracts.filterByStatus().select('ALL');
    auditSupplyContracts.applyFilters().click();

    auditSupplyContracts.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(21 items)');
    });

    auditSupplyContracts.filterByStatus().should('have.value', 'ALL');

    // filter by draft
    auditSupplyContracts.filterByStatus().select('DRAFT');
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
