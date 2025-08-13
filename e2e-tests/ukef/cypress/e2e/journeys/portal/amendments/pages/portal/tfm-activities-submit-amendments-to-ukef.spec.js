import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { BUSINESS_SUPPORT_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import activitiesPage from '../../../../../../../../tfm/cypress/e2e/pages/activities/activitiesPage';

const { BANK1_MAKER1 } = MOCK_USERS;

const bankName = BANK1_MAKER1.bank.name;
const bankId = BANK1_MAKER1.bank.id;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE_1 = '20000';
const CHANGED_FACILITY_VALUE_2 = '30000';

context('Amendments - Multiple amendments - TFM activities should show portal amendment submitted activity', () => {
  let dealId;
  let facilityId;
  let applicationDetailsUrl;
  let tfmActivityPage;
  let amendmentId1;
  let amendmentId2;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE_1,
          applicationDetailsUrl,
          facilityId,
          dealId,
        });

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE_2,
          applicationDetailsUrl,
          facilityId,
          dealId,
        });

        amendmentId1 = `${createdFacility.details.ukefFacilityId}-001`;
        amendmentId2 = `${createdFacility.details.ukefFacilityId}-002`;

        tfmActivityPage = `${TFM_URL}/case/${dealId}/activity`;
      });
    });
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  beforeEach(() => {
    cy.clearSessionCookies();

    cy.visit(TFM_URL);
    cy.tfmLogin(BUSINESS_SUPPORT_USER_1);

    cy.visit(tfmActivityPage);
  });

  it('should display both activities on the timeline', () => {
    activitiesPage.activitiesTimeline().contains(`Amendment ${amendmentId1} Approved by ${bankName} ${bankId}`);
    activitiesPage.activitiesTimeline().contains(`Amendment ${amendmentId2} Approved by ${bankName} ${bankId}`);
  });
});
