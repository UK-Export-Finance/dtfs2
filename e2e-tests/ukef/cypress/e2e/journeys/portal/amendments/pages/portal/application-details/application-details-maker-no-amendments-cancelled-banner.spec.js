import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';
import { PIM_USER_1, TFM_URL } from '../../../../../../../../../e2e-fixtures';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

context('Amendments - Application details - application preview page when deal status is "Cancelled" and no amendments are in progress', () => {
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

  describe('Maker', () => {
    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_MAKER1);
      cy.visit(applicationDetailsUrl);
    });

    it('should not display the make a change button', () => {
      applicationPreview.makeAChangeButton(facilityId).should('not.exist');
    });

    it('should NOT display the amendments abandoned deal cancelled banner', () => {
      applicationPreview.amendmentsAbandonedDealCancelledBanner().should('not.exist');
    });
  });

  describe('Checker', () => {
    beforeEach(() => {
      cy.clearSessionCookies();
      cy.login(BANK1_CHECKER1);
      cy.visit(applicationDetailsUrl);
    });

    it('should not display the make a change button', () => {
      applicationPreview.makeAChangeButton(facilityId).should('not.exist');
    });

    it('should NOT display the amendments abandoned deal cancelled banner', () => {
      applicationPreview.amendmentsAbandonedDealCancelledBanner().should('not.exist');
    });
  });
});
