import { format } from 'date-fns';
import { getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { tomorrow, today, D_MMMM_YYYY_FORMAT } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;
const CHANGED_FACILITY_VALUE_1 = '20000';
const CHANGED_FACILITY_VALUE_2 = '30000';
const facilityEndDate = tomorrow.date;
const coverEndDate = tomorrow.date;

context('Approved amendments - bank review date to facility end date - Deal summary page', () => {
  let dealId;
  let issuedCashFacilityId;
  let applicationDetailsUrl;

  const issuedCashFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [issuedCashFacility], BANK1_MAKER1).then((createdFacility) => {
        issuedCashFacilityId = createdFacility.details._id;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();

        cy.visit(relative(applicationDetailsUrl));
        applicationPreview.makeAChangeButton(issuedCashFacilityId).click();

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          coverEndDateExists: true,
          facilityValueExists: true,
          facilityEndDateExists: false,
          changedFacilityValue: CHANGED_FACILITY_VALUE_1,
          changedCoverEndDate: tomorrow.date,
          applicationDetailsUrl,
          facilityId: issuedCashFacilityId,
          dealId,
          effectiveDate: today.date,
        });

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          coverEndDateExists: true,
          facilityValueExists: true,
          facilityEndDateExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE_2,
          changedCoverEndDate: tomorrow.date,
          applicationDetailsUrl,
          facilityId: issuedCashFacilityId,
          dealId,
          effectiveDate: today.date,
        });
      });
    });
  });

  describe('when a user logs in as a Maker', () => {
    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_MAKER1);
      cy.visit(relative(applicationDetailsUrl));
    });

    after(() => {
      cy.clearCookies();
      cy.clearSessionCookies();
    });

    it('should not display the "Amendement details" link in the notification banner', () => {
      applicationPreview.amendmentDetailsHeaderReadyForCheckers().should('not.exist');
    });

    it('should not display "Amendment in progress: See details" link in the facility section', () => {
      applicationPreview.amendmentInProgress().should('not.exist');
    });

    it('should display the latest updated amendment value on facility summary list', () => {
      applicationPreview.facilitySummaryList().contains(getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_2, false));
      applicationPreview.facilitySummaryList().contains(format(coverEndDate, D_MMMM_YYYY_FORMAT));
      applicationPreview.facilitySummaryList().contains(format(facilityEndDate, D_MMMM_YYYY_FORMAT));
    });
  });

  describe('when a user logs in as a Checker', () => {
    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_CHECKER1);
      cy.visit(relative(`/gef/application-details/${dealId}`));
    });

    after(() => {
      cy.clearCookies();
      cy.clearSessionCookies();
    });

    it('should not display the "Check amendment details before submitting to UKEF" link in the notification banner', () => {
      applicationPreview.amendmentDetailsHeaderReadyForCheckers().should('not.exist');
    });

    it('should not display "Amendment in progress: Check amendment details before submitting to UKEF" link in the facility section', () => {
      applicationPreview.amendmentInProgress().should('not.exist');
    });

    it('should display the latest updated amendment value on facility summary list', () => {
      applicationPreview.facilitySummaryList().contains(getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_2, false));
      applicationPreview.facilitySummaryList().contains(format(coverEndDate, D_MMMM_YYYY_FORMAT));
      applicationPreview.facilitySummaryList().contains(format(facilityEndDate, D_MMMM_YYYY_FORMAT));
    });
  });
});
