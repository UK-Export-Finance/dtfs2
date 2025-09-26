import { getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { format } from 'date-fns';

import { D_MMMM_YYYY_FORMAT, twoDays } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

context('Amendments - Multiple cover end date amendments - Application details displays amendment values on facility summary list', () => {
  let dealId;
  let facilityId;
  let applicationDetailsUrl;
  let facilityValue;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = `/gef/application-details/${dealId}`;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        facilityValue = createdFacility.details.value;

        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();

        // first amendment request with cover end date
        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: false,
          coverEndDateExists: true,
          applicationDetailsUrl,
          facilityId,
          dealId,
        });

        // second amendment request with different cover end date
        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: false,
          coverEndDateExists: true,
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

  it('should display the latest updated amendment cover end date on facility summary list', () => {
    applicationPreview.facilitySummaryList().contains(getFormattedMonetaryValue(facilityValue, false));
    applicationPreview.facilitySummaryList().contains(format(twoDays.date, D_MMMM_YYYY_FORMAT));
  });
});
