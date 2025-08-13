import relative from '../../../../../relativeURL';
import MOCK_USERS from '../../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import facilityValue from '../../../../../../../../gef/cypress/e2e/pages/amendments/facility-value';
import eligibility from '../../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';
import amendmentPage from '../../../../../../../../gef/cypress/e2e/pages/amendments/amendment-shared';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Check your answers - page tests', () => {
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

        whatDoYouNeedToChange.facilityValueCheckbox().click();
        cy.clickContinueButton();
        cy.keyboardInput(facilityValue.facilityValue(), '10000');
        cy.clickContinueButton();
        eligibility.allTrueRadioButtons().click({ multiple: true });
        cy.clickContinueButton();
        cy.completeDateFormFields({ idPrefix: 'effective-date' });
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
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/check-your-answers`));
  });

  it('should render key features of the page', () => {
    amendmentPage.pageHeading().contains('Check your answers before submitting the amendment request');
    amendmentPage.backLink();
    amendmentPage.cancelLink();
  });

  it('should navigate to cancel page when cancel is clicked', () => {
    eligibility.cancelLink().click();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/cancel`));
  });
});
