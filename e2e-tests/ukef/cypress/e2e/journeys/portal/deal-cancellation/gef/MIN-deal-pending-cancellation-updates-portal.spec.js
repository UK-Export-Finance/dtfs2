import { DEAL_STATUS, PORTAL_ACTIVITY_LABEL, UKEF } from '@ukef/dtfs2-common';
import relative from '../../../../relativeURL';
import applicationActivities from '../../../../../../../gef/cypress/e2e/pages/application-activities';
import statusBanner from '../../../../../../../gef/cypress/e2e/pages/application-status-banner';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_MIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { today, tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1 } = MOCK_USERS;

context('GEF MIN deal - When TFM submits a pending deal cancellation - Portal status and activity feed should be updated', () => {
  let gefDeal;
  let dealId;

  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_MIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      gefDeal = insertedDeal;
      dealId = gefDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_MIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacilities) => {
        gefDeal.facilities = createdFacilities;
        cy.makerLoginSubmitGefDealForReview(gefDeal);
        cy.checkerLoginSubmitGefDealToUkef(gefDeal);
        cy.clearSessionCookies();

        cy.visit(TFM_URL);
        cy.tfmLogin(PIM_USER_1);

        const effectiveDate = tomorrow.date;

        cy.submitDealCancellation({ dealId, effectiveDate });

        cy.getOneGefDeal(dealId, BANK1_MAKER1).then((latestDeal) => {
          gefDeal = latestDeal;
        });
      });
    });
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_MAKER1);

    cy.visit(relative(`/gef/application-details/${dealId}`));

    applicationActivities.subNavigationBarActivities().click();
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  it('should update the deal status', () => {
    cy.assertText(statusBanner.bannerStatus(), DEAL_STATUS.PENDING_CANCELLATION);
  });

  describe('activity feed', () => {
    describe(PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_SCHEDULED, () => {
      const activity = PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_SCHEDULED;

      it('should render an activity title', () => {
        const expected = activity;

        cy.assertText(applicationActivities.title(activity), expected);
      });

      it('should render an activity byline', () => {
        const expected = `by ${UKEF.ACRONYM}`;

        cy.assertText(applicationActivities.byline(activity), expected);
      });

      it('should render a date', () => {
        // NOTE: we cannot reliably assert the time - only the date.
        // Otherwise, tests could often fail if the test is run e.g 10 seconds before a new minute.
        applicationActivities.date(activity).contains(today.d_MMMM_yyyy);
      });
    });

    describe(PORTAL_ACTIVITY_LABEL.MIN_SUBMISSION, () => {
      const activity = PORTAL_ACTIVITY_LABEL.MIN_SUBMISSION;

      it('should render an activity title', () => {
        const expected = activity;

        cy.assertText(applicationActivities.title(activity), expected);
      });
    });
  });
});
