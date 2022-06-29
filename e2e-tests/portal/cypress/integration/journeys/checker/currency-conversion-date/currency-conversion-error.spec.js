const { contract, contractConfirmSubmission } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const { successMessage } = require('../../../partials');
const firstSubmission = require('./deal-first-submission');
const secondSubmission = require('./deal-second-submission');

const {
  ADMIN,
  BANK1_MAKER1,
  BANK1_CHECKER1,
} = MOCK_USERS;

context('First submission with currency conversion date more than 30 days in the past - should show error', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(firstSubmission, BANK1_MAKER1)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;

        const { mockFacilities } = firstSubmission;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.type === 'Bond');
          const loans = createdFacilities.filter((f) => f.type === 'Loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should show errors on submission as conversion date is more than 30 days in the past', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);

    contract.visit(deal);
    contract.proceedToSubmit().click();

    // submit with checkbox checked
    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    contractConfirmSubmission.expectError('Supply Contract conversion date cannot be more than 30 days in the past');
    contractConfirmSubmission.expectError('Conversion rate date must be between');
  });
});

context('Second submission (has submissionDate) with currency conversion date more than 30 days in the past - should not show error', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  before(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(secondSubmission, BANK1_MAKER1)
      .then((insertedDeal) => {
        deal = insertedDeal;
        dealId = deal._id;

        const { mockFacilities } = secondSubmission;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.type === 'Bond');
          const loans = createdFacilities.filter((f) => f.type === 'Loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
      });
  });

  after(() => {
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should not show errors on submission when conversion date is more than 30 days in the past as not first submission (has submissionDate)', () => {
    // log in, visit a deal, select abandon
    cy.login(BANK1_CHECKER1);

    contract.visit(deal);
    contract.proceedToSubmit().click();

    // submit with checkbox checked
    contractConfirmSubmission.confirmSubmit().check();
    contractConfirmSubmission.acceptAndSubmit().click();

    // expect to land on the /dashboard page with a success message
    cy.url().should('include', '/dashboard');
    successMessage.successMessageListItem().invoke('text').then((text) => {
      expect(text.trim()).to.match(/Supply Contract submitted to UKEF./);
    });
  });
});
