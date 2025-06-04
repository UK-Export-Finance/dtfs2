import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import amendmentPage from '../../../../../../../gef/cypress/e2e/pages/amendments/amendment-shared';
import returnedToMaker from '../../../../../../../gef/cypress/e2e/pages/amendments/returned-to-maker';
import { mainHeading, headingCaption, backLink, cancelLink } from '../../../../../../../gef/cypress/e2e/partials';

const { BANK1_MAKER1, BANK1_CHECKER1 } = MOCK_USERS;

const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
const CHANGED_FACILITY_VALUE = '20000';

context('Amendments - return to maker pages', () => {
  let dealId;
  let facilityId;
  let amendmentDetailsUrl;
  let exporterName;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;
      exporterName = insertedDeal.exporter.companyName;

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
          amendmentDetailsUrl = `/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/amendment-details`;

          cy.makerMakesPortalAmendmentRequest({
            facilityValueExists: true,
            changedFacilityValue: CHANGED_FACILITY_VALUE,
          });
          cy.clickSubmitButton();
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
    cy.login(BANK1_CHECKER1);
    cy.visit(amendmentDetailsUrl);
    cy.clickReturnToMakerButton();
  });

  it('should display return to maker page', () => {
    cy.assertText(mainHeading(), 'Return to maker');
    cy.assertText(backLink(), 'Back');
    cy.assertText(headingCaption(), `${exporterName}, ${mockFacility.type} facility`);
    cy.assertText(cancelLink(), 'Cancel');
  });

  it('should display the confirmation page when submitting return to maker', () => {
    cy.clickSubmitButton();

    returnedToMaker.returnedToMakerConfirmationPanel().should('contain', 'Amendment returned to maker for further inputs');
    returnedToMaker.returnedToMakerConfirmationPanel().should('contain', "We've sent you a confirmation email.");

    cy.assertText(returnedToMaker.whatHappensNextHeading(), 'What happens next?');
    cy.assertText(returnedToMaker.whatHappensNextText(), "You don't need to do anything");

    cy.assertText(amendmentPage.returnLink(), 'Return to all applications and notices');

    amendmentPage
      .returnLink()
      .invoke('attr', 'href')
      .then((href) => {
        expect(href).to.equal(`/dashboard/deals`);
      });
  });
});
