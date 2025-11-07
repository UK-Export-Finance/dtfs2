import { getFormattedMonetaryValue, CURRENCY } from '@ukef/dtfs2-common';
import { tomorrow } from '@ukef/dtfs2-common/test-helpers';

import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { dashboardSubNavigation } from '../../../../../../../../../gef/cypress/e2e/partials';
import { dashboardFacilities } from '../../../../../../../../../portal/cypress/e2e/pages';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

context('Amendments - Cover end date amendment - Portal all facilities page should display the original facility value', () => {
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

        cy.loginAndSubmitPortalAmendmentRequestToUkef({
          facilityValueExists: false,
          coverEndDateExists: true,
          applicationDetailsUrl,
          changedCoverEndDate: tomorrow.date,
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

    dashboardSubNavigation.facilities().click();
  });

  it('should display the original facility value on all facilities page', () => {
    cy.assertText(dashboardFacilities.row.value(facilityId), `${CURRENCY.GBP} ${getFormattedMonetaryValue(facilityValue, true)}`);
  });
});
