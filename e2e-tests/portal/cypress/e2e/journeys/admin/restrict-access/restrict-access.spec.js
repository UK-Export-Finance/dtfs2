const relative = require('../../../relativeURL');
const { ADMIN, BANK1_MAKER1, BANK1_CHECKER1, BANK1_READ_ONLY1, BANK1_PAYMENT_REPORT_OFFICER1 } = require('../../../../../../e2e-fixtures/portal-users.fixture');

context('Only allow authorised users to access admin pages', () => {
  it('should allow admins access to restricted pages', () => {
    cy.login(ADMIN);
    cy.visit('/admin/users/');
    cy.url().should('eq', relative('/admin/users/'));
  });

  describe('Access a deal', () => {
    let bssDealId;

    before(() => {
      cy.deleteDeals(ADMIN);
      cy.createBssEwcsDeal().then((dealId) => {
        bssDealId = dealId;
      });
    });

    it('should allow read only user with all bank access to view deal', () => {
      const dealUrl = relative(`/contract/${bssDealId}`);
      cy.login(ADMIN);
      cy.visit(dealUrl);
      cy.url().should('eq', dealUrl);
    });
  });

  const unauthorisedRoles = [
    {
      roleName: 'Makers',
      userWithRole: BANK1_MAKER1,
      expectedRedirectLocation: '/dashboard/deals/0',
    },
    {
      roleName: 'Checkers',
      userWithRole: BANK1_CHECKER1,
      expectedRedirectLocation: '/dashboard/deals/0',
    },
    {
      roleName: 'Read Only users',
      userWithRole: BANK1_READ_ONLY1,
      expectedRedirectLocation: '/dashboard/deals/0',
    },
    {
      roleName: 'Payment Report Officers',
      userWithRole: BANK1_PAYMENT_REPORT_OFFICER1,
      expectedRedirectLocation: '/utilisation-report-upload',
    },
  ];

  unauthorisedRoles.forEach(({ roleName, userWithRole, expectedRedirectLocation }) => {
    it(`should NOT allow ${roleName} access to restricted pages`, () => {
      cy.login(userWithRole);
      cy.visit('/admin/users/');
      cy.url().should('eq', relative(expectedRedirectLocation));
    });
  });
});
