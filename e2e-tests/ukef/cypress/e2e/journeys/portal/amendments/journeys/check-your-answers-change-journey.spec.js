import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { MOCK_JOURNEYS_WITH_BRD, MOCK_JOURNEYS_WITH_FED } from '../../../../../fixtures/check-your-answers-change-journey';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import facilityValue from '../../../../../../../gef/cypress/e2e/pages/amendments/facility-value';
import eligibility from '../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';
import checkYourAnswers from '../../../../../../../gef/cypress/e2e/pages/amendments/check-your-answers';
import manualApprovalNeeded from '../../../../../../../gef/cypress/e2e/pages/amendments/manual-approval-needed';

const { BANK1_MAKER1 } = MOCK_USERS;

context('Amendments - Check your answers change journey', () => {
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
  let amendmentUrl;
  /**
   * @type {Date}
   */
  const mockFacility = anIssuedCashFacility({ facilityEndDateEnabled: true });
  const CHANGED_FACILITY_VALUE = '10000';

  /**
   * This test suite covers the "Check your answers" change journey for amendments.
   */
  const setupTest = (testCases, amendmentPageActions, hasFacilityEndDate) => {
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
            amendmentPageActions(hasFacilityEndDate);
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
    });

    testCases.forEach(({ description, page, nextPage, element, nextElement, checkYourAnswersChangeElement, fragment, nextPageHeading, change }) => {
      it(`should navigate back to "Check your answers" page when no changes are made on the ${description} page`, () => {
        cy.visit(relative(`${amendmentUrl}/check-your-answers`));
        checkYourAnswersChangeElement().click();
        cy.url().should('eq', relative(`${amendmentUrl}/${page}/?change=true#${fragment}`));
        cy.clickContinueButton();
        cy.url().should('eq', relative(`${amendmentUrl}/check-your-answers#${fragment}`));
        checkYourAnswers.pageHeading().contains('Check your answers before submitting the amendment request');
      });

      it(`should navigate back to "Check your answers" page when the Back link is clicked on the ${description} page`, () => {
        cy.visit(relative(`${amendmentUrl}/check-your-answers`));
        checkYourAnswersChangeElement().click();
        cy.url().should('eq', relative(`${amendmentUrl}/${page}/?change=true#${fragment}`));
        element.backLink().click();
        cy.url().should('eq', relative(`${amendmentUrl}/check-your-answers`));
        checkYourAnswers.pageHeading().contains('Check your answers before submitting the amendment request');
      });

      it(`should navigate through the amendment journey when changes are made on the ${description} page`, () => {
        cy.visit(relative(`${amendmentUrl}/check-your-answers`));
        checkYourAnswersChangeElement().click();
        cy.url().should('eq', relative(`${amendmentUrl}/${page}/?change=true#${fragment}`));
        change();
        if (nextPage !== 'manual-approval-needed') {
          cy.url().should('eq', relative(`${amendmentUrl}/${nextPage}#${fragment}`));
          nextElement.pageHeading().contains(nextPageHeading);
        } else {
          cy.url().should('eq', relative(`${amendmentUrl}/${nextPage}#${fragment}`));
          nextElement.pageHeading().contains(nextPageHeading);
          manualApprovalNeeded.backLink().click();
          eligibility.allTrueRadioButtons().click({ multiple: true });
          cy.clickContinueButton();
        }
      });
    });
  };

  // These are the steps the user follows to amend the facility until they reach the "Check your answers" page.
  const amendmentPageActions = (hasFacilityEndDate) => {
    whatDoYouNeedToChange.coverEndDateCheckbox().click();
    whatDoYouNeedToChange.facilityValueCheckbox().click();
    cy.clickContinueButton();

    cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
    cy.clickContinueButton();

    if (hasFacilityEndDate) {
      doYouHaveAFacilityEndDate.yesRadioButton().click();
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'facility-end-date' });
    } else {
      doYouHaveAFacilityEndDate.noRadioButton().click();
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'bank-review-date' });
    }
    cy.clickContinueButton();

    cy.keyboardInput(facilityValue.facilityValue(), CHANGED_FACILITY_VALUE);
    cy.clickContinueButton();

    eligibility.allTrueRadioButtons().click({ multiple: true });
    cy.clickContinueButton();

    cy.completeDateFormFields({ idPrefix: 'effective-date' });
    cy.clickContinueButton();
  };

  // If the amendmentPageActions function is called with false, the bankReviewDate is enabled in the journey
  describe('Bank Review Date Enabled', () => {
    setupTest(MOCK_JOURNEYS_WITH_BRD, amendmentPageActions, false);
  });
  // If the amendmentPageActions function is called with true, the facilityEndDate is enabled in the journey
  describe('Facility End Date Endabled', () => {
    setupTest(MOCK_JOURNEYS_WITH_FED, amendmentPageActions, true);
  });
});
