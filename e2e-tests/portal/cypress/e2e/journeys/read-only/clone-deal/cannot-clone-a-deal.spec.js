const { contract } = require('../../../pages');
const fullyCompletedDeal = require('../fixtures/dealFullyCompleted');
const MOCK_USERS = require('../../../../fixtures/users');
const relative = require('../../../relativeURL');

const { BANK1_READONLY1, BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Clone a deal', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.insertOneDeal(fullyCompletedDeal, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = fullyCompletedDeal;

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

  describe('when a read-only user creates a deal', () => {
    it('should have no "clone deal" link', () => {
      cy.loginGoToDealPage(BANK1_READONLY1, deal);
      cy.url().should('eq', relative(`/contract/${deal._id}`));
      contract.cloneDealLink().should('not.exist');
    });
  });
});
