import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import returnToMaker from '../../../../../../../gef/cypress/e2e/pages/return-to-maker';
import applicationDetails from '../../../../../../../gef/cypress/e2e/pages/application-details';
import { errorSummary } from '../../../../../../../gef/cypress/e2e/partials';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '20000';

const comment = 'Test comment';

context('Amendments - return amendment to maker with comments', () => {
  let dealId;
  let facilityId;
  let dealUrl;
  let amendmentDetailsUrl;
  let returnToMakerUrl;
  let returnedToMakerUrl;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        dealUrl = `/gef/application-details/${dealId}`;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();
        cy.visit(relative(dealUrl));

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;

          returnToMakerUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/return-to-maker`;
          returnedToMakerUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/returned-to-maker`;
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
    cy.visit(amendmentDetailsUrl);
    cy.clickReturnToMakerButton();
  });

  it('should redirect to the "Return to maker" page', () => {
    cy.url().should('eq', relative(returnToMakerUrl));
  });

  it('should display an error when entering a comment greater than 400 characters', () => {
    const longComment = 'a'.repeat(401);

    cy.keyboardInput(returnToMaker.comment(), longComment);
    cy.clickSubmitButton();
    errorSummary();
  });

  it('should redirect to returned to maker confirmation page', () => {
    cy.keyboardInput(returnToMaker.comment(), comment);
    cy.clickSubmitButton();

    cy.url().should('eq', relative(returnedToMakerUrl));
  });

  it('should display the comment on application preview page', () => {
    cy.login(BANK1_MAKER1);
    cy.visit(relative(dealUrl));

    applicationDetails.comments().should('contain', comment);
  });
});
