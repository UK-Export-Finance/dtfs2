import relative from '../../relativeURL';
import { submitButton } from '../../partials';
import applicationDetails from '../../pages/application-details';
import applicationSubmission from '../../pages/application-submission';
import { BANK1_MAKER1, BANK1_MAKER_CHECKER1 } from '../../../../../e2e-fixtures/portal-users.fixture';
import applicationPreview from '../../pages/application-preview';

context('Create application as MAKER, edit as MAKER_CHECKER, submit application to UKEF as MAKER_CHECKER', () => {
  const dealIds = [];

  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_MAKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiFetchAllGefApplications(token);
      })
      .then(({ body }) => {
        body.items.forEach((item) => {
          dealIds.push(item._id);
        });
      });
  });

  beforeEach(() => {
    cy.saveSession();
  });

  describe('BANK1_MAKER1 makes application, MAKER_CHECKER edits only eligibility criteria, MAKER_CHECKER should not be able to submit to ukef', () => {
    it('does not allow MAKER_CHECKER to submit own edited deals', () => {
      // login as a maker and submit
      cy.login(BANK1_MAKER_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      // Make the deal an Automatic Inclusion Application
      applicationDetails.automaticCoverDetailsLink().click();
      cy.automaticEligibilityCriteria();
      cy.clickSaveAndReturnButton();

      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      // submit the deal
      cy.clickSubmitButton();
      cy.keyboardInput(applicationSubmission.commentsField(), 'DTFS2-4698 Comments from original maker');
      cy.clickSubmitButton();
      applicationSubmission.confirmationPanelTitle();

      // login as a MAKER_CHECKER and return to the maker with a comment.
      cy.login(BANK1_MAKER_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));
      applicationPreview.returnButton().should('not.exist');
      submitButton().should('not.exist');
    });
  });
});
