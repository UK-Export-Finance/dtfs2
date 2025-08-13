import relative from '../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../gef/cypress/e2e/pages';
import { tomorrow } from '../../../../../../../../e2e-fixtures/dateConstants';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendment effective in future - Deal summary page', () => {
  const CHANGED_FACILITY_VALUE = '10000';
  let dealId;
  let issuedCashFacilityId;
  let amendmentDetailsUrl;

  const issuedCashFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [issuedCashFacility], BANK1_MAKER1).then((createdFacility) => {
        issuedCashFacilityId = createdFacility.details._id;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();

        cy.visit(relative(`/gef/application-details/${dealId}`));
        applicationPreview.makeAChangeButton(issuedCashFacilityId).click();

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          const submittedUrl = `/gef/application-details/${dealId}/facilities/${issuedCashFacilityId}/amendments/${amendmentId}/approved-by-ukef`;
          amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${issuedCashFacilityId}/amendments/${amendmentId}/amendment-details`;

          const confirmSubmissionToUkefUrl = `/gef/application-details/${dealId}/facilities/${issuedCashFacilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;

          cy.makerAndCheckerSubmitPortalAmendmentRequest({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE,
            effectiveDate: tomorrow.date,
            amendmentDetailsUrl,
            submittedUrl,
            confirmSubmissionToUkefUrl,
          });
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
    cy.login(BANK1_MAKER1);
    cy.visit(relative(`/gef/application-details/${dealId}`));
  });

  it('should display the banner with "See details" link in the facility section', () => {
    applicationPreview.amendmentEffectiveFutureLink().should('have.attr', 'href', amendmentDetailsUrl);
    cy.assertText(applicationPreview.amendmentEffectiveFutureLink(), 'See details');
    cy.assertText(
      applicationPreview.amendmentEffectiveFutureBanner(),
      `There is an amendment on this facility effective on ${tomorrow.d_MMMM_yyyy}. See details`,
    );
  });
});
