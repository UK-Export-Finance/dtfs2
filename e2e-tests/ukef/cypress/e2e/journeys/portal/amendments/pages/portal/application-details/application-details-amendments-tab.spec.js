import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility, anIssuedContingentFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationAmendments } from '../../../../../../../../../gef/cypress/e2e/pages';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Application details - Amendments Tab', () => {
  let dealId;
  let issuedCashFacilityId;
  let issuedContingentFacilityId;
  const issuedCashFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
  const issuedContingentFacility = anIssuedContingentFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [issuedCashFacility], BANK1_MAKER1).then((createdCashFacility) => {
        issuedCashFacilityId = createdCashFacility.details._id;

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
  });
});
