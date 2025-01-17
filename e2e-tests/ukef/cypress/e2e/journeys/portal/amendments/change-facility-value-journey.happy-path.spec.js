import relative from '../../../relativeURL';
import MOCK_USERS from '../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../gef/cypress/e2e/pages';
import whatDoYouNeedToChange from '../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import facilityValue from '../../../../../../gef/cypress/e2e/pages/amendments/facility-value';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - change facility value journey - happy path', () => {
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

  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });

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

  it('should navigate through the journey correctly', () => {
    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/what-do-you-need-to-change`));

    whatDoYouNeedToChange.coverEndDateCheckbox().should('not.be.checked');
    whatDoYouNeedToChange.facilityValueCheckbox().should('not.be.checked');
    whatDoYouNeedToChange.pageTitle().contains('What do you need to change?');
    whatDoYouNeedToChange.backLink();
    whatDoYouNeedToChange.warning().contains('Check your records for the most up-to-date values');

    whatDoYouNeedToChange.facilityValueCheckbox().click();
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/facility-value`));

    facilityValue.pageHeading().contains('New facility value');
    facilityValue.backLink();
    facilityValue.facilityValuePrefix().contains('£');

    cy.keyboardInput(facilityValue.facilityValue(), '10000');
    cy.clickContinueButton();

    cy.url().should('eq', relative(`/gef/application-details/${dealId}/facilities/${facilityId}/amendments/${amendmentId}/eligibility`));
  });
});
