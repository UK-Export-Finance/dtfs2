const relative = require('../../../relativeURL');
const {
  ADMIN,
  UKEF_OPERATIONS, // TODO DTFS2-6637: remove this?
  BANK1_MAKER1,
  BANK1_CHECKER1,
  EDITOR, // TODO DTFS2-6637: remove this?
  BANK1_READ_ONLY,
} = require('../../../../fixtures/users');

context('Only allow authorised users to access admin pages', () => {
  const authorisedRoles = [{
    roleName: 'Admins',
    userWithRole: ADMIN,
  }, {
    roleName: 'UKEF Operations',
    userWithRole: UKEF_OPERATIONS, // TODO DTFS2-6637: remove this?
  }];

  authorisedRoles.forEach(({ roleName, userWithRole }) => {
    it(`should allow ${roleName} access to restricted pages`, () => {
      cy.login(userWithRole);
      cy.visit('/admin/users/');
      cy.url().should('eq', relative('/admin/users/'));
    });
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
    roleName: 'Editors',
    userWithRole: EDITOR, // TODO DTFS2-6637: remove this?
    expectedRedirectLocation: '/login',
  }, {
    roleName: 'Read Only users',
    userWithRole: BANK1_READ_ONLY,
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
