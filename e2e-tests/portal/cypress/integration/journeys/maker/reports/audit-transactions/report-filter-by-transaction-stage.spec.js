const { reports: { auditTransactionsReport } } = require('../../../../pages');
const transactionTestData = require('../../../../../fixtures/transaction-dashboard-data');
const mockUsers = require('../../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && !user.roles.includes('admin')));

context('Audit - Transactions Report', () => {
  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertManyDeals(transactionTestData.all, MAKER_LOGIN);
  });

  it('can be filtered by transaction stage', () => {
    cy.login(MAKER_LOGIN);
    auditTransactionsReport.visit();

    auditTransactionsReport.filterByFacilityStage().select('all');
    auditTransactionsReport.applyFilters().click();

    auditTransactionsReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(44 items)');
    });

    auditTransactionsReport.filterByFacilityStage().should('have.value', 'all');

    // select the filter option
    auditTransactionsReport.filterByFacilityStage().select('unissued_conditional');
    auditTransactionsReport.applyFilters().click();

    // we should see at least one loan and at least one bond in the correct state, and none in an incorrect state..
    auditTransactionsReport.facilityStage().should((stage) => { expect(stage).not.to.contain('Issued'); });
    auditTransactionsReport.facilityStage().should((stage) => { expect(stage).not.to.contain('Unconditional'); });
    auditTransactionsReport.facilityStage().should((stage) => { expect(stage).to.contain('Unissued'); });
    auditTransactionsReport.facilityStage().should((stage) => { expect(stage).to.contain('Conditional'); });

    // confirm the filter retains its state
    auditTransactionsReport.filterByFacilityStage().should('have.value', 'unissued_conditional');


    // select the filter option
    auditTransactionsReport.filterByFacilityStage().select('issued_unconditional');
    auditTransactionsReport.applyFilters().click();

    // we should see at least one loan and at least one bond in the correct state, and none in an incorrect state..
    auditTransactionsReport.facilityStage().should((stage) => { expect(stage).not.to.contain('Unissued'); });
    auditTransactionsReport.facilityStage().should((stage) => { expect(stage).not.to.contain('Conditional'); });
    auditTransactionsReport.facilityStage().should((stage) => { expect(stage).to.contain('Issued'); });
    auditTransactionsReport.facilityStage().should((stage) => { expect(stage).to.contain('Unconditional'); });

    // confirm the filter retains its state
    auditTransactionsReport.filterByFacilityStage().should('have.value', 'issued_unconditional');
  });
});
