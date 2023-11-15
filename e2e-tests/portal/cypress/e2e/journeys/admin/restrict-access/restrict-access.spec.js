// This needs to be changed
const fullyCompletedDeal = require('../../read-only/fixtures/dealFullyCompleted');
const relative = require('../../../relativeURL');
const {
  ADMIN,
  BANK1_MAKER1,
  BANK1_CHECKER1,
  BANK1_READ_ONLY1,
} = require('../../../../fixtures/users');

context('Only allow authorised users to access admin pages', () => {
  it('should allow admins access to restricted pages', () => {
    cy.login(ADMIN);
    cy.visit('/admin/users/');
    cy.url().should('eq', relative('/admin/users/'));
  });

  it('should allow admins to access contract pages', () => {
    let deal;
    let dealId;
    const dealFacilities = {
      bonds: [],
      loans: [],
    };

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

    cy.loginGoToDealPage(ADMIN, deal);
    cy.url().should('eq', relative(`/contract/${deal._id}`));
  });

  const unauthorisedRoles = [{
    roleName: 'Makers',
    userWithRole: BANK1_MAKER1,
    expectedRedirectLocation: '/dashboard/deals/0',
  }, {
    roleName: 'Checkers',
    userWithRole: BANK1_CHECKER1,
    expectedRedirectLocation: '/dashboard/deals/0',
  }, {
    roleName: 'Read Only users',
    userWithRole: BANK1_READ_ONLY1,
    expectedRedirectLocation: '/dashboard/deals/0',
  }];

  unauthorisedRoles.forEach(({ roleName, userWithRole, expectedRedirectLocation }) => {
    it(`should NOT allow ${roleName} access to restricted pages`, () => {
      cy.login(userWithRole);
      cy.visit('/admin/users/');
      cy.url().should('eq', relative(expectedRedirectLocation));
    });
  });
});
