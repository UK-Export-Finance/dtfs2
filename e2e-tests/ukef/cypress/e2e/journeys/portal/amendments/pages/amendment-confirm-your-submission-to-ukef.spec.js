import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview, submitToUkef } from '../../../../../../../gef/cypress/e2e/pages';
import { cancelLink, errorSummary, mainHeading, submitButton } from '../../../../../../../gef/cypress/e2e/partials';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '20000';

context('Amendments - confirm you submission page', () => {
  let dealId;
  let facilityId;
  let amendmentDetailsUrl;
  let submittedUrl;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();
        cy.visit(relative(`/gef/application-details/${dealId}`));
        amendmentDetailsUrl = `/gef/application-details/${dealId}/amendment-details`;

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;
          cy.makerMakesPortalAmendmentRequest({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE,
          });
          cy.clickSubmitButton();
        });
      });
    });
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_CHECKER1);
    cy.visit(submittedUrl);
  });

  it('should display the page as expected', () => {
    mainHeading().contains('Confirm your submission');
    submitToUkef.mainText().contains('you have reviewed the information given');
    submitToUkef.mainText().contains('you want to proceed with the submission');

    submitToUkef.confirmSubmission().contains('I understand and agree');
    submitToUkef.confirmSubmissionCheckbox();
    submitToUkef
      .confirmSubmissionCheckbox()
      .invoke('attr', 'aria-label')
      .then((label) => {
        expect(label).to.equal(
          'Confirm your submission, By submitting to UKEF you confirm that: you have reviewed the information given and you want to proceed with the submission, I understand and agree',
        );
      });
    submitButton();
    cancelLink();
  });

  it('should display an error when the confirmation checkbox is not checked', () => {
    cy.clickSubmitButton();
    errorSummary().contains('Select that you have reviewed the information given and want to proceed with the submission');
    cy.get('[id="confirmSubmitUkef-error"]').contains('Select that you have reviewed the information given and want to proceed with the submission');
  });

  it('should redirect to the dashboard when clicking the back link', () => {
    submitToUkef.backLink().click();
    cy.url().should('eq', relative(amendmentDetailsUrl));
  });

  it('should take checker back to application review page when cancelled', () => {
    cancelLink().click();
    cy.location('pathname').should('eq', `/gef/application-details/${dealId}`);
  });
});
