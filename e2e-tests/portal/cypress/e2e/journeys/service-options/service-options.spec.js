const { serviceOptions } = require('../../pages');
const MOCK_USERS = require('../../../fixtures/users');
const relativeURL = require('../../relativeURL');

const {
  BANK1_MAKER1, BANK1_CHECKER1, BANK1_PAYMENT_OFFICER1, ADMINNOMAKER, BANK1_READ_ONLY1,
} = MOCK_USERS;

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
      cy.login(BANK1_CHECKER1);
      cy.visit(relativeURL('/service-options'));

      serviceOptions.mainHeading().should('contain', 'What do you want to do?');
      serviceOptions.utilisationReportLink().should('not.exist');

      serviceOptions.portalLink().click();
      serviceOptions.currentUrl().should('contain', 'dashboard/deals');
    });
  });

  describe('As admin', () => {
    it('displays link to portal, when selected directs to portal homepage', () => {
      cy.login(ADMINNOMAKER);
      cy.visit(relativeURL('/service-options'));

      serviceOptions.mainHeading().should('contain', 'What do you want to do?');
      serviceOptions.utilisationReportLink().should('not.exist');

      serviceOptions.portalLink().click();
      serviceOptions.currentUrl().should('contain', 'dashboard/deals');
    });
  });

  describe('As read-only user', () => {
    it('displays link to portal, when selected directs to portal homepage', () => {
      cy.login(BANK1_READ_ONLY1);
      cy.visit(relativeURL('/service-options'));

      serviceOptions.mainHeading().should('contain', 'What do you want to do?');
      serviceOptions.utilisationReportLink().should('not.exist');

      serviceOptions.portalLink().click();
      serviceOptions.currentUrl().should('contain', 'dashboard/deals');
    });
  });

  describe('As a payment officer', () => {
    it('displays link to utilisation report service, when selected directs to upload report page', () => {
      cy.login(BANK1_PAYMENT_OFFICER1);
      cy.visit(relativeURL('/service-options'));

      serviceOptions.mainHeading().should('contain', 'What do you want to do?');
      serviceOptions.portalLink().should('not.exist');

      serviceOptions.utilisationReportLink().click();
      serviceOptions.currentUrl().should('contain', 'utilisation-report-upload');
    });
  });
});
