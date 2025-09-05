import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import amendmentsPage from '../../../../../../../../tfm/cypress/e2e/pages/amendments/amendmentsPage';
import { tomorrow, today } from '../../../../../../../../e2e-fixtures/dateConstants';
import facilityPage from '../../../../../../../../tfm/cypress/e2e/pages/facilityPage';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const mockFacility2 = {
  ...mockFacility,
  ukefFacilityId: '10000013',
};

const CHANGED_FACILITY_VALUE = '20000';
const CHANGE_FACILITY_VALUE_2 = '30000';

context('Amendments - TFM - Creating a TFM amendment with a future effective date', () => {
  let dealId;
  let facilityId1;
  let facilityId2;
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
      });

      cy.createGefFacilities(dealId, [mockFacility2], BANK1_MAKER1).then((createdFacility) => {
        facilityId2 = createdFacility.details._id;

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
          effectiveDate: today.date,
        });

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGE_FACILITY_VALUE_2,
          applicationDetailsUrl,
          facilityId: facilityId2,
          dealId,
          effectiveDate: tomorrow.date,
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
    cy.visit(TFM_URL);

    cy.tfmLogin(PIM_USER_1);
    cy.visit(tfmDealPage);
  });

  it.only('should display the create an amendment button for a portal amendment without a future effective date', () => {
    cy.visit(tfmFacilityPage1);

    facilityPage.facilityTabAmendments().click();

    amendmentsPage.addAmendmentButton().should('exist');
  });

  it('should not display the create an amendment button for a portal amendment with a future effective date', () => {
    cy.visit(tfmFacilityPage2);

    facilityPage.facilityTabAmendments().click();

    amendmentsPage.addAmendmentButton().should('not.exist');
  });
});
