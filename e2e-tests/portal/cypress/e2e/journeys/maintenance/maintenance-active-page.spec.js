const page = require('../../pages/maintenance');

context('Maintenance', () => {
  const contactUsEmailAddress = Cypress.env('CONTACT_US_EMAIL_ADDRESS');

  beforeEach(() => {
    cy.saveSession();

    cy.visit('/', {
      failOnStatusCode: false,
    });
  });

  describe('service unavailable page', () => {
    it('should ensure service unavailable heading exist ', () => {
      page.heading().should('exist');
      page.heading().contains('Sorry, the service is unavailable');
    });

    it('should ensure service unavailable message exist ', () => {
      page.message().should('exist');
      page.message().contains('You will be able to use the service from 11:59pm on Friday 31 December 9999.');
    });

    it('should ensure service unavailable contact exist ', () => {
      page.contact().should('exist');
      page.contact().contains(`If you have any urgent enquiries, please contact the helpdesk at ${contactUsEmailAddress}`);
    });
  });
});
