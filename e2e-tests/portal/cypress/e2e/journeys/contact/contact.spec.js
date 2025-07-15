const relative = require('../../relativeURL');
const { contact } = require('../../pages');

const emailAddress = Cypress.env('CONTACT_US_EMAIL_ADDRESS').trim();

context('contact', () => {
  beforeEach(() => {
    contact.visit();
  });

  describe('visit contact us page', () => {
    it('should ensure the page URL is correct', () => {
      cy.url().should('eq', relative('/contact'));
    });

    it('should ensure the portal headings are rendered', () => {
      contact.heading().should('have.text', 'Contact us');
      contact.emailHeading().should('have.text', 'Email');
    });

    it('should ensure the contact us email address is valid', () => {
      contact
        .email()
        .invoke('text')
        .then((email) => {
          expect(email.trim()).to.eq(emailAddress);
        });
    });

    it('should ensure the contact us timeframe is valid', () => {
      contact.timeframe().should('have.text', 'Monday to Friday, 9am to 5pm (excluding public holidays)');
    });
  });
});
