import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Do you have a facility end date? - page tests', () => {
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

        whatDoYouNeedToChange.coverEndDateCheckbox().click();
        cy.clickContinueButton();
        cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
        cy.clickContinueButton();
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
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/do-you-have-a-facility-end-date`));
  });

  it('should render an error if nothing is selected', () => {
    cy.clickContinueButton();

    doYouHaveAFacilityEndDate.errorSummary().should('be.visible');
    doYouHaveAFacilityEndDate.errorSummary().contains('Select if there is an end date for this facility');

    doYouHaveAFacilityEndDate.inlineError().should('be.visible');
    doYouHaveAFacilityEndDate.inlineError().contains('Select if there is an end date for this facility');
  });

  it('should navigate to cancel page when cancel is clicked', () => {
    doYouHaveAFacilityEndDate.cancelLink().click();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`));
  });
});
