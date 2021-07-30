const { reports } = require('../../../../pages');
const { auditSupplyContracts } = reports;

const relative = require('../../../../relativeURL');

const mockUsers = require('../../../../../fixtures/mockUsers');
const BARCLAYS_LOGIN = mockUsers.find(user => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));
const hsbc_makers = mockUsers.filter(user => (user.roles.includes('maker') && user.bank.name === 'HSBC'));
const HSBC_MAKER_1 = hsbc_makers[0];
const HSBC_MAKER_2 = hsbc_makers[1];

const { aDealWithOneLoan } = require('../../../../../fixtures/transaction-dashboard-data');

context('Audit - Report', () => {
  // let barclaysDeals, hsbcDeals = [];
  let hsbcDeals = [

  ];

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.deleteDeals(BARCLAYS_LOGIN);
    cy.deleteDeals(HSBC_MAKER_1);
    cy.deleteDeals(HSBC_MAKER_2);

    const twentyTwoHsbcDeals = Array.from({ length: 21 }, () => (aDealWithOneLoan));

    cy.insertManyDeals(twentyTwoHsbcDeals, HSBC_MAKER_1)
      .then((insertedDeals) => hsbcDeals.push(insertedDeals));
  });

  describe('when applying a filter on a results page that is not the first page', () => {
    it('should redirect to the first page', () => {
      cy.login(HSBC_MAKER_1);
      auditSupplyContracts.visit();

      cy.url().should('eq', relative('/reports/audit-supply-contracts/0'));

      auditSupplyContracts.next().click();
      cy.url().should('eq', relative('/reports/audit-supply-contracts/1'));

      auditSupplyContracts.filterByStatus().select('Draft');
      auditSupplyContracts.applyFilters().click();
      cy.url().should('eq', relative('/reports/audit-supply-contracts/0'));
    });
  });
});
