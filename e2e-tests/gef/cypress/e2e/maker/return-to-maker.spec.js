import relative from '../relativeURL';
import { cancelLink, errorSummary, mainHeading, submitButton } from '../partials';
import returnToMaker from '../pages/return-to-maker';
import applicationPreview from '../pages/application-preview';
import applicationDetails from '../pages/application-details';
import { BANK1_CHECKER1, BANK1_MAKER1 } from '../../../../e2e-fixtures/portal-users.fixture';

let dealIds = [];
const issuedFacilityIds = [];
const unissuedFacilityIds = [];

context('Return to Maker', () => {
  before(() => {
    cy.loadData();
    cy.apiLogin(BANK1_CHECKER1)
      .then((token) => token)
      .then((token) => {
        return cy.apiFetchAllGefApplications(token).then(({ body }) => ({ body, token }));
      })
      .then(({ body, token }) => {
        dealIds = body.items.map((item) => item._id);

        cy.apiFetchAllFacilities(dealIds[2], token).then(({ body: facilitiesBody }) => {
          facilitiesBody.items.forEach((item) => {
            if (item.details.hasBeenIssued) {
              issuedFacilityIds.push(item.details._id);
            } else {
              unissuedFacilityIds.push(item.details._id);
            }
          });
        });
      });
  });

  beforeEach(() => {
    cy.apiLogin(BANK1_CHECKER1)
      .then((token) => token)
      .then((token) => {
        cy.apiSetApplicationStatus(dealIds[2], token, "Ready for Checker's approval");
      });

    cy.clearSessionCookies();
    cy.login(BANK1_CHECKER1);
    cy.saveSession();

    // Visit the page after login
    cy.visit(relative(`/gef/application-details/${dealIds[2]}/return-to-maker`));
  });

  describe('Return to maker', () => {
    it('displays the page as expected', () => {
      mainHeading();
      returnToMaker.comment();
      submitButton();
      cancelLink();
    });

    it("does not display for applications that aren't in checking state", () => {
      cy.visit(relative(`/gef/application-details/${dealIds[0]}/return-to-maker`));
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('submits without comments ', () => {
      cy.clickSubmitButton();
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('submits with comments', () => {
      cy.keyboardInput(returnToMaker.comment(), 'Test comment');
      cy.clickSubmitButton();
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('display an error when the comment is greater than 400 characters', () => {
      const longComment = 'a'.repeat(401);

      cy.keyboardInput(returnToMaker.comment(), longComment);
      cy.clickSubmitButton();
      errorSummary();
    });

    it('should allow submission after reducing comment from over 400 to under 400 characters', () => {
      // First, enter a comment that's too long
      const longComment = 'a'.repeat(401);
      cy.keyboardInput(returnToMaker.comment(), longComment);
      cy.clickSubmitButton();

      // Verify error is shown
      errorSummary();

      // Now fix the comment to be under the limit
      const validComment = 'a'.repeat(399);
      returnToMaker.comment().clear();
      cy.keyboardInput(returnToMaker.comment(), validComment);
      cy.clickSubmitButton();

      // Verify successful submission
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('should accept comment at 400 characters after normalizing Windows line endings', () => {
      const commentText = 'a'.repeat(399);
      cy.keyboardInput(returnToMaker.comment(), commentText);

      // Simulate pressing Enter which adds line ending
      returnToMaker.comment().type('{enter}');

      cy.clickSubmitButton();

      // Should successfully submit as server normalizes line endings
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('should normalize multiple Windows line endings correctly', () => {
      const commentWithLineBreaks = 'Line 1{enter}Line 2{enter}Line 3';
      cy.keyboardInput(returnToMaker.comment(), commentWithLineBreaks);

      cy.clickSubmitButton();

      // Should successfully submit with normalized line endings
      cy.location('pathname').should('contain', 'dashboard');
    });

    it('takes checker back to application preview page when cancelled', () => {
      cy.keyboardInput(returnToMaker.comment(), 'Some comments here ....');
      cy.clickCancelLink();
      cy.location('pathname').should('eq', `/gef/application-details/${dealIds[2]}`);
    });

    it('should not display make a change button on application when returned to maker and show delete facility links', () => {
      submitButton().click();

      cy.login(BANK1_MAKER1);
      cy.visit(relative(`/gef/application-details/${dealIds[2]}`));

      applicationPreview.makeAChangeButton(unissuedFacilityIds[0]).should('not.exist');
      applicationPreview.makeAChangeButton(unissuedFacilityIds[1]).should('not.exist');
      applicationPreview.makeAChangeButton(issuedFacilityIds[0]).should('not.exist');
      applicationPreview.makeAChangeButton(issuedFacilityIds[1]).should('not.exist');

      cy.assertText(applicationDetails.deleteFacilityLink().eq(0), 'Delete facility');
      cy.assertText(applicationDetails.deleteFacilityLink().eq(1), 'Delete facility');
      cy.assertText(applicationDetails.deleteFacilityLink().eq(2), 'Delete facility');
      cy.assertText(applicationDetails.deleteFacilityLink().eq(3), 'Delete facility');
    });
  });
});
