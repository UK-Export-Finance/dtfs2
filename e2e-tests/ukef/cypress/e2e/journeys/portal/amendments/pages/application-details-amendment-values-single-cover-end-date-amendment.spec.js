import { getFormattedMonetaryValueWithoutDecimals } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { D_MMMM_YYYY_FORMAT } from '../../../../../../../e2e-fixtures/dateConstants';
import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

context('Amendments - Single cover end date amendment - Application details displays amendment values on facility summary list', () => {
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

  it('should display the updated amendment cover end date on facility summary list', () => {
    applicationPreview.facilitySummaryList().contains(getFormattedMonetaryValueWithoutDecimals(facilityValue));
    applicationPreview.facilitySummaryList().contains(format(new Date(), D_MMMM_YYYY_FORMAT));
  });
});
