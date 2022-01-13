const pages = require('../../../pages');
const partials = require('../../../partials');
const relative = require('../../../relativeURL');
const dealWithSomeIssuedFacilitiesReadyForReview = require('./dealWithSomeIssuedFacilitiesReadyForReview');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));
const CHECKER_LOGIN = mockUsers.find((user) => (user.roles.includes('checker') && user.bank.name === 'UKEF test bank (Delegated)'));

context('A checker selects to return a deal (with some issued facilities) to maker from the view-contract page', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(MAKER_LOGIN);

    cy.insertOneDeal(dealWithSomeIssuedFacilitiesReadyForReview, { ...MAKER_LOGIN })
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;

        const { mockFacilities } = dealWithSomeIssuedFacilitiesReadyForReview;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.facilityType === 'Bond');
          const loans = createdFacilities.filter((f) => f.facilityType === 'Loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, MAKER_LOGIN);
    });
  });

  it('Facilities display the correct facility statuses and after returning the deal to maker, facility statuses should be updated', () => {
    cy.login({ ...CHECKER_LOGIN });
    pages.contract.visit(deal);

    // expect Unissued Bonds (that need to 'Issue Facility') to have correct status
    const unissuedBond = dealFacilities.bonds.find((b) => b.facilityStage === 'Unissued');
    const unissuedBondId = unissuedBond._id;
    const unissuedBondRow = pages.contract.bondTransactionsTable.row(unissuedBondId);

    unissuedBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    // expect Issued Bonds (that do not need to 'Issue Facility') to have correct status
    const issuedBond = dealFacilities.bonds.find((b) => b.facilityStage === 'Issued');
    const issuedBondId = issuedBond._id;
    const issuedBondRow = pages.contract.bondTransactionsTable.row(issuedBondId);

    issuedBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    // expect Conditional Loans (that need to 'Issue Facility') to have correct status
    const conditionalLoan = dealFacilities.loans.find((l) => l.facilityStage === 'Conditional');
    const conditionalLoanId = conditionalLoan._id;
    const conditionalLoanRow = pages.contract.loansTransactionsTable.row(conditionalLoanId);

    conditionalLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Ready for check');
    });

    // expect Unconditional Loans (that do not need to 'Issue Facility') to have correct status
    const unconditionalLoan = dealFacilities.loans.find((l) => l.facilityStage === 'Unconditional');
    const unconditionalLoanId = unconditionalLoan._id;
    const unconditionalLoanRow = pages.contract.loansTransactionsTable.row(unconditionalLoanId);

    unconditionalLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    // return the deal to maker
    pages.contract.returnToMaker().click();
    pages.contractReturnToMaker.comments().type('Nope!');
    pages.contractReturnToMaker.returnToMaker().click();
    cy.url().should('include', '/dashboard');

    // view the deal
    partials.successMessage.successMessageLink().click();
    cy.url().should('eq', relative(`/contract/${dealId}`));

    // assert Bond statuses
    unissuedBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Maker\'s input required');
    });

    issuedBondRow.bondStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });

    // assert loan statuses
    conditionalLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).equal('Maker\'s input required');
    });

    unconditionalLoanRow.loanStatus().invoke('text').then((text) => {
      expect(text.trim()).to.equal('Completed');
    });
  });
});
