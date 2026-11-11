const { maintenancePage } = require('../pages/maintenance');

context('Maintenance', () => {
  const contactUsEmailAddress = Cypress.expose('CONTACT_US_EMAIL_ADDRESS');

  beforeEach(() => {
    cy.saveSession();

    cy.visit('/', {
      failOnStatusCode: false,
    });
  });

  describe('service unavailable page', () => {
    it('should ensure service unavailable heading exist ', () => {
      maintenancePage.heading().should('exist');
      maintenancePage.heading().contains('Sorry, the service is unavailable');
    });

    it('should ensure service unavailable message exist ', () => {
      maintenancePage.message().should('exist');
      maintenancePage.message().contains('You will be able to use the service from 11:59pm on Friday 31 December 9999.');
    });

    it('should ensure service unavailable contact exist ', () => {
      maintenancePage.contact().should('exist');
      maintenancePage.contact().contains(`If you have any urgent enquiries, please contact the helpdesk at ${contactUsEmailAddress}`);
    });
  });
});
