const { contract } = require('../../../pages');
const fullyCompletedDeal = require('../fixtures/dealFullyCompleted');
const MOCK_USERS = require('../../../../../../e2e-fixtures');

const { BANK1_READ_ONLY1, BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('Clone a deal', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
    loans: [],
  };

  beforeEach(() => {
    cy.deleteDeals(ADMIN);
    cy.createBssEwcsDeal({});
    cy.getDealIdFromUrl(dealId).then((id) => {
      dealId = id;

      cy.url().then((url) => {
        const urlParts = url.split('/');
        dealId = urlParts[urlParts.length - 1];

        const { mockFacilities } = fullyCompletedDeal;

        cy.createFacilities(dealId, mockFacilities, BANK1_MAKER1).then((createdFacilities) => {
          const bonds = createdFacilities.filter((f) => f.type === 'Bond');
          const loans = createdFacilities.filter((f) => f.type === 'Loan');

          dealFacilities.bonds = bonds;
          dealFacilities.loans = loans;
        });
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

  describe('when a read-only user creates a deal', () => {
    it('should have no "clone deal" link', () => {
      cy.loginGoToDealPage(BANK1_READ_ONLY1, deal);
      cy.url().should('include', '/contract');
      contract.cloneDealLink().should('not.exist');
    });
  });
});
