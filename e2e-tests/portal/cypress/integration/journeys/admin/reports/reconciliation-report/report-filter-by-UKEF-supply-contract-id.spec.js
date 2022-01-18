const { reports: { reconciliationReport } } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && !user.roles.includes('admin')));

const toBigNumber = (date) => new Date(date).valueOf().toString();

const {
  aDealWithOneBond,
  aDealWithOneLoan,
  aDealWithOneLoanAndOneBond,
  aDealWithTenBonds,
  aDealWithTenLoans,
  aDealWithTenLoansAndTenBonds,
} = require('../../../../../fixtures/transaction-dashboard-data');

context('reconciliation report', () => {
  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWithOneBond, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          status: 'Submitted',
          details: {
            submissionDate: toBigNumber('2020-01-01'),
          },
        };
        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithOneLoan, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          status: 'Submitted',
          details: {
            submissionDate: toBigNumber('2020-01-03'),
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          status: 'Submitted',
          details: {
            submissionDate: toBigNumber('2020-01-05'),
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithTenBonds, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          status: 'Submitted',
          details: {
            submissionDate: toBigNumber('2020-01-07'),
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithTenLoans, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          status: 'Submitted',
          details: {
            submissionDate: toBigNumber('2020-01-09'),
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithTenLoansAndTenBonds, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          status: 'Submitted',
          details: {
            submissionDate: toBigNumber('2020-01-11'),
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });
  });

  it('can be filtered by UKEF supply contract id', () => {
    cy.login(ADMIN_LOGIN);
    reconciliationReport.visit();

    reconciliationReport.filterByUKEFSupplyContractId().clear();
    reconciliationReport.applyFilters().click();
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(6 items)');
    });

    reconciliationReport.filterByUKEFSupplyContractId().clear().type('adealwithten');
    reconciliationReport.applyFilters().click();
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });
  });
});
