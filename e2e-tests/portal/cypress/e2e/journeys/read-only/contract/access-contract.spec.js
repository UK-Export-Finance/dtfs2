const fullyCompletedDeal = require('../fixtures/dealFullyCompleted');
const { READ_ONLY_ALL_BANKS, BANK1_MAKER1, ADMIN } = require('../../../../fixtures/users');
const relative = require('../../../relativeURL');

context('Access contract page', () => {
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
    cy.deleteDeals(ADMIN);

    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });

    dealFacilities.loans.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('allows read only user with all bank access to view contract page', () => {
    cy.loginGoToDealPage(READ_ONLY_ALL_BANKS, deal);
    cy.url().should('eq', relative(`/contract/${deal._id}`));
  });
});
