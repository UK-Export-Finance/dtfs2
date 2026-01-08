import { PORTAL_AMENDMENT_STATUS, CURRENCY, getFormattedMonetaryValue } from '@ukef/dtfs2-common';
import { today } from '@ukef/dtfs2-common/test-helpers';
import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility, anIssuedContingentFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationAmendments } from '../../../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1 } = MOCK_USERS;
const CHANGED_FACILITY_VALUE = '20000';

context('Application details - Amendments Tab', () => {
  let dealId;
  let issuedCashFacilityId;
  let issuedContingentFacilityId;
  let ukefFacilityId;
  const issuedCashFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
  const issuedContingentFacility = anIssuedContingentFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [issuedCashFacility], BANK1_MAKER1).then((createdCashFacility) => {
        issuedCashFacilityId = createdCashFacility.details._id;
        ukefFacilityId = createdCashFacility.details.ukefFacilityId;

        cy.createGefFacilities(dealId, [issuedContingentFacility], BANK1_MAKER1).then((createdContingentFacility) => {
          issuedContingentFacilityId = createdContingentFacility.details._id;

          cy.makerLoginSubmitGefDealForReview(insertedDeal);
          cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

          cy.clearSessionCookies();
          cy.login(BANK1_MAKER1);
          cy.saveSession();
          cy.visit(relative(`/gef/application-details/${dealId}`));

          cy.submitToUkefMultipleAmendmentsOnFacility({ dealId, facilityId: issuedCashFacilityId, numberOfAmendments: 1 });

          cy.clearSessionCookies();
          cy.login(BANK1_MAKER1);
          cy.saveSession();
          cy.visit(relative(`/gef/application-details/${dealId}`));

          cy.submitToUkefMultipleAmendmentsOnFacility({ dealId, facilityId: issuedContingentFacilityId, numberOfAmendments: 1 });
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
    cy.visit(relative(`/gef/application-details/${dealId}`));
  });

  describe('amendments tab', () => {
    it('should render all approved amendments on deal', () => {
      applicationAmendments.subNavigationBarAmendments().should('exist');
      applicationAmendments.subNavigationBarAmendments().click();

      applicationAmendments.tabHeading().should('exist');
      applicationAmendments.tabHeading().should('have.text', 'Amendments');
      applicationAmendments.summaryList().should('have.length', 2);
    });

    it('should display the first row with the 2nd newest amendment', () => {
      cy.assertText(applicationAmendments.amendmentDetails.row(2).facilityId(), ukefFacilityId);
      cy.assertText(applicationAmendments.amendmentDetails.row(2).facilityType(), 'Cash Facility');
      cy.assertText(applicationAmendments.amendmentDetails.row(2).status(), PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED);

      cy.assertText(applicationAmendments.amendmentDetails.row(2).newCoverEndDate(), today.dd_MMMM_yyyy);
      cy.assertText(applicationAmendments.amendmentDetails.row(2).newFacilityEndDate(), today.dd_MMMM_yyyy);
      cy.assertText(
        applicationAmendments.amendmentDetails.row(2).newFacilityValue(),
        `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, 2)}`,
      );

      cy.assertText(applicationAmendments.amendmentDetails.row(2).effectiveFrom(), today.dd_MMMM_yyyy);
      cy.assertText(applicationAmendments.amendmentDetails.row(2).createdBy(), 'First Last');
    });

    it('should display the second row with the 3rd newest amendment', () => {
      cy.assertText(applicationAmendments.amendmentDetails.row(1).facilityId(), ukefFacilityId);
      cy.assertText(applicationAmendments.amendmentDetails.row(1).facilityType(), 'Cash Facility');
      cy.assertText(applicationAmendments.amendmentDetails.row(1).status(), PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED);

      cy.assertText(applicationAmendments.amendmentDetails.row(1).newCoverEndDate(), today.dd_MMMM_yyyy);
      cy.assertText(applicationAmendments.amendmentDetails.row(1).newFacilityEndDate(), today.dd_MMMM_yyyy);
      cy.assertText(
        applicationAmendments.amendmentDetails.row(1).newFacilityValue(),
        `${CURRENCY.GBP} ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, 2)}`,
      );

      cy.assertText(applicationAmendments.amendmentDetails.row(1).effectiveFrom(), today.dd_MMMM_yyyy);
      cy.assertText(applicationAmendments.amendmentDetails.row(1).createdBy(), 'First Last');
    });
  });
});
