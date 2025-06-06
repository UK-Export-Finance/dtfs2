const { contract, contractReadyForReview, contractComments, defaults } = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../../../e2e-fixtures');
const dealWithIncompleteBonds = require('./dealWithIncompleteBonds.json');
const dealWithIncompleteLoans = require('./dealWithIncompleteLoans.json');
const dealWithIncompleteAbout = require('./dealWithIncompleteAbout.json');
const dealWithIncompleteEligibility = require('./dealWithIncompleteEligibility.json');
const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const dealWithNoBondCoverStartDate = require('./dealWithNoBondCoverStartDate');
const dealWithNoLoanCoverStartDate = require('./dealWithNoLoanCoverStartDate');

const { BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('A maker selects to submit a contract for review from the view-contract page', () => {
  const deals = {};
  let dealId;
  const dealFacilities = {
    dealReadyToSubmitForReview: {
      bonds: [],
      loans: [],
    },
    dealWithNoBondCoverStartDate: {
      bonds: [],
      loans: [],
    },
    dealWithNoLoanCoverStartDate: {
      bonds: [],
      loans: [],
    },
  };
  const allCreatedFacilities = [];

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(dealWithIncompleteBonds, BANK1_MAKER1).then((insertedDeal) => {
      deals.dealWithIncompleteBonds = insertedDeal;
      dealId = insertedDeal._id;

      const { mockFacilities } = dealWithIncompleteBonds;
      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        allCreatedFacilities.push(...createdFacilities);
      });
    });

    cy.insertOneDeal(dealWithIncompleteLoans, BANK1_MAKER1).then((insertedDeal) => {
      deals.dealWithIncompleteLoans = insertedDeal;
      dealId = insertedDeal._id;

      const { mockFacilities } = dealWithIncompleteLoans;
      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        allCreatedFacilities.push(...createdFacilities);
      });
    });

    cy.insertOneDeal(dealWithIncompleteAbout, BANK1_MAKER1).then((insertedDeal) => {
      deals.dealWithIncompleteAbout = insertedDeal;
      dealId = insertedDeal._id;

      const { mockFacilities } = dealWithIncompleteAbout;
      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        allCreatedFacilities.push(...createdFacilities);
      });
    });

    cy.insertOneDeal(dealWithIncompleteEligibility, BANK1_MAKER1).then((insertedDeal) => {
      deals.dealWithIncompleteEligibility = insertedDeal;
      dealId = insertedDeal._id;

      const { mockFacilities } = dealWithIncompleteEligibility;
      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        allCreatedFacilities.push(...createdFacilities);
      });
    });

    cy.insertOneDeal(dealReadyToSubmitForReview, BANK1_MAKER1).then((insertedDeal) => {
      deals.dealReadyToSubmitForReview = insertedDeal;
      dealId = insertedDeal._id;

      const { mockFacilities } = dealReadyToSubmitForReview;

      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');
        const loans = createdFacilities.filter((f) => f.type === 'Loan');

        dealFacilities.dealReadyToSubmitForReview.bonds = bonds;
        dealFacilities.dealReadyToSubmitForReview.loans = loans;

        allCreatedFacilities.push(...createdFacilities);
      });
    });

    cy.insertOneDeal(dealWithNoBondCoverStartDate, BANK1_MAKER1).then((insertedDeal) => {
      deals.dealWithNoBondCoverStartDate = insertedDeal;
      dealId = insertedDeal._id;

      const { mockFacilities } = dealWithNoBondCoverStartDate;
      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');
        const loans = createdFacilities.filter((f) => f.type === 'Loan');

        dealFacilities.dealWithNoBondCoverStartDate.bonds = bonds;
        dealFacilities.dealWithNoBondCoverStartDate.loans = loans;

        allCreatedFacilities.push(...createdFacilities);
      });
    });

    cy.insertOneDeal(dealWithNoLoanCoverStartDate, BANK1_MAKER1).then((insertedDeal) => {
      deals.dealWithNoLoanCoverStartDate = insertedDeal;
      dealId = insertedDeal._id;

      const { mockFacilities } = dealWithNoLoanCoverStartDate;
      cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
        const bonds = createdFacilities.filter((f) => f.type === 'Bond');
        const loans = createdFacilities.filter((f) => f.type === 'Loan');

        dealFacilities.dealWithNoLoanCoverStartDate.bonds = bonds;
        dealFacilities.dealWithNoLoanCoverStartDate.loans = loans;

        allCreatedFacilities.push(...createdFacilities);
      });
    });
  });

  after(() => {
    allCreatedFacilities.forEach((facility) => {
      cy.deleteFacility(facility._id, ADMIN);
    });
  });

  describe('When a deal does NOT have Eligibility with `Completed` status', () => {
    it('User cannot proceed to submit the deal for review', () => {
      cy.login(BANK1_MAKER1);
      contract.visit(deals.dealWithIncompleteEligibility);
      contract.proceedToReview().should('not.exist');
      contract.canProceed().should('exist');
    });
  });

  describe('When a deal has Bonds that are NOT `Completed`', () => {
    it('User cannot proceed to submit the deal for review', () => {
      cy.login(BANK1_MAKER1);
      contract.visit(deals.dealWithIncompleteBonds);
      contract.proceedToReview().should('not.exist');
      contract.canProceed().should('exist');
    });
  });

  describe('When a deal has Loans that are NOT `Completed`', () => {
    it('User cannot proceed to submit the deal for review', () => {
      cy.login(BANK1_MAKER1);
      contract.visit(deals.dealWithIncompleteLoans);
      contract.proceedToReview().should('not.exist');
      contract.canProceed().should('exist');
    });
  });

  describe('When a deal has About-supply-contract that is NOT `Completed`', () => {
    it('User cannot proceed to submit the deal for review', () => {
      cy.login(BANK1_MAKER1);
      contract.visit(deals.dealWithIncompleteAbout);
      contract.proceedToReview().should('not.exist');
      contract.canProceed().should('exist');
    });
  });

  describe('when a deal has Completed Eligibility, Bonds and Loans', () => {
    it('User can proceed to submit the deal for review', () => {
      const deal = deals.dealReadyToSubmitForReview;

      cy.login(BANK1_MAKER1);
      contract.visit(deal);
      contract.proceedToReview().should('not.be.disabled');
      cy.clickProceedToReviewButton();
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));
    });

    it('The cancel button returns the user to the view-contract page.', () => {
      const deal = deals.dealReadyToSubmitForReview;

      // log in, visit a deal, select abandon
      cy.login(BANK1_MAKER1);
      contract.visit(deal);
      cy.clickProceedToReviewButton();

      // cancel
      contractReadyForReview.comments().should('have.value', '');
      contractReadyForReview.cancel().click();

      // check we've gone to the right page
      cy.url().should('eq', relative(`/contract/${deal._id}`));
    });

    it('The ReadyForCheckersApproval button generates an error if no comment has been entered.', () => {
      const deal = deals.dealReadyToSubmitForReview;
      // log in, visit a deal, select abandon
      cy.login(BANK1_MAKER1);
      contract.visit(deal);
      cy.clickProceedToReviewButton();

      cy.title().should('eq', `Ready for review - ${deal.additionalRefName}${defaults.pageTitleAppend}`);

      // submit without a comment
      contractReadyForReview.comments().should('have.value', '');
      contractReadyForReview.readyForCheckersApproval().click();

      // expect to stay on the submit-for-review page, and see an error
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));
      contractReadyForReview.expectError('Comment is required when submitting a deal for review.');
    });

    it('The Ready for Checkers Review button updates the deal and takes the user to /dashboard', () => {
      const deal = deals.dealReadyToSubmitForReview;

      // log in, visit a deal, select abandon
      cy.login(BANK1_MAKER1);
      contract.visit(deal);
      cy.clickProceedToReviewButton();

      // submit with a comment
      cy.keyboardInput(contractReadyForReview.comments(), 'a mandatory comment');
      contractReadyForReview.readyForCheckersApproval().click();

      // expect to land on the /dashboard page with a success message
      cy.url().should('include', '/dashboard');

      successMessage
        .successMessageListItem()
        .invoke('text')
        .then((text) => {
          expect(text.trim()).to.match(/Supply Contract submitted for review./);
        });

      // visit the deal and confirm the updates have been made
      contract.visit(deal);

      cy.assertText(contract.status(), "Ready for Checker's approval");

      cy.assertText(contract.previousStatus(), 'Draft');

      // while on the deal page: confirm that the various edit features have been
      //  disabled since we're now in a new state
      contract.aboutSupplierDetailsLink().should('not.exist');
      contract.eligibilityCriteriaLink().should('not.exist');
      contract.addBondButton().should('not.exist');

      const aBond = contract.bondTransactionsTable.row(dealFacilities.dealReadyToSubmitForReview.bonds[0]._id);
      aBond.deleteLink().should('not.exist');
      aBond.uniqueNumberLink().should('not.exist');

      contract.addLoanButton().should('not.exist');
      const aLoan = contract.loansTransactionsTable.row(dealFacilities.dealReadyToSubmitForReview.loans[0]._id);
      aLoan.nameLink().should('not.exist');

      // visit the comments page and prove that the comment has been added
      contract.commentsTab().click();

      cy.assertText(contractComments.row(0).comment(), 'a mandatory comment');

      cy.assertText(contractComments.row(0).commentorName(), `${BANK1_MAKER1.firstname} ${BANK1_MAKER1.surname}`);
    });
  });

  describe('when a deal has Completed Eligibility and a Bond with `issued` facilityStage and no Requested Cover Start Date', () => {
    it('should use todays date for the Bond in Deal page', () => {
      const deal = deals.dealWithNoBondCoverStartDate;

      cy.login(BANK1_MAKER1);
      contract.visit(deal);

      contract.proceedToReview().should('not.be.disabled');
      cy.clickProceedToReviewButton();
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));

      cy.keyboardInput(contractReadyForReview.comments(), 'a mandatory comment');
      contractReadyForReview.readyForCheckersApproval().click();

      cy.url().should('include', '/dashboard');

      successMessage.successMessageLink().click();

      cy.url().should('eq', relative(`/contract/${deal._id}`));

      const bondId = dealFacilities.dealWithNoBondCoverStartDate.bonds[0]._id;
      const row = contract.bondTransactionsTable.row(bondId);

      const expectedDate = new Date().toLocaleDateString('en-GB');
      row.requestedCoverStartDate().should('contain.text', expectedDate);
    });
  });

  describe('when a deal has Completed Eligibility and a Loan with `Unconditional` facilityStage and no Requested Cover Start Date', () => {
    it('should use todays date for the Loan in Deal page', () => {
      const deal = deals.dealWithNoLoanCoverStartDate;

      cy.login(BANK1_MAKER1);
      contract.visit(deal);

      contract.proceedToReview().should('not.be.disabled');
      cy.clickProceedToReviewButton();
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));

      cy.keyboardInput(contractReadyForReview.comments(), 'a mandatory comment');
      contractReadyForReview.readyForCheckersApproval().click();

      cy.url().should('include', '/dashboard');

      successMessage.successMessageLink().click();

      cy.url().should('eq', relative(`/contract/${deal._id}`));

      const loanId = dealFacilities.dealWithNoLoanCoverStartDate.loans[0]._id;
      const row = contract.loansTransactionsTable.row(loanId);

      const expectedDate = new Date().toLocaleDateString('en-GB');
      row.requestedCoverStartDate().should('contain.text', expectedDate);
    });
  });
});
