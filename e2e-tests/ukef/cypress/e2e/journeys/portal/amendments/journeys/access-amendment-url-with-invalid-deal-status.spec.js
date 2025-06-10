import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import { PIM_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const CHANGED_FACILITY_VALUE = 20000;

context('Amendments - access amendment url when deal status is "Cancelled"', () => {
  let amendmentDetailsUrl;
  let dealId;
  let facilityId;

  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

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

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;

          cy.makerMakesPortalAmendmentRequest({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE,
          });
          cy.clickSubmitButton();

          cy.visit(TFM_URL);

          cy.tfmLogin(PIM_USER_1);

          const tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
          cy.visit(tfmDealPage);

          cy.submitDealCancellation({ dealId });
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
  });

  it('should navigate /not-found when going to the amendment details url', () => {
    cy.visit(relative(amendmentDetailsUrl));

    cy.url().should('eq', relative('/not-found'));
  });
});
