import { getFormattedMonetaryValue, PORTAL_AMENDMENT_STATUS, CURRENCY } from '@ukef/dtfs2-common';
import relative from '../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../gef/cypress/e2e/pages';
import amendmentSummaryList from '../../../../../../../../gef/cypress/e2e/pages/amendments/amendment-summary-list';
import dashboardDeals from '../../../../../../../../portal/cypress/e2e/pages/dashboardDeals';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const mockFacility2 = {
  ...mockFacility,
  ukefFacilityId: '10000013',
};

const CHANGED_FACILITY_VALUE_1 = '20000';
const CHANGED_FACILITY_VALUE_2 = '30000';

context(
  `Amendments - Multiple ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL} amendments - Application details displays correct task comments headings`,
  () => {
    let dealId;
    let facilityId1;
    let facilityId2;
    let applicationDetailsUrl;
    let amendmentDetailsUrl1;
    let amendmentDetailsUrl2;
    let ukefFacilityId1;
    let ukefFacilityId2;

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

          cy.visit(applicationDetailsUrl);
          applicationPreview.makeAChangeButton(facilityId2).click();

          cy.getAmendmentIdFromUrl().then((amendmentId) => {
            amendmentDetailsUrl2 = `/gef/application-details/${dealId}/facilities/${facilityId2}/amendments/${amendmentId}/amendment-details`;

            cy.makerSubmitPortalAmendmentForReview({
              facilityValueExists: true,
              changedFacilityValue: CHANGED_FACILITY_VALUE_2,
            });
          });
        });

        ukefFacilityId1 = mockFacility.ukefFacilityId;
        ukefFacilityId2 = mockFacility2.ukefFacilityId;
      });
    });

    after(() => {
      cy.clearCookies();
      cy.clearSessionCookies();
    });

    describe('As a maker', () => {
      beforeEach(() => {
        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        dashboardDeals.row.link(dealId).click();
      });

      it('should display 2 amendments with correct heading in task comments section', () => {
        cy.assertText(applicationPreview.amendmentDetailsHeaderReadyForCheckers(), PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL);
        cy.assertText(applicationPreview.amendmentDetailsReadyForCheckerLink(1), `Facility (${ukefFacilityId2}) amendment details`);
        cy.assertText(applicationPreview.amendmentDetailsReadyForCheckerLink(2), `Facility (${ukefFacilityId1}) amendment details`);
      });

      it(`should NOT display the ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL} heading`, () => {
        applicationPreview.amendmentDetailsHeaderFurtherMakersInput().should('not.exist');
      });

      it('should display the correct amendment details for the first amendment when clicking on the link', () => {
        applicationPreview.amendmentDetailsReadyForCheckerLink(1).click();

        cy.url().should('eq', relative(amendmentDetailsUrl2));

        cy.assertText(
          amendmentSummaryList.amendmentSummaryListTable().facilityValueValue(),
          `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_2)}`,
        );
      });

      it('should display the correct amendment details for the second amendment when clicking on the link', () => {
        applicationPreview.amendmentDetailsReadyForCheckerLink(2).click();

        cy.url().should('eq', relative(amendmentDetailsUrl1));

        cy.assertText(
          amendmentSummaryList.amendmentSummaryListTable().facilityValueValue(),
          `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_1)}`,
        );
      });
    });

    describe('As a checker', () => {
      beforeEach(() => {
        cy.clearSessionCookies();
        cy.login(BANK1_CHECKER1);
        dashboardDeals.row.link(dealId).click();
      });

      it('should display 2 amendments with correct heading in task comments section', () => {
        cy.assertText(applicationPreview.amendmentDetailsHeaderReadyForCheckers(), PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL);
        cy.assertText(applicationPreview.amendmentDetailsReadyForCheckerLink(1), `Facility (${ukefFacilityId2}) amendment details`);
        cy.assertText(applicationPreview.amendmentDetailsReadyForCheckerLink(2), `Facility (${ukefFacilityId1}) amendment details`);
      });

      it(`should not display the ${PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED} heading`, () => {
        applicationPreview.amendmentDetailsHeaderFurtherMakersInput().should('not.exist');
      });

      it('should display the correct amendment details for the first amendment when clicking on the link', () => {
        applicationPreview.amendmentDetailsReadyForCheckerLink(1).click();

        cy.url().should('eq', relative(amendmentDetailsUrl2));

        cy.assertText(
          amendmentSummaryList.amendmentSummaryListTable().facilityValueValue(),
          `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_2)}`,
        );
      });

      it('should display the correct amendment details for the second amendment when clicking on the link', () => {
        applicationPreview.amendmentDetailsReadyForCheckerLink(2).click();

        cy.url().should('eq', relative(amendmentDetailsUrl1));

        cy.assertText(
          amendmentSummaryList.amendmentSummaryListTable().facilityValueValue(),
          `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_1)}`,
        );
      });
    });
  },
);
