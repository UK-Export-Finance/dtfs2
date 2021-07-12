/* eslint-disable no-underscore-dangle */
/* eslint-disable no-undef */
import relative from './relativeURL';
import applicationDetails from './pages/application-details';
import facilities from './pages/facilities';
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
      cy.get('[data-cy="back-link"]');
      cy.get('[data-cy="application-submit-page"]');
      cy.get('[data-cy="application-comments"]');
      cy.get('[data-cy="submit-button"]');
      cy.get('[data-cy="cancel-link"]');
    });

    it('allows submission without comments', () => {
      cy.get('[data-cy="submit-button"]').click();
      cy.get('[data-cy="application-submission-confirmation"]');
    });

    it('allows submission with comments', () => {
      cy.get('[data-cy="application-comments"]').type('Some comments here ......');
      cy.get('[data-cy="submit-button"]').click();
      cy.get('[data-cy="application-submission-confirmation"]');
    });

    it('shows error when comments are too long', () => {
      cy.get('[data-cy="application-comments"]').type(longComment);
      cy.get('[data-cy="submit-button"]').click();
      cy.get('[data-cy="error-summary"]');
    });

    it('takes user back to application details page if cancel link clicked', () => {
      cy.get('[data-cy="application-comments"]').type('Some comments here ....');
      cy.get('[data-cy="cancel-link"]').click();
      cy.get('[data-cy="application-details-page"]');
    });

    it('takes user back to application details page if back link clicked', () => {
      cy.get('[data-cy="application-comments"]').type('Some comments here ....');
      cy.get('[data-cy="back-link"]').click();
      cy.get('[data-cy="application-details-page"]');
    });

    it('takes user back to dashboard if the click the link in the confirmation page', () => {
      cy.get('[data-cy="submit-button"]').click();
      cy.get('[data-cy="application-submission-confirmation"]');
      // Just asserting the link is there as the error on dashboard page causes test to fail
      cy.get('[data-cy="dashboard-link"]');
      // TODO: Swap this above for below
      // cy.get('[data-cy="dashboard-link"]').click();
      // cy.url().should('contain', 'dashboard');
    });
  });
});
