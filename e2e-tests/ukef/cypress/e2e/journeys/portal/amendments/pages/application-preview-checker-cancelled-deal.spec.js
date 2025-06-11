import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import { PIM_USER_1, TFM_URL } from '../../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const CHANGED_FACILITY_VALUE = 20000;

context('Amendments - Checker - application preview page when deal status is "Cancelled" and amendment is "Ready for checkers approval"', () => {
  let applicationDetailsUrl;
  let dealId;
  let facilityId;

  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      applicationDetailsUrl = relative(`/gef/application-details/${dealId}`);

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [mockFacility], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();
        cy.visit(relative(`/gef/application-details/${dealId}`));

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.makerMakesPortalAmendmentRequest({
          facilityValueExists: true,
          changedFacilityValue: CHANGED_FACILITY_VALUE,
        });
        cy.clickSubmitButton();

        cy.visit(TFM_URL);

        cy.tfmLogin(PIM_USER_1);

        const tfmDealPage = `${TFM_URL}/case/${dealId}/deal`;
        cy.visit(tfmDealPage);

        cy.submitDealCancellation({ dealId });
      });
    });
  });

  after(() => {
    cy.clearCookies();
    cy.clearSessionCookies();
  });

  beforeEach(() => {
    cy.clearSessionCookies();
    cy.login(BANK1_CHECKER1);
  });

  it('should not have the amendment details header, banner or link', () => {
    cy.visit(applicationDetailsUrl);

    applicationPreview.amendmentDetailsHeaderReadyForCheckers().should('not.exist');
    applicationPreview.amendmentDetailsHeaderFurtherMakersInput().should('not.exist');
    applicationPreview.amendmentDetailsReadyForCheckerLink(0).should('not.exist');
    applicationPreview.amendmentDetailsFurtherMakersInputLink(0).should('not.exist');

    applicationPreview.amendmentInProgress().should('not.exist');
  });
});
