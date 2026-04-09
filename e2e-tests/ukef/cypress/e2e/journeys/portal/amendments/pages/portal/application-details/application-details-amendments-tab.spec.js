import { PORTAL_AMENDMENT_STATUS, getFormattedMonetaryValue } from '@ukef/dtfs2-common';
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
  let ukefFacilityId1;
  let ukefFacilityId2;
  const issuedCashFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
  const issuedContingentFacility = anIssuedContingentFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [issuedCashFacility], BANK1_MAKER1).then((createdCashFacility) => {
        issuedCashFacilityId = createdCashFacility.details._id;
        ukefFacilityId1 = createdCashFacility.details.ukefFacilityId;

        cy.createGefFacilities(dealId, [issuedContingentFacility], BANK1_MAKER1).then((createdContingentFacility) => {
          issuedContingentFacilityId = createdContingentFacility.details._id;
          ukefFacilityId2 = createdContingentFacility.details.ukefFacilityId;

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
    });

    it('should display the 2nd newest amendment on the first row', () => {
      applicationAmendments.subNavigationBarAmendments().should('exist');
      applicationAmendments.subNavigationBarAmendments().click();
      cy.assertText(applicationAmendments.summaryList(2).facilityIdValue(), ukefFacilityId1);
      cy.assertText(applicationAmendments.summaryList(2).facilityTypeValue(), 'Cash facility');
      cy.assertText(applicationAmendments.summaryList(2).statusValue(), PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED);

      cy.assertText(applicationAmendments.summaryList(2).newFacilityValueValue(), `£ ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, 2)}`);

      cy.assertText(applicationAmendments.summaryList(2).effectiveFromValue(), today.d_MMMM_yyyy);
      cy.assertText(applicationAmendments.summaryList(2).createdByValue(), 'First Last');
    });

    it('should display the 3rd newest amendment on the second row', () => {
      applicationAmendments.subNavigationBarAmendments().should('exist');
      applicationAmendments.subNavigationBarAmendments().click();
      cy.assertText(applicationAmendments.summaryList(1).facilityIdValue(), ukefFacilityId2);
      cy.assertText(applicationAmendments.summaryList(1).facilityTypeValue(), 'Contingent facility');
      cy.assertText(applicationAmendments.summaryList(1).statusValue(), PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED);

      cy.assertText(applicationAmendments.summaryList(1).newFacilityValueValue(), `£ ${getFormattedMonetaryValue(CHANGED_FACILITY_VALUE, 2)}`);

      cy.assertText(applicationAmendments.summaryList(1).effectiveFromValue(), today.d_MMMM_yyyy);
      cy.assertText(applicationAmendments.summaryList(1).createdByValue(), 'First Last');
    });
  });
});
