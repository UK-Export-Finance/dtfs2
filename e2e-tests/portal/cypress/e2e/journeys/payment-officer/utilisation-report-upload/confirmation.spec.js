const { utilisationReportUpload, confirmAndSend, confirmation } = require('../../../pages');
const MOCK_USERS = require('../../../../fixtures/users');
const relativeURL = require('../../../relativeURL');

const { BANK1_PAYMENT_OFFICER1 } = MOCK_USERS;

context('Confirmation', () => {
  beforeEach(() => {
    cy.login(BANK1_PAYMENT_OFFICER1);
    cy.visit(relativeURL('/utilisation-report-upload'));

    utilisationReportUpload.utilisationReportFileInput().attachFile('valid-utilisation-report.xlsx');
    utilisationReportUpload.continueButton().click();
    confirmAndSend.confirmAndSendButton().click();
  });

  it('Should render confirmation heading', () => {
    confirmation.mainHeading().should('exist');
  });

  it('Should route to the login page when the sign-out button is selected', () => {
    confirmation.signOutButton().click();

    confirmation.mainHeading().should('not.exist');
    confirmation.currentUrl().should('contain', '/login');
  });
});
