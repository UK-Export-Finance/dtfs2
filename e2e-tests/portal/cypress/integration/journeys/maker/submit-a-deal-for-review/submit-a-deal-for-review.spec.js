const {
  contract, contractReadyForReview, contractComments, defaults,
} = require('../../../pages');
const { successMessage } = require('../../../partials');
const relative = require('../../../relativeURL');
const mockUsers = require('../../../../fixtures/mockUsers');

const MAKER_LOGIN = mockUsers.find((user) => (user.roles.includes('maker') && user.bank.name === 'UKEF test bank (Delegated)'));

// test data we want to set up + work with..
const dealWithIncompleteBonds = require('./dealWithIncompleteBonds.json');
const dealWithIncompleteLoans = require('./dealWithIncompleteLoans.json');
const dealWithIncompleteAbout = require('./dealWithIncompleteAbout.json');
const dealWithIncompleteEligibility = require('./dealWithIncompleteEligibility.json');
const dealReadyToSubmitForReview = require('./dealReadyToSubmitForReview');
const dealWithNoBondCoverStartDate = require('./dealWithNoBondCoverStartDate');
const dealWithNoLoanCoverStartDate = require('./dealWithNoLoanCoverStartDate');

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
    cy.deleteDeals(MAKER_LOGIN);
    cy.insertOneDeal(dealWithIncompleteBonds, MAKER_LOGIN)
      .then((insertedDeal) => {
        deals.dealWithIncompleteBonds = insertedDeal;
        dealId = insertedDeal._id;

        const { mockFacilities } = dealWithIncompleteBonds;
        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          allCreatedFacilities.push(...createdFacilities);
        });
      });

    cy.insertOneDeal(dealWithIncompleteLoans, MAKER_LOGIN)
      .then((insertedDeal) => {
        deals.dealWithIncompleteLoans = insertedDeal;
        dealId = insertedDeal._id;

        const { mockFacilities } = dealWithIncompleteLoans;
        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          allCreatedFacilities.push(...createdFacilities);
        });
      });

    cy.insertOneDeal(dealWithIncompleteAbout, MAKER_LOGIN)
      .then((insertedDeal) => {
        deals.dealWithIncompleteAbout = insertedDeal;
        dealId = insertedDeal._id;

        const { mockFacilities } = dealWithIncompleteAbout;
        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          allCreatedFacilities.push(...createdFacilities);
        });
      });

    cy.insertOneDeal(dealWithIncompleteEligibility, MAKER_LOGIN)
      .then((insertedDeal) => {
        deals.dealWithIncompleteEligibility = insertedDeal;
        dealId = insertedDeal._id;

        const { mockFacilities } = dealWithIncompleteEligibility;
        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          allCreatedFacilities.push(...createdFacilities);
        });
      });

    cy.insertOneDeal(dealReadyToSubmitForReview, MAKER_LOGIN)
      .then((insertedDeal) => {
        deals.dealReadyToSubmitForReview = insertedDeal;
        dealId = insertedDeal._id;

        const { mockFacilities } = dealReadyToSubmitForReview;

        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.type === 'Bond');
          const loans = createdFacilities.filter((f) => f.type === 'Loan');

          dealFacilities.dealReadyToSubmitForReview.bonds = bonds;
          dealFacilities.dealReadyToSubmitForReview.loans = loans;

          allCreatedFacilities.push(...createdFacilities);
        });
      });

    cy.insertOneDeal(dealWithNoBondCoverStartDate, MAKER_LOGIN)
      .then((insertedDeal) => {
        deals.dealWithNoBondCoverStartDate = insertedDeal;
        dealId = insertedDeal._id;

        const { mockFacilities } = dealWithNoBondCoverStartDate;
        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.type === 'Bond');
          const loans = createdFacilities.filter((f) => f.type === 'Loan');

          dealFacilities.dealWithNoBondCoverStartDate.bonds = bonds;
          dealFacilities.dealWithNoBondCoverStartDate.loans = loans;

          allCreatedFacilities.push(...createdFacilities);
        });
      });

    cy.insertOneDeal(dealWithNoLoanCoverStartDate, MAKER_LOGIN)
      .then((insertedDeal) => {
        deals.dealWithNoLoanCoverStartDate = insertedDeal;
        dealId = insertedDeal._id;

        const { mockFacilities } = dealWithNoLoanCoverStartDate;
        cy.createFacilities(dealId, mockFacilities, MAKER_LOGIN).then((createdFacilities) => {
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
      cy.deleteFacility(facility._id, MAKER_LOGIN);
    });
  });

  describe('When a deal does NOT have Eligibility with `Completed` status', () => {
    it('User cannot proceed to submit the deal for review', () => {
      cy.login(MAKER_LOGIN);
      contract.visit(deals.dealWithIncompleteEligibility);
      contract.proceedToReview().should('be.disabled');
    });
  });

  describe('When a deal has Bonds that are NOT `Completed`', () => {
    it('User cannot proceed to submit the deal for review', () => {
      cy.login(MAKER_LOGIN);
      contract.visit(deals.dealWithIncompleteBonds);
      contract.proceedToReview().should('be.disabled');
    });
  });

  describe('When a deal has Loans that are NOT `Completed`', () => {
    it('User cannot proceed to submit the deal for review', () => {
      cy.login(MAKER_LOGIN);
      contract.visit(deals.dealWithIncompleteLoans);
      contract.proceedToReview().should('be.disabled');
    });
  });

  describe('When a deal has About-supply-contract that is NOT `Completed`', () => {
    it('User cannot proceed to submit the deal for review', () => {
      cy.login(MAKER_LOGIN);
      contract.visit(deals.dealWithIncompleteAbout);
      contract.proceedToReview().should('be.disabled');
    });
  });

  describe('when a deal has Completed Eligibility, Bonds and Loans', () => {
    it('User can proceed to submit the deal for review', () => {
      const deal = deals.dealReadyToSubmitForReview;

      cy.login(MAKER_LOGIN);
      contract.visit(deal);
      contract.proceedToReview().should('not.be.disabled');
      contract.proceedToReview().click();
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));
    });

    it('The cancel button returns the user to the view-contract page.', () => {
      const deal = deals.dealReadyToSubmitForReview;

      // log in, visit a deal, select abandon
      cy.login(MAKER_LOGIN);
      contract.visit(deal);
      contract.proceedToReview().click();

      // cancel
      contractReadyForReview.comments().should('have.value', '');
      contractReadyForReview.cancel().click();

      // check we've gone to the right page
      cy.url().should('eq', relative(`/contract/${deal._id}`));
    });

    it('The ReadyForCheckersApproval button generates an error if no comment has been entered.', () => {
      const deal = deals.dealReadyToSubmitForReview;
      // log in, visit a deal, select abandon
      cy.login(MAKER_LOGIN);
      contract.visit(deal);
      contract.proceedToReview().click();

      cy.title().should('eq', `Ready for review - ${deal.additionalRefName}${defaults.pageTitleAppend}`);

      // submit without a comment
      contractReadyForReview.comments().should('have.value', '');
      contractReadyForReview.readyForCheckersApproval().click();

      // expect to stay on the submit-for-review page, and see an error
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));
      contractReadyForReview.expectError('Comment is required when submitting a deal for review.');
    });

    it('The Ready for Checkers Review button updates the deal and takes the user to /dashboard.', () => {
      const deal = deals.dealReadyToSubmitForReview;

      // log in, visit a deal, select abandon
      cy.login(MAKER_LOGIN);
      contract.visit(deal);
      contract.proceedToReview().click();

      // submit with a comment
      contractReadyForReview.comments().type('a mandatory comment');
      contractReadyForReview.readyForCheckersApproval().click();

      // expect to land on the /dashboard page with a success message
      cy.url().should('include', '/dashboard');
      successMessage.successMessageListItem().invoke('text').then((text) => {
        expect(text.trim()).to.match(/Supply Contract submitted for review./);
      });

      // visit the deal and confirm the updates have been made
      contract.visit(deal);
      contract.status().invoke('text').then((text) => {
        expect(text.trim()).to.equal("Ready for Checker's approval");
      });
      contract.previousStatus().invoke('text').then((text) => {
        expect(text.trim()).to.equal('Draft');
      });

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
      aLoan.bankReferenceNumberLink().should('not.exist');

      // visit the comments page and prove that the comment has been added
      contract.commentsTab().click();
      contractComments.row(0).comment().invoke('text').then((text) => {
        expect(text.trim()).to.equal('a mandatory comment');
      });
      contractComments.row(0).commentorName().invoke('text').then((text) => {
        expect(text.trim()).to.equal(`${MAKER_LOGIN.firstname} ${MAKER_LOGIN.surname}`);
      });
    });
  });

  describe('when a deal has Completed Eligibility and a Bond with `issued` facilityStage and no Requested Cover Start Date', () => {
    it('should use todays date for the Bond in Deal page', () => {
      const deal = deals.dealWithNoBondCoverStartDate;

      cy.login(MAKER_LOGIN);
      contract.visit(deal);

      contract.proceedToReview().should('not.be.disabled');
      contract.proceedToReview().click();
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));

      contractReadyForReview.comments().type('a mandatory comment');
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

      cy.login(MAKER_LOGIN);
      contract.visit(deal);

      contract.proceedToReview().should('not.be.disabled');
      contract.proceedToReview().click();
      cy.url().should('eq', relative(`/contract/${deal._id}/ready-for-review`));

      contractReadyForReview.comments().type('a mandatory comment');
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
