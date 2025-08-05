import { getFormattedMonetaryValue, CURRENCY } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { UNDERWRITER_MANAGER_DECISIONS, PIM_USER_1, TFM_URL } from '../../../../../../../../e2e-fixtures';
import { twoYears, threeYears, today, DD_MMMM_YYYY_FORMAT, oneMonth } from '../../../../../../../../e2e-fixtures/dateConstants';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import facilityPage from '../../../../../../../../tfm/cypress/e2e/pages/facilityPage';
import amendmentsPage from '../../../../../../../../tfm/cypress/e2e/pages/amendments/amendmentsPage';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const CHANGED_FACILITY_VALUE = '20000';
const CHANGED_FACILITY_VALUE_1 = '30000';
const CHANGED_FACILITY_VALUE_2 = '40000';

context('Amendments - TFM - Amendments details page - TFM should display portal and TFM amendments on the amendment details page', () => {
  let dealId;
  let facilityId;
  let applicationDetailsUrl;
  let facilityUrl;
  let ukefFacilityId;
  let tfmDealPage;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;
      tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        ukefFacilityId = createdFacility.details.ukefFacilityId;

        facilityUrl = `${TFM_URL}/case/${dealId}/facility/${facilityId}`;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE,
          coverEndDateExists: true,
          changedCoverEndDate: twoYears.date,
          applicationDetailsUrl,
          facilityId,
          dealId,
        });

        cy.visit(TFM_URL);

        cy.tfmLogin(PIM_USER_1);
        cy.visit(tfmDealPage);

        cy.submitTfmAmendment({ dealId, facilityId, facilityValue: CHANGED_FACILITY_VALUE_1, coverEndDate: threeYears.date });

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE_2,
          coverEndDateExists: true,
          changedCoverEndDate: oneMonth.date,
          applicationDetailsUrl,
          facilityId,
          dealId,
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

    cy.visit(facilityUrl);
    facilityPage.facilityTabAmendments().click();
  });

  it('should display a row for the first portal amendment', () => {
    cy.assertText(amendmentsPage.amendmentDetails.row(1).heading(), `Amendment ${ukefFacilityId}-001`);
    cy.assertText(amendmentsPage.amendmentDetails.row(1).effectiveDate(), today.dd_MMMM_yyyy);
    cy.assertText(amendmentsPage.amendmentDetails.row(1).requireApproval(), 'No');

    cy.assertText(amendmentsPage.amendmentDetails.row(1).currentCoverEndDate(), format(new Date(mockFacility.coverEndDate), DD_MMMM_YYYY_FORMAT));
    cy.assertText(amendmentsPage.amendmentDetails.row(1).newCoverEndDate(), twoYears.dd_MMMM_yyyy);
    cy.assertText(amendmentsPage.amendmentDetails.row(1).ukefDecisionCoverEndDate(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);

    cy.assertText(amendmentsPage.amendmentDetails.row(1).currentFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(mockFacility.value, 2)}`);
    cy.assertText(amendmentsPage.amendmentDetails.row(1).newFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, 2)}`);
    cy.assertText(amendmentsPage.amendmentDetails.row(1).ukefDecisionFacilityValue(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);
  });

  it('should display a row for the second TFM amendment', () => {
    cy.assertText(amendmentsPage.amendmentDetails.row(2).heading(), `Amendment ${ukefFacilityId}-002`);
    cy.assertText(amendmentsPage.amendmentDetails.row(2).effectiveDate(), today.dd_MMMM_yyyy);
    cy.assertText(amendmentsPage.amendmentDetails.row(2).requireApproval(), 'No');

    cy.assertText(amendmentsPage.amendmentDetails.row(2).currentCoverEndDate(), twoYears.dd_MMMM_yyyy);
    cy.assertText(amendmentsPage.amendmentDetails.row(2).newCoverEndDate(), threeYears.dd_MMMM_yyyy);
    cy.assertText(amendmentsPage.amendmentDetails.row(2).ukefDecisionCoverEndDate(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);

    cy.assertText(amendmentsPage.amendmentDetails.row(2).currentFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, 2)}`);
    cy.assertText(amendmentsPage.amendmentDetails.row(2).newFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_1, 2)}`);
    cy.assertText(amendmentsPage.amendmentDetails.row(2).ukefDecisionFacilityValue(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);
  });

  it('should display a row for the third TFM amendment', () => {
    cy.assertText(amendmentsPage.amendmentDetails.row(3).heading(), `Amendment ${ukefFacilityId}-003`);
    cy.assertText(amendmentsPage.amendmentDetails.row(3).effectiveDate(), today.dd_MMMM_yyyy);
    cy.assertText(amendmentsPage.amendmentDetails.row(3).requireApproval(), 'No');

    cy.assertText(amendmentsPage.amendmentDetails.row(3).currentCoverEndDate(), threeYears.dd_MMMM_yyyy);
    cy.assertText(amendmentsPage.amendmentDetails.row(3).newCoverEndDate(), oneMonth.dd_MMMM_yyyy);
    cy.assertText(amendmentsPage.amendmentDetails.row(3).ukefDecisionCoverEndDate(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);

    cy.assertText(amendmentsPage.amendmentDetails.row(3).currentFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_1, 2)}`);
    cy.assertText(amendmentsPage.amendmentDetails.row(3).newFacilityValue(), `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_2, 2)}`);
    cy.assertText(amendmentsPage.amendmentDetails.row(3).ukefDecisionFacilityValue(), UNDERWRITER_MANAGER_DECISIONS.AUTOMATIC_APPROVAL);
  });
});
