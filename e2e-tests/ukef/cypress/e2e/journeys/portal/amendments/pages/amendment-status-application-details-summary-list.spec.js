import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import dashboardDeals from '../../../../../../../portal/cypress/e2e/pages/dashboardDeals';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const mockFacility2 = {
  ...mockFacility,
  ukefFacilityId: '10000013',
};

const CHANGED_FACILITY_VALUE_1 = '20000';
const CHANGED_FACILITY_VALUE_2 = '30000';

context(`Amendments - Application details summary list - Amendment status for multiple facilities with different amendment statuses`, () => {
  let dealId;
  let facilityId1;
  let facilityId2;
  let applicationDetailsUrl;
  let amendmentDetailsUrl1;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      // create first facility
      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId1 = createdFacility.details._id;
      });

      // create second facility
      cy.createGefFacilities(dealId, [mockFacility2], BANK1_MAKER1).then((createdFacility) => {
        facilityId2 = createdFacility.details._id;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();
        cy.visit(applicationDetailsUrl);

        applicationPreview.makeAChangeButton(facilityId1).click();

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          amendmentDetailsUrl1 = `/gef/application-details/${dealId}/facilities/${facilityId1}/amendments/${amendmentId}/amendment-details`;

          cy.makerSubmitPortalAmendmentForReview({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE_1,
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
    dashboardDeals.row.link(dealId).click();
  });

  it('should not display the amendment status for the facility without an amendment', () => {
    applicationPreview.facilitySummaryListTable(0).amendmentStatusValue(facilityId2).should('not.exist');
    applicationPreview.facilitySummaryListTable(0).amendmentStatusAction().should('not.exist');
  });

  it(`should display the amendment status for the facility with a ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL} amendment`, () => {
    applicationPreview.facilitySummaryListTable(1).amendmentStatusValue(facilityId1).contains(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL);
    applicationPreview.facilitySummaryListTable(1).amendmentStatusValue(facilityId1).should('have.class', 'govuk-tag--blue');
    applicationPreview.facilitySummaryListTable(1).amendmentStatusAction().should('have.class', 'govuk-!-display-none');
  });

  it('should not show the amendment status for a draft amendment', () => {
    applicationPreview.makeAChangeButton(facilityId2).click();
    cy.visit(applicationDetailsUrl);

    applicationPreview.facilitySummaryListTable(0).amendmentStatusValue(facilityId2).should('not.exist');
    applicationPreview.facilitySummaryListTable(0).amendmentStatusAction().should('not.exist');
  });

  it(`should display the amendment status for the facility with a ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} amendment`, () => {
    cy.login(BANK1_CHECKER1);
    cy.visit(amendmentDetailsUrl1);
    cy.clickReturnToMakerButton();
    cy.clickSubmitButton();

    cy.login(BANK1_MAKER1);
    dashboardDeals.row.link(dealId).click();

    applicationPreview.facilitySummaryListTable(1).amendmentStatusValue(facilityId1).contains(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED);
    applicationPreview.facilitySummaryListTable(1).amendmentStatusValue(facilityId1).should('have.class', 'govuk-tag--blue');
    applicationPreview.facilitySummaryListTable(1).amendmentStatusAction().should('have.class', 'govuk-!-display-none');
  });

  it(`should display the amendment status for the facility with an ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED} amendment`, () => {
    applicationPreview.makeAChangeButton(facilityId2).click();

    cy.getAmendmentIdFromUrl().then((amendmentId) => {
      const submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId2}/amendments/${amendmentId}/approved-by-ukef`;
      const amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId2}/amendments/${amendmentId}/amendment-details`;

      const confirmSubmissionToUkefUrl = `/gef/application-details/${dealId}/facilities/${facilityId2}/amendments/${amendmentId}/submit-amendment-to-ukef`;

      cy.makerAndCheckerSubmitPortalAmendmentRequest({
        facilityValueExists: true,
        changedFacilityValue: CHANGED_FACILITY_VALUE_2,
        amendmentDetailsUrl,
        submittedUrl,
        confirmSubmissionToUkefUrl,
      });
    });

    cy.login(BANK1_MAKER1);
    dashboardDeals.row.link(dealId).click();

    applicationPreview.facilitySummaryListTable(1).amendmentStatusValue(facilityId2).contains(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED);
    applicationPreview.facilitySummaryListTable(1).amendmentStatusValue(facilityId2).should('have.class', 'govuk-tag--green');
    applicationPreview.facilitySummaryListTable(1).amendmentStatusAction().should('have.class', 'govuk-!-display-none');
  });
});
