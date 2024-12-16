import { PORTAL_ACTIVITY_LABEL, TFM_URL, UKEF } from '@ukef/dtfs2-common';
import relative from '../../../../relativeURL';
import applicationActivities from '../../../../../../../gef/cypress/e2e/pages/application-activities';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { today, tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';
import { PIM_USER_1 } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1 } = MOCK_USERS;

// TODO: check, align other BSS-EWCS test descriptions
// TODO: remove "future" from cancellation tests - it's not the future, it's "now"

// TODO - add cancellation status checks? don't seem to have tests for this.

context('When an AIN GEF deal is pending cancellation in TFM - GEF activity feed should be updated', () => {
  let gefDeal;
  let dealId;

  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      gefDeal = insertedDeal;
      dealId = gefDeal._id;

      // updates a gef deal to have relevant fields
      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacilities) => {
        gefDeal.facilities = createdFacilities;
        cy.makerLoginSubmitGefDealForReview(gefDeal);
        cy.checkerLoginSubmitGefDealToUkef(gefDeal);
        cy.clearSessionCookies();

        cy.forceVisit(TFM_URL);
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

  describe(PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_PENDING, () => {
    it('should render an activity title', () => {
      const activity = PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_PENDING;

      const expected = activity;

      cy.assertText(applicationActivities.title(activity), expected);
    });

    it('should render an activity byline', () => {
      const activity = PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_PENDING;

      const expected = `by ${UKEF.ACRONYM}`;

      cy.assertText(applicationActivities.byline(activity), expected);
    });

    it('should render a date and time', () => {
      const expected = `${today.d_MMMM_yyyy} ${today.h_MMAAA}`;

      cy.assertText(applicationActivities.dateTime(PORTAL_ACTIVITY_LABEL.DEAL_CANCELLATION_PENDING), expected);
    });
  });

  describe(PORTAL_ACTIVITY_LABEL.AIN_SUBMISSION, () => {
    it('should render an activity title', () => {
      const activity = PORTAL_ACTIVITY_LABEL.AIN_SUBMISSION;

      const expected = activity;

      cy.assertText(applicationActivities.title(activity), expected);
    });
  });
});
