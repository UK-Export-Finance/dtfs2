import { getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { format } from 'date-fns';

import { D_MMMM_YYYY_FORMAT, oneMonth } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = {
  ...anIssuedCashFacility(),
  isUsingFacilityEndDate: false,
  facilityEndDate: undefined,
  bankReviewDate: oneMonth.date,
};

const bankReviewDate = format(oneMonth.date, D_MMMM_YYYY_FORMAT);

const CHANGED_FACILITY_VALUE_1 = '20000';
const CHANGED_FACILITY_VALUE_2 = '30000';

context(
  'Amendments - Multiple value amendments and facility has no facility end date - Application details displays amendment values on facility summary list',
  () => {
    let dealId;
    let facilityId;
    let applicationDetailsUrl;
    let coverEndDate;

    before(() => {
      cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
        dealId = insertedDeal._id;
        applicationDetailsUrl = `/gef/application-details/${dealId}`;

        cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

        cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
          facilityId = createdFacility.details._id;
          coverEndDate = new Date(createdFacility.details.coverEndDate);

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
      cy.visit(relative(applicationDetailsUrl));
    });

    it('should display the latest updated amendment value on facility summary list', () => {
      applicationPreview.facilitySummaryList().contains(getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_2, false));
      applicationPreview.facilitySummaryList().contains(format(coverEndDate, D_MMMM_YYYY_FORMAT));
      applicationPreview.facilitySummaryList().contains(bankReviewDate);
    });
  },
);
