const { reports: { reconciliationReport } } = require('../../../../pages');
const mockUsers = require('../../../../../fixtures/mockUsers');

const ADMIN_LOGIN = mockUsers.find((user) => (user.roles.includes('admin')));
const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && !user.roles.includes('admin')));

const nowMinus = (minutes) => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - minutes);
  return date.valueOf().toString();
};

const {
  aDealWithOneBond,
  aDealWithOneLoan,
  aDealWithOneLoanAndOneBond,
} = require('../../../../../fixtures/transaction-dashboard-data');

context('reconciliation report', () => {
  before(() => {
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(aDealWithOneBond, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          status: 'Submitted',
          details: {
            submissionDate: nowMinus(100),
          },
        };
        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithOneLoan, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          status: 'Submitted',
          details: {
            submissionDate: nowMinus(118),
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });

    cy.insertOneDeal(aDealWithOneLoanAndOneBond, MAKER_LOGIN)
      .then((inserted) => {
        const update = {
          status: 'Submitted',
          details: {
            submissionDate: nowMinus(121),
          },
        };

        cy.updateDeal(inserted._id, update, MAKER_LOGIN);
      });
  });

  it('should not show deals submitted within the last 2 hours', () => {
    cy.login(ADMIN_LOGIN);
    reconciliationReport.visit();

    reconciliationReport.totalItems().invoke('text').then((text) => {
      expect(text.trim()).equal('(1 items)');
    });
  });
});
