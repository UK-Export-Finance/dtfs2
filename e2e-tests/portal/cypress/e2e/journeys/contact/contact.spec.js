const relative = require('../../relativeURL');
const { contactPage } = require('../../pages/contact');

const emailAddress = Cypress.expose('CONTACT_US_EMAIL_ADDRESS').trim();

context('contact', () => {
  beforeEach(() => {
    contactPage.visit();
  });

  describe('visit contact us page', () => {
    it('should ensure the page URL is correct', () => {
      cy.url().should('eq', relative('/contact'));
    });

    it('should ensure the portal headings are rendered', () => {
      cy.assertText(contactPage.heading(), 'Contact us');
      cy.assertText(contactPage.emailHeading(), 'Email');
    });

    it('should ensure the contact us email address is valid', () => {
      cy.assertText(contactPage.email(), emailAddress);
    });

    it('should ensure the contact us timeframe is valid', () => {
      cy.assertText(contactPage.timeframe(), 'Monday to Friday, 9am to 5pm (excluding public holidays)');
    });
  });
});
