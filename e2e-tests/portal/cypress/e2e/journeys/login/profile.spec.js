const { header, userProfile } = require('../../pages');
const relative = require('../../relativeURL');
const { UKEF_BANK_1 } = require('../../../../../e2e-fixtures/banks.fixture');
const MOCK_USERS = require('../../../../../e2e-fixtures');

const { ADMIN, BANK1_MAKER1, BANK1_CHECKER1, BANK1_PAYMENT_REPORT_OFFICER1 } = MOCK_USERS;

const dashboardUrl = relative('/dashboard/deals/0');
const reportUploadUrl = relative('/utilisation-report-upload');

describe('User profile page', () => {
  describe('Maker', () => {
    beforeEach(() => {
      cy.login(BANK1_MAKER1);
      header.profile().click();
    });

    it('should display the correct user profile information', () => {
      cy.assertText(userProfile.firstname(), BANK1_MAKER1.firstname);
      cy.assertText(userProfile.surname(), BANK1_MAKER1.surname);
      cy.assertText(userProfile.email(), BANK1_MAKER1.email);
      cy.assertText(userProfile.roles(), BANK1_MAKER1.roles.join(', '));
      cy.assertText(userProfile.bank(), UKEF_BANK_1.name);
    });

    it('should go back to the dashboard when clicking the cancel button', () => {
      cy.clickCancelButton();
      cy.url().should('eq', dashboardUrl);
    });
  });

  describe('Admin', () => {
    beforeEach(() => {
      cy.login(ADMIN);
      header.profile().click();
    });

    it('should display the correct user profile information', () => {
      cy.assertText(userProfile.firstname(), ADMIN.firstname);
      cy.assertText(userProfile.surname(), ADMIN.surname);
      cy.assertText(userProfile.email(), ADMIN.email);
      userProfile.roles().should('contain', ADMIN.roles[0]);
      userProfile.roles().should('contain', ADMIN.roles[1]);
    });

    it('should go back to the dashboard when clicking the cancel button', () => {
      cy.clickCancelButton();
      cy.url().should('eq', dashboardUrl);
    });
  });

  describe('Checker', () => {
    beforeEach(() => {
      cy.login(BANK1_CHECKER1);
      header.profile().click();
    });

    it('should display the correct user profile information', () => {
      cy.assertText(userProfile.firstname(), BANK1_CHECKER1.firstname);
      cy.assertText(userProfile.surname(), BANK1_CHECKER1.surname);
      cy.assertText(userProfile.email(), BANK1_CHECKER1.email);
      cy.assertText(userProfile.roles(), BANK1_CHECKER1.roles.join(', '));
      cy.assertText(userProfile.bank(), UKEF_BANK_1.name);
    });

    it('should go back to the dashboard when clicking the cancel button', () => {
      cy.clickCancelButton();
      cy.url().should('eq', dashboardUrl);
    });
  });

  describe('Payment report officer', () => {
    beforeEach(() => {
      cy.login(BANK1_PAYMENT_REPORT_OFFICER1);
      header.profile().click();
    });

    it('should display the correct user profile information', () => {
      cy.assertText(userProfile.firstname(), BANK1_PAYMENT_REPORT_OFFICER1.firstname);
      cy.assertText(userProfile.surname(), BANK1_PAYMENT_REPORT_OFFICER1.surname);
      cy.assertText(userProfile.email(), BANK1_PAYMENT_REPORT_OFFICER1.email);
      cy.assertText(userProfile.roles(), BANK1_PAYMENT_REPORT_OFFICER1.roles.join(', '));
      cy.assertText(userProfile.bank(), UKEF_BANK_1.name);
    });

    it('should go back to the utilisation report upload page when clicking the cancel button', () => {
      cy.clickCancelButton();
      cy.url().should('eq', reportUploadUrl);
    });
  });
});
