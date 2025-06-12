import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import amendmentPage from '../../../../../../../gef/cypress/e2e/pages/amendments/amendment-shared';
import abandon from '../../../../../../../gef/cypress/e2e/pages/amendments/abandon';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '20000';

context('Amendments - Maker abandons an amendment', () => {
  let dealId;
  let facilityId;
  let amendmentUrl;
  let amendmentDetailsUrl;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

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

        cy.getAmendmentIdFromUrl().then((amendmentId) => {
          amendmentUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}`;
          const confirmReturnToMakerUrl = `${amendmentUrl}/return-to-maker`;
          const submittedUrl = `${amendmentUrl}/returned-to-maker`;
          amendmentDetailsUrl = `${amendmentUrl}/amendment-details`;

          cy.makerSubmitAmendmentForReviewAndCheckerReturnsToMaker({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE,
            amendmentDetailsUrl,
            confirmReturnToMakerUrl,
            submittedUrl,
          });
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
    cy.visit(relative(amendmentDetailsUrl));
    amendmentPage.abandon().click();
    cy.url().should('eq', relative(`${amendmentUrl}/abandon`));
  });

  it('should not abandon the amendment', () => {
    abandon.noKeepButton().click();
    cy.url().should('eq', relative(`/gef/application-details/${dealId}`));
  });

  it('should abandon the amendment', () => {
    abandon.yesAbandonButton().click();
    cy.get('[data-cy="abandoned-panel"]').should('exist');
    cy.get('[data-cy="abandoned-panel"]').contains('Amendment has been abandoned');
    cy.get('[data-cy="abandoned-panel"]').contains("We've sent you a confirmation email.");
  });
});
