const pages = require('../../../pages');
const partials = require('../../../partials');
const relative = require('../../../relativeURL');
const dealWithSomeIssuedFacilitiesReadyForReview = require('./dealWithSomeIssuedFacilitiesReadyForReview');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('A checker selects to return a deal (with some issued facilities) to maker from the view-contract page', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(ADMIN);

    cy.insertOneDeal(dealWithSomeIssuedFacilitiesReadyForReview, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = dealWithSomeIssuedFacilitiesReadyForReview;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');
        const loans = createdFacilities.filter((f) => f.type === 'Loan');

        dealFacilities.bonds = bonds;
        dealFacilities.loans = loans;
      });
    });
  });

  after(() => {
    cy.deleteDeals(ADMIN);

    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('Facilities display the correct facility statuses and after returning the deal to maker, facility statuses should be updated', () => {
    cy.login(BANK1_CHECKER1);
    pages.contract.visit(deal);

    // expect Unissued Bonds (that need to 'Issue Facility') to have correct status
    const unissuedBond = dealFacilities.bonds.find((b) => b.facilityStage === 'Unissued');
    const unissuedBondId = unissuedBond._id;
    const unissuedBondRow = pages.contract.bondTransactionsTable.row(unissuedBondId);

    cy.assertText(unissuedBondRow.bondStatus(), 'Ready for check');

    // expect Issued Bonds (that do not need to 'Issue Facility') to have correct status
    const issuedBond = dealFacilities.bonds.find((b) => b.facilityStage === 'Issued');
    const issuedBondId = issuedBond._id;
    const issuedBondRow = pages.contract.bondTransactionsTable.row(issuedBondId);

    cy.assertText(issuedBondRow.bondStatus(), 'Completed');

    // expect Conditional Loans (that need to 'Issue Facility') to have correct status
    const conditionalLoan = dealFacilities.loans.find((l) => l.facilityStage === 'Conditional');
    const conditionalLoanId = conditionalLoan._id;
    const conditionalLoanRow = pages.contract.loansTransactionsTable.row(conditionalLoanId);

    cy.assertText(conditionalLoanRow.loanStatus(), 'Ready for check');

    // expect Unconditional Loans (that do not need to 'Issue Facility') to have correct status
    const unconditionalLoan = dealFacilities.loans.find((l) => l.facilityStage === 'Unconditional');
    const unconditionalLoanId = unconditionalLoan._id;
    const unconditionalLoanRow = pages.contract.loansTransactionsTable.row(unconditionalLoanId);

    cy.assertText(unconditionalLoanRow.loanStatus(), 'Completed');

    // return the deal to maker
    cy.clickReturnToMakerButton();
    pages.contractReturnToMaker.comments().type('Nope!');
    cy.clickReturnToMakerButton();
    cy.url().should('include', '/dashboard');

    // view the deal
    partials.successMessage.successMessageLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    // assert Bond statuses
    cy.assertText(unissuedBondRow.bondStatus(), "Maker's input required");

    cy.assertText(issuedBondRow.bondStatus(), 'Completed');

    // assert loan statuses

    cy.assertText(conditionalLoanRow.loanStatus(), "Maker's input required");

    cy.assertText(unconditionalLoanRow.loanStatus(), 'Completed');
  });
});
