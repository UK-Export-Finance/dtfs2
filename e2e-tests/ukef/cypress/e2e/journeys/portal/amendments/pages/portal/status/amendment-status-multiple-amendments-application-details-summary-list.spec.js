import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview, submitToUkef } from '../../../../../../../../../gef/cypress/e2e/pages';
import dashboardDeals from '../../../../../../../../../portal/cypress/e2e/pages/dashboardDeals';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '10000';

context(`Amendments - Application details summary list - Amendment status for multiple amendments on same facility`, () => {
  let dealId;
  let facilityId;
  let submittedUrl;
  let amendmentDetailsUrl;

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
          submittedUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/approved-by-ukef`;
          amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;

          const confirmSubmissionToUkefUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment-to-ukef`;

          cy.makerAndCheckerSubmitPortalAmendmentRequest({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE,
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
    dashboardDeals.row.link(dealId).click();
  });

  it(`should display the amendment status for the facility with an ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED} amendment`, () => {
    applicationPreview.facilitySummaryListTable(0).amendmentStatusValue(facilityId).contains(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED);
    applicationPreview.facilitySummaryListTable(0).amendmentStatusValue(facilityId).should('have.class', 'govuk-tag--green');
    applicationPreview.facilitySummaryListTable(0).amendmentStatusAction().should('have.class', 'govuk-!-display-none');
  });

  it(`should display the amendment status for the facility with an ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL} amendment`, () => {
    applicationPreview.makeAChangeButton(facilityId).click();

    cy.getAmendmentIdFromUrl().then((amendmentId) => {
      amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;

      cy.makerSubmitPortalAmendmentForReview({ changedFacilityValue: CHANGED_FACILITY_VALUE, facilityValueExists: true });
    });

    cy.login(BANK1_MAKER1);
    dashboardDeals.row.link(dealId).click();

    applicationPreview.facilitySummaryListTable(0).amendmentStatusValue(facilityId).contains(PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL);
    applicationPreview.facilitySummaryListTable(0).amendmentStatusValue(facilityId).should('have.class', 'govuk-tag--blue');
    applicationPreview.facilitySummaryListTable(0).amendmentStatusAction().should('have.class', 'govuk-!-display-none');
  });

  it(`should display the amendment status for the facility with an ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} amendment`, () => {
    cy.login(BANK1_CHECKER1);
    cy.visit(amendmentDetailsUrl);
    cy.clickReturnToMakerButton();
    cy.clickSubmitButton();

    cy.login(BANK1_MAKER1);
    dashboardDeals.row.link(dealId).click();

    applicationPreview.facilitySummaryListTable(0).amendmentStatusValue(facilityId).contains(PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED);
    applicationPreview.facilitySummaryListTable(0).amendmentStatusValue(facilityId).should('have.class', 'govuk-tag--blue');
    applicationPreview.facilitySummaryListTable(0).amendmentStatusAction().should('have.class', 'govuk-!-display-none');
  });

  it(`should display the amendment status for the facility with an ${PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED} amendment`, () => {
    cy.login(BANK1_MAKER1);
    cy.visit(amendmentDetailsUrl);
    cy.clickSubmitButton();

    cy.login(BANK1_CHECKER1);
    cy.visit(amendmentDetailsUrl);
    cy.clickSubmitButton();
    submitToUkef.confirmSubmissionCheckbox().click();
    cy.clickSubmitButton();

    cy.login(BANK1_MAKER1);
    dashboardDeals.row.link(dealId).click();

    applicationPreview.facilitySummaryListTable(0).amendmentStatusValue(facilityId).contains(PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED);
    applicationPreview.facilitySummaryListTable(0).amendmentStatusValue(facilityId).should('have.class', 'govuk-tag--green');
    applicationPreview.facilitySummaryListTable(0).amendmentStatusAction().should('have.class', 'govuk-!-display-none');
  });
});
