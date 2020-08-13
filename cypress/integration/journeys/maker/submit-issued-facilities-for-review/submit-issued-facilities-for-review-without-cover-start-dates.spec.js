const moment = require('moment');
const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const mockUsers = require('../../../../fixtures/mockUsers');
const {
  fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate,
  ISSUED_BOND_DATE_VALUE,
} = require('./fillAndSubmitIssueBondFacilityForm');
const {
  fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate,
  ISSUED_LOAN_DATE_VALUE,
} = require('./fillAndSubmitIssueLoanFacilityForm');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'Barclays Bank'));

context('Maker fills in bond & loan issue facility forms without requested cover start date and submits the deal for checker review', () => {
  let deal;
  let dealId;

  beforeEach(() => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  before(() => {
    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id; // eslint-disable-line no-underscore-dangle
      });
  });

  it('defaults the submitted facilities requested cover start dates to the previously entered issue date', () => {
    cy.login({ ...MAKER_LOGIN });
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('be.disabled');

    const bondId = deal.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const bondRow = pages.contract.bondTransactionsTable.row(bondId);

    bondRow.issueFacilityLink().click();

    fillAndSubmitIssueBondFacilityFormWithoutRequestedCoverStartDate();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    const loanId = deal.loanTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.issueFacilityLink().click();

    fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    // submit deal for review
    pages.contract.proceedToReview().click();

    pages.contractReadyForReview.comments().type('Issued facilities');
    pages.contractReadyForReview.readyForCheckersApproval().click();

    // expect to land on the /dashboard page
    cy.url().should('include', '/dashboard');

    pages.contract.visit(deal);

    // expect bond requested cover start date to default to issued date
    bondRow.requestedCoverStartDate().invoke('text').then((text) => {
      const expected = moment(ISSUED_BOND_DATE_VALUE).format('DD/MM/YYYY');
      expect(text.trim()).to.equal(expected);
    });

    // expect loan requested cover start date to default to issued date
    loanRow.requestedCoverStartDate().invoke('text').then((text) => {
      const expected = moment(ISSUED_LOAN_DATE_VALUE).format('DD/MM/YYYY');
      expect(text.trim()).to.equal(expected);
    });
  });
});
