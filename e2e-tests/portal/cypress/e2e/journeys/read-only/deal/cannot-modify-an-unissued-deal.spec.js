const pages = require('../../../pages');
const relative = require('../../../relativeURL');
const MOCK_USERS = require('../../../../fixtures/users');
const dealReadyToSubmit = require('../fixtures/dealReadyToSubmit');

const { BANK1_READONLY1, BANK1_MAKER1 } = MOCK_USERS;

context('A read-only role viewing a bond that can be issued', () => {
  let deal;
  let dealId;
  const dealFacilities = {
    bonds: [],
  };

  before(() => {
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
    dealFacilities.bonds.forEach((facility) => {
      cy.deleteFacility(facility._id, BANK1_MAKER1);
    });
  });

  it('should not allow for any publishing actions', () => {
    cy.login(BANK1_READONLY1);
    pages.contract.visit(deal);

    cy.url().should('eq', relative(`/contract/${deal._id}`));

    pages.contract.proceedToSubmit().should('not.exist');
    pages.contract.proceedToReview().should('not.exist');
  });
});
