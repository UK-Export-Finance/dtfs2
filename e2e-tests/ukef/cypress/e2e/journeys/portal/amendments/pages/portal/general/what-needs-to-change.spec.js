import relative from '../../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - What needs to change - page tests', () => {
  /**
   * @type {string}
   */
  let dealId;

  /**
   * @type {string}
   */
  let facilityId;
  /**
   * @type {string}
   */
  let amendmentId;

  before(() => {
    cy.insertOneGefDeal(MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1).then((insertedDeal) => {
      dealId = insertedDeal._id;

      cy.updateGefDeal(dealId, MOCK_APPLICATION_AIN_DRAFT, BANK1_MAKER1);

      cy.createGefFacilities(dealId, [anIssuedCashFacility({ facilityEndDateEnabled: true })], BANK1_MAKER1).then((createdFacility) => {
        facilityId = createdFacility.details._id;
        cy.makerLoginSubmitGefDealForReview(insertedDeal);
        cy.checkerLoginSubmitGefDealToUkef(insertedDeal);

        cy.clearSessionCookies();
        cy.login(BANK1_MAKER1);
        cy.saveSession();
        cy.visit(relative(`/gef/application-details/${dealId}`));

        applicationPreview.makeAChangeButton(facilityId).click();

        cy.url().then((url) => {
          const urlSplit = url.split('/');

          amendmentId = urlSplit[9];
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
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/what-do-you-need-to-change`));
  });

  it('should render key features of the page', () => {
    whatDoYouNeedToChange.pageHeading().contains('What do you need to change?');
    whatDoYouNeedToChange.backLink();
    whatDoYouNeedToChange.warning().contains('Check your records for the most up-to-date values');
  });

  it('should render the selection boxes initially unchecked', () => {
    whatDoYouNeedToChange.coverEndDateCheckbox().should('not.be.checked');
    whatDoYouNeedToChange.facilityValueCheckbox().should('not.be.checked');
  });

  it('should render an error if nothing is selected to change', () => {
    cy.clickContinueButton();

    whatDoYouNeedToChange.errorSummary().should('be.visible');
    whatDoYouNeedToChange.errorSummary().contains('Select if you need to change the facility cover end date, value or both');

    whatDoYouNeedToChange.amendmentOptionsInlineError().should('be.visible');
    whatDoYouNeedToChange.amendmentOptionsInlineError().contains('Select if you need to change the facility cover end date, value or both');
  });

  it('should navigate to cancel page when cancel is clicked', () => {
    whatDoYouNeedToChange.cancelLink().click();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`));
  });
});
