import { tomorrow } from '@ukef/dtfs2-common/test-helpers';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import amendmentsPage from '../../../../../../../../tfm/cypress/e2e/pages/amendments/amendmentsPage';
import facilityPage from '../../../../../../../../tfm/cypress/e2e/pages/facilityPage';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const mockFacility2 = {
  ...mockFacility,
  ukefFacilityId: '10000013',
};

const CHANGED_FACILITY_VALUE = '20000';
const CHANGE_FACILITY_VALUE_2 = '30000';

context('Amendments - TFM - TFM should not display banners when there are portal amendments with future effective dates and the deal is cancelled', () => {
  let dealId;
  let facilityId1;
  let facilityId2;
  let ukefFacilityId1;
  let ukefFacilityId2;
  let applicationDetailsUrl;
  let tfmDealPage;
  let tfmFacilityPage1;
  let tfmFacilityPage2;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId1 = createdFacility.details._id;
        ukefFacilityId1 = createdFacility.details.ukefFacilityId;
      });

      cy.createGefFacilities(dealId, [mockFacility2], BANK1_MAKER1).then((createdFacility) => {
        facilityId2 = createdFacility.details._id;
        ukefFacilityId2 = createdFacility.details.ukefFacilityId;

        tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
        tfmFacilityPage1 = `${TFM_URL}/case/${dealId}/facility/${facilityId1}`;
        tfmFacilityPage2 = `${TFM_URL}/case/${dealId}/facility/${facilityId2}`;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE,
          applicationDetailsUrl,
          facilityId: facilityId1,
          dealId,
          effectiveDate: tomorrow.date,
        });

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGE_FACILITY_VALUE_2,
          applicationDetailsUrl,
          facilityId: facilityId2,
          dealId,
          effectiveDate: tomorrow.date,
        });

        cy.visit(TFM_URL);

        cy.tfmLogin(PIM_USER_1);

        cy.visit(tfmDealPage);

        cy.submitDealCancellation({ dealId });
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
    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);
    cy.visit(tfmDealPage);
  });

  it('should not display the future effective date banners twice on the deal', () => {
    amendmentsPage.amendmentFutureEffectiveDateDealBar(ukefFacilityId1).should('not.exist');

    amendmentsPage.amendmentFutureEffectiveDateDealLink(ukefFacilityId1).should('not.exist');

    amendmentsPage.amendmentFutureEffectiveDateDealBar(ukefFacilityId2).should('not.exist');

    amendmentsPage.amendmentFutureEffectiveDateDealLink(ukefFacilityId2).should('not.exist');
  });

  it('should not display the future effective date banner on the facility', () => {
    cy.visit(tfmFacilityPage1);
    amendmentsPage.amendmentFutureEffectiveDateFacilityBar().should('not.exist');

    cy.visit(tfmFacilityPage2);
    amendmentsPage.amendmentFutureEffectiveDateFacilityBar().should('not.exist');
  });

  it('should not display the future effective date banner on the amendment tab', () => {
    cy.visit(tfmFacilityPage1);
    facilityPage.facilityTabAmendments().click();
    amendmentsPage.amendmentFutureEffectiveDateAmendmentBar().should('not.exist');

    cy.visit(tfmFacilityPage2);
    facilityPage.facilityTabAmendments().click();
    amendmentsPage.amendmentFutureEffectiveDateAmendmentBar().should('not.exist');
  });
});
