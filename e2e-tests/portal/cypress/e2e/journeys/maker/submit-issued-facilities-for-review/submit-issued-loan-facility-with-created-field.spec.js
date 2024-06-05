const pages = require('../../../pages');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const { FACILITY } = require('../../../../fixtures/constants');
const dealWithNotStartedFacilityStatuses = require('./dealWithNotStartedFacilityStatuses');
const {
  fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate,
} = require('../fill-and-submit-issue-facility-form/fillAndSubmitIssueLoanFacilityForm');

const { BANK1_MAKER1 } = MOCK_USERS;

context('Issue Loan Form - Submit issued loan with inserted element on page', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.insertOneDeal(dealWithNotStartedFacilityStatuses, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = dealWithNotStartedFacilityStatuses;

      const loans = mockFacilities.filter((f) => f.type === FACILITY.FACILITY_TYPE.LOAN);

      cy.createFacilities(dealId, loans, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.loans = createdFacilities;
      });
    });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it("should not insert created element's data into the loan", () => {
    cy.login(BANK1_MAKER1);
    pages.contract.visit(deal);
    pages.contract.proceedToReview().should('not.exist');

    const loanId = dealFacilities.loans[0]._id;
    const loanRow = pages.contract.loansTransactionsTable.row(loanId);

    loanRow.issueFacilityLink().click();

    // inserts populated text form into the form
    cy.insertElement('issue-loan-form');
    // fills out and submits the rest of form
    fillAndSubmitIssueLoanFacilityFormWithoutRequestedCoverStartDate();

    cy.getFacility(deal._id, loanId, BANK1_MAKER1).then((loan) => {
      // check the loan does not include inserted field
      expect(loan.intruder).to.be.an('undefined');
    });
  });
});
