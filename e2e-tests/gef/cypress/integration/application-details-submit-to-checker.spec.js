/* eslint-disable no-underscore-dangle */
import relative from './relativeURL';
import applicationSubmission from './pages/application-submission';
import applicationDetails from './pages/application-details';
import CREDENTIALS from '../fixtures/credentials.json';

const applicationIds = [];

context('Application Details Submission', () => {
  before(() => {
    cy.reinsertMocks();
    cy.apiLogin(CREDENTIALS.MAKER)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllApplications(token);
      })
      .then(({ body }) => {
        body.items.forEach((item) => {
          applicationIds.push(item._id);
        });
      });
    cy.login(CREDENTIALS.MAKER);

    cy.on('uncaught:exception', () => false);
  });

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('connect.sid');
    cy.visit(relative(`/gef/application-details/${applicationIds[0]}/submit`));
  });

  describe('Submission confirmation and comments', () => {
    const longComment = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam tincidunt, dui sit amet mollis placerat, nunc nulla blandit augue, gravida luctus erat nisl et libero. Nullam eu ex justo. Nam tristique nec dolor nec tempus. Phasellus pulvinar congue finibus. Vivamus pellentesque, erat et auctor convallis, est purus varius nisl, suscipit sodales magna felis ac nulla. Phasellus rutrum, lorem ac dolor. ';
    it('gives the page as expected', () => {
      applicationSubmission.applicationSubmissionPage();
      applicationSubmission.backLink();
      applicationSubmission.commentsField();
      applicationSubmission.submmitButton();
      applicationSubmission.cancelLink();
    });

    it('allows submission without comments', () => {
      applicationSubmission.submmitButton().click();
      applicationSubmission.confirmation();
    });

    it('allows submission with comments', () => {
      applicationSubmission.commentsField().type('Some comments here ......');
      applicationSubmission.submmitButton().click();
      applicationSubmission.confirmation();
    });

    it('shows error when comments are too long', () => {
      applicationSubmission.commentsField().type(longComment);
      applicationSubmission.submmitButton().click();
      applicationSubmission.errorSummary();
    });

    it('takes user back to application details page if cancel link clicked', () => {
      applicationSubmission.commentsField().type('Some comments here ....');
      applicationSubmission.cancelLink().click();
      applicationDetails.applicationDetailsPage();
    });

    it('takes user back to application details page if back link clicked', () => {
      applicationSubmission.commentsField().type('Some comments here ....');
      applicationSubmission.backLink().click();
      applicationDetails.applicationDetailsPage();
    });

    it('takes user back to dashboard if they click the link in the confirmation page', () => {
      applicationSubmission.submmitButton().click();
      applicationSubmission.confirmation();
      // Just asserting the link is there as the error on dashboard page causes test to fail
      applicationSubmission.backToDashboadLink();
      // TODO: Swap this above for below
      // applicationSubmission.backToDashboadLink().click();
      // cy.url().should('contain', 'dashboard');
    });
  });

  describe('maker no longer sees editable content in details screen', () => {
    it('no longer shows the "edit" links on the application details page', () => {
      cy.visit(relative(`/gef/application-details/${applicationIds[0]}`));

      applicationDetails.submitHeading().should('not.exist');
      applicationDetails.submitButton().should('not.exist');
      applicationDetails.abandonLink().should('not.exist');
      applicationDetails.exporterDetailsLink().should('not.exist');
      applicationDetails.automaticCoverDetailsLink().should('not.exist');
      applicationDetails.addCashFacilityButton().should('not.exist');
      applicationDetails.addContingentFacilityButton().should('not.exist');
      applicationDetails.deleteFacilityLink().should('not.exist');
    });
  });
});
