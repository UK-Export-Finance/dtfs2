import { getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { D_MMMM_YYYY_FORMAT, twoDays } from '../../../../../../../e2e-fixtures/dateConstants';
import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

const CHANGED_FACILITY_VALUE_1 = '20000';
const CHANGED_FACILITY_VALUE_2 = '30000';

context('Amendments - Multiple cover end date AND value amendments - Application details displays amendment values on facility summary list', () => {
  let dealId;
  let facilityId;
  let applicationDetailsUrl;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();

        // first amendment request with facility value and cover end date
        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          coverEndDateExists: true,
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE_1,
          applicationDetailsUrl,
          facilityId,
          dealId,
        });

        // second amendment request with different facility value and cover end date
        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          coverEndDateExists: true,
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE_2,
          changedCoverEndDate: twoDays.date,
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

  it('should display the latest updated amendment value AND cover end date on facility summary list', () => {
    applicationPreview.facilitySummaryList().contains(getFormattedMonetaryValue(CHANGED_FACILITY_VALUE_2, false));
    applicationPreview.facilitySummaryList().contains(format(twoDays.date, D_MMMM_YYYY_FORMAT));
  });
});
