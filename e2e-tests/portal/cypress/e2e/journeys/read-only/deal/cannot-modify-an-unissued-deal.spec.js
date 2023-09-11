const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const dealReadyToSubmit = require('../fixtures/dealReadyToSubmit');

const { BANK1_READ_ONLY1, BANK1_MAKER1, ADMIN } = MOCK_USERS;

context('A read-only role viewing a bond that can be issued', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
  };

  beforeEach(() => {
    cy.insertOneDeal(dealReadyToSubmit, BANK1_MAKER1).then((insertedDeal) => {
      deal = insertedDeal;
      dealId = deal._id;

      const { mockFacilities } = dealReadyToSubmit;

      const bonds = mockFacilities.filter((f) => f.type === 'Bond');

      cy.createFacilities(dealId, bonds, BANK1_MAKER1).then((createdFacilities) => {
        dealFacilities.bonds = createdFacilities;
      });
    });
  });

  after(() => {
    cy.deleteDeals(ADMIN);

    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should not allow for any publishing actions', () => {
    cy.login(BANK1_READ_ONLY1);
    pages.contract.visit(deal);

    cy.url().should('eq', relative(`/contract/${deal._id}`));

    pages.contract.proceedToSubmit().should('not.exist');
    pages.contract.proceedToReview().should('not.exist');
  });
});
