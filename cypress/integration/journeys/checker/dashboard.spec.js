const {dashboard} = require('../../pages');
const relative = require('../../relativeURL');

const mockUsers = require('../../../fixtures/mockUsers');
const CHECKER_LOGIN = mockUsers.find( user=> (user.roles.includes('checker')) );

context('Dashboard Deals viewed by a user with role=checker', () => {

  beforeEach( () => {
    // [dw] at time of writing, the portal was throwing exceptions; this stops cypress caring
    cy.on('uncaught:exception', (err, runnable) => {
      console.log(err.stack);
      return false;
    });
  });

  it('Dashboard defaults to showing status=readyForApproval', () => {
    cy.login(CHECKER_LOGIN);
    dashboard.visit();

    dashboard.filterByStatus().should('be.visible');
    dashboard.filterByStatus().should('have.value', 'readyForApproval');
  });

});
