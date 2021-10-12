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
          details: {
            submissionDate: toBigNumber('2020-01-01'),
            status: 'Submitted',
          },
        };
        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithOneLoan, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber('2020-01-03'),
            status: 'Submitted',
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber('2020-01-05'),
            status: 'Submitted',
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithTenBonds, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber('2020-01-07'),
            status: 'Submitted',
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithTenLoans, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber('2020-01-09'),
            status: 'Submitted',
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithTenLoansAndTenBonds, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          details: {
            submissionDate: toBigNumber('2020-01-11'),
            status: 'Submitted',
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });
  });

  it('can be filtered by bank supply contract id', () => {
    cy.login(ADMIN_LOGIN);
    reconciliationReport.visit();

    reconciliationReport.filterByBankSupplyContractId().type('{selectall}{backspace}');
    reconciliationReport.applyFilters().click();
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(6 items)');
    });

    reconciliationReport.filterByBankSupplyContractId().type('{selectall}{backspace}adealwithone');
    reconciliationReport.applyFilters().click();
    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(3 items)');
    });
  });
});
