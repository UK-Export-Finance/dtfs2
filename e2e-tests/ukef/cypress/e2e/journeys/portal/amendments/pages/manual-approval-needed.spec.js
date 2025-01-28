import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import facilityValue from '../../../../../../../gef/cypress/e2e/pages/amendments/facility-value';
import eligibility from '../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';
import manualApprovalNeeded from '../../../../../../../gef/cypress/e2e/pages/amendments/manual-approval-needed';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Eligibility - page tests', () => {
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
        eligibility.allFalseRadioButtons().click({ multiple: true });
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
    cy.visit(relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/manual-approval-needed`));
  });

  it('should render key features of the page', () => {
    manualApprovalNeeded.pageHeading().contains('This amendment cannot be automatically approved');
    manualApprovalNeeded.returnLink();
    manualApprovalNeeded.emailLink();
    manualApprovalNeeded.backLink();
  });

  it('should navigate to the deals overview page when the return link is clicked', () => {
    manualApprovalNeeded.returnLink().click();

    cy.url().should('eq', relative(`/dashboard/deals/0`));
  });

  it('should navigate to the eligibility page with pre-filled data when "back" is clicked', () => {
    manualApprovalNeeded.backLink().click();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/eligibility`));
    eligibility.allFalseRadioButtons().should('be.checked');
  });
});
