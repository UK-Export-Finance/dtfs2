/* eslint-disable no-undef */
import relative from './relativeURL';
import mandatoryCriteria from './pages/mandatory-criteria';
import nameApplication from './pages/name-application';
import applicationDetails from './pages/application-details';

context('Application Details Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.fixture('login')
      .then((res) => {
        cy.login(res.MAKER);
      });

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative('/gef/mandatory-criteria'));
    mandatoryCriteria.trueRadio().click();
    mandatoryCriteria.form().submit();
    nameApplication.internalRef().type('NEW_REF_NAME');
    nameApplication.form().submit();
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      applicationDetails.applicationDetailsPage();
      applicationDetails.captionHeading();
      applicationDetails.mainHeading();
    });
  });

  // describe('Clicking on Back Button', () => {
  //   it('redirects user to ** page', () => {
  //     ineligible.backButton().click();
  //     cy.url().should('eq', relative('/gef/ineligible'));
  //   });
  // });
});
