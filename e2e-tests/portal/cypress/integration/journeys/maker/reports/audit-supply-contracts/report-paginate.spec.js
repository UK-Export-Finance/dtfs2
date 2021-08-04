const { reports } = require('../../../../pages');
const { auditSupplyContracts } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const BANK_MAKER_1 = mockUsers.find(user => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));

const { aDealWithOneLoan } = require('../../../../../fixtures/transaction-dashboard-data');

context('Audit - Report', () => {
  const submittedDeals = [];

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(BANK_MAKER_1);

    const twentyTwoDeals = Array.from({ length: 21 }, () => (aDealWithOneLoan));

    cy.insertManyDeals(twentyTwoDeals, BANK_MAKER_1)
      .then((insertedDeals) => submittedDeals.push(insertedDeals));
  });

  describe('when applying a filter on a results page that is not the first page', () => {
    it('should redirect to the first page', () => {
      cy.login(BANK_MAKER_1);
      auditSupplyContracts.visit();

      cy.url().should('eq', relative('/reports/audit-supply-contracts/0'));

      auditSupplyContracts.next().click();
      cy.url().should('eq', relative('/reports/audit-supply-contracts/1'));

      auditSupplyContracts.filterByStatus().select('DRAFT');
      auditSupplyContracts.applyFilters().click();
      cy.url().should('eq', relative('/reports/audit-supply-contracts/0'));
    });
  });
});
