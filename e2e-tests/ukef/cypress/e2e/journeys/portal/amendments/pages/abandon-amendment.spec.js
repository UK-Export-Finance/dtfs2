import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

import abandon from '../../../../../../../gef/cypress/e2e/pages/amendments/abandon';
import amendmentPage from '../../../../../../../gef/cypress/e2e/pages/amendments/amendment-shared';

const { BANK1_MAKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '10000';

context('Amendments - Maker Abandon An Amendment Page', () => {
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
          amendmentDetailsUrl = `/gef/application-details/${dealId}/amendment-details`;
          const confirmReturnToMakerUrl = `${amendmentUrl}/return-to-maker`;
          const submittedUrl = `${amendmentUrl}/returned-to-maker`;

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

  it('should render the correct heading and back link', () => {
    abandon.pageHeading().contains('Confirm that you want to abandon');
    abandon
      .backLink()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.contains(amendmentDetailsUrl);
      });
  });

  it('should redirect to the amendment details page when clicking the back link', () => {
    abandon.backLink().click();
    amendmentPage.pageHeading().contains('Amendment details');
  });
});
