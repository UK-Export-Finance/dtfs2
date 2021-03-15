/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import exportersAddress from './pages/exporters-address';
import CREDENTIALS from '../fixtures/credentials.json';

let applicationId;

context('Exporters Address Page', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        applicationId = body.items[2]._id; // 3rd application contains an exporter with address
      });
    cy.login(CREDENTIALS.MAKER);


    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationId}/exporters-address`));
  });

  describe('Visiting page', () => {
    it('displays the correct elements', () => {
      exportersAddress.backButton();
      exportersAddress.headingCaption();
      exportersAddress.mainHeading();
      exportersAddress.companyNameTitle();
      exportersAddress.registeredCompanyAddressTitle();
      exportersAddress.changeDetails();
      exportersAddress.yesRadioButton();
      exportersAddress.noRadioButton();
    });
  });

  // describe('Clicking on Continue button', () => {
  //   it('shows errors if no radio button has been selected', () => {
  //     automaticCover.continueButton().click();
  //     automaticCover.errorSummary();
  //     automaticCover.fieldError();
  //     automaticCover.automaticCoverTerm().its('length').should('be.gt', 0); // greater than
  //   });

  //   it('removes error message from field if a radio button has been selected', () => {
  //     automaticCover.trueRadioButton().first().click();
  //     automaticCover.continueButton().click();
  //     automaticCover.automaticCoverTerm().eq(0).siblings('[data-cy="automatic-cover-error"]').should('not.exist');
  //     automaticCover.automaticCoverTerm().eq(1).siblings('[data-cy="automatic-cover-error"]'); // second term
  //   });

  //   it('takes user to `not eligible for automatic cover` page if at least 1 FALSE field has been selected', () => {
  //     automaticCover.automaticCoverTerm().each(($el, index) => {
  //       if (index === 0) {
  //         $el.find('[data-cy="automatic-cover-false"]').click();
  //       } else {
  //         $el.find('[data-cy="automatic-cover-true"]').click();
  //       }
  //     });
  //     automaticCover.continueButton().click();
  //     cy.url().should('eq', relative(`/gef/application-details/${applicationId}/ineligible-automatic-cover`));
  //   });

  //   it('takes user to `automatic application details` page if all true fields have been selected', () => {
  //     automaticCover.automaticCoverTerm().each(($el) => {
  //       $el.find('[data-cy="automatic-cover-true"]').click();
  //     });
  //     automaticCover.continueButton().click();
  //     cy.url().should('eq', relative(`/gef/application-details/${applicationId}`));
  //   });

  //   it('takes user to `automatic application details` page if they click on the go back link', () => {
  //     automaticCover.saveGoBackLink().click();
  //     cy.url().should('eq', relative(`/gef/application-details/${applicationId}`));
  //   });
  // });
});
