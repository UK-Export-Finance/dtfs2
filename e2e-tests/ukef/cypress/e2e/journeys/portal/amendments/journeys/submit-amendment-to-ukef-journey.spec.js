import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '20000';

context('Amendments - Submit Amendment to UKEF journey', () => {
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
          submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}`;
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
  });

  it('should submit the amendment to Ukef', () => {
    const approvedByUkefUrl = `${submittedUrl}/approved-by-ukef`;

    cy.checkerSubmitsPortalAmendmentRequest({ submittedUrl: approvedByUkefUrl, amendmentDetailsUrl });

    cy.url().should('eq', relative(approvedByUkefUrl));
  });
});
