const { serviceOptions } = require('../../pages');
const MOCK_USERS = require('../../../fixtures/users');
const relativeURL = require('../../relativeURL');

// TODO FN-955 update to payment officer role
const { BANK1_MAKER1 } = MOCK_USERS;
const { PAYMENT_OFFICER } = MOCK_USERS;
const { ADMIN } = MOCK_USERS;

context('List service options', () => {
  describe('As a maker', () => {
    it('displays link to portal, when selected directs to portal homepage', () => {
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/service-options'));

      serviceOptions.mainHeading().should('contain', 'What do you want to do?');
      serviceOptions.utilisationReportLink().should('not.exist');

      serviceOptions.portalLink().click();
      serviceOptions.currentUrl().should('contain', 'dashboard/deals');
    });
  });

  describe('As a checker', () => {
    it('displays link to portal, when selected directs to portal homepage', () => {
      cy.login(BANK1_MAKER1);
      cy.visit(relativeURL('/service-options'));

      serviceOptions.mainHeading().should('contain', 'What do you want to do?');
      serviceOptions.utilisationReportLink().should('not.exist');

      serviceOptions.portalLink().click();
      serviceOptions.currentUrl().should('contain', 'dashboard/deals');
    });
  });

  describe('As a payment officer', () => {
    it('displays link to utilisation report service, when selected directs to upload report page', () => {
      cy.login(PAYMENT_OFFICER);
      cy.visit(relativeURL('/service-options'));

      serviceOptions.mainHeading().should('contain', 'What do you want to do?');
      serviceOptions.portalLink().should('not.exist');

      serviceOptions.utilisationReportLink().click();
      serviceOptions.currentUrl().should('contain', 'utilisation-report-upload');
    });
  });

  describe('As admin', () => {
    it('displays both links', () => {
      cy.login(ADMIN);
      cy.visit(relativeURL('/service-options'));

      serviceOptions.mainHeading().should('contain', 'What do you want to do?');
      serviceOptions.portalLink().should('exist');
      serviceOptions.utilisationReportLink().should('exist');
    });
  });
});
