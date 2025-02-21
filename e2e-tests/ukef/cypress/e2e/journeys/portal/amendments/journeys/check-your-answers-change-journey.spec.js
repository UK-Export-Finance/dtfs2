import relative from '../../../../relativeURL';
import MOCK_USERS from '../../../../../../../e2e-fixtures/portal-users.fixture';
import { MOCK_APPLICATION_AIN_DRAFT } from '../../../../../../../e2e-fixtures/gef/mocks/mock-deals';
import { anIssuedCashFacility } from '../../../../../../../e2e-fixtures/mock-gef-facilities';
import { applicationPreview } from '../../../../../../../gef/cypress/e2e/pages';

import whatDoYouNeedToChange from '../../../../../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import coverEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/cover-end-date';
import doYouHaveAFacilityEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import facilityEndDate from '../../../../../../../gef/cypress/e2e/pages/amendments/facility-end-date';
import bankReviewDate from '../../../../../../../gef/cypress/e2e/pages/amendments/bank-review-date';
import facilityValue from '../../../../../../../gef/cypress/e2e/pages/amendments/facility-value';
import eligibility from '../../../../../../../gef/cypress/e2e/pages/amendments/eligibility';
import effectiveDate from '../../../../../../../gef/cypress/e2e/pages/amendments/effective-date';
import checkYourAnswers from '../../../../../../../gef/cypress/e2e/pages/amendments/check-your-answers';
import manualApprovalNeeded from '../../../../../../../gef/cypress/e2e/pages/amendments/manual-approval-needed';
import { tomorrow } from '../../../../../../../e2e-fixtures/dateConstants';

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

  const eligibilityTestCases = Array.from({ length: 7 }, (_, index) => ({
    description: 'eligibility',
    page: 'eligibility',
    nextPage: 'manual-approval-needed',
    element: eligibility,
    nextElement: manualApprovalNeeded,
    checkYourAnswersChangeElement: () => checkYourAnswers.eligibilityCriteriaSummaryListTable().eligibilityCriterionChangeLink(index + 1),
    fragment: `${index + 1}`,
    nextPageHeading: 'This amendment cannot be automatically approved',
    change: () => {
      eligibility.allFalseRadioButtons().click({ multiple: true });
      cy.clickContinueButton();
    },
  }));

  const testCasesWithoutBRD = [
    {
      description: 'cover end date',
      page: 'cover-end-date',
      nextPage: 'do-you-have-a-facility-end-date',
      element: coverEndDate,
      nextElement: doYouHaveAFacilityEndDate,
      checkYourAnswersChangeElement: () => checkYourAnswers.amendmentSummaryListTable().coverEndDateChangeLink(),
      fragment: 'coverEndDate-day',
      nextPageHeading: 'Do you have a facility end date?',
      change: () => {
        cy.completeDateFormFields({ idPrefix: 'cover-end-date', date: tomorrow.date });
        cy.clickContinueButton();
      },
    },
    {
      description: 'facility end date',
      page: 'facility-end-date',
      nextPage: 'facility-value',
      element: facilityEndDate,
      nextElement: facilityValue,
      checkYourAnswersChangeElement: () => checkYourAnswers.amendmentSummaryListTable().facilityEndDateChangeLink(),
      fragment: 'facilityEndDate-day',
      nextPageHeading: 'New facility value',
      change: () => {
        cy.completeDateFormFields({ idPrefix: 'facility-end-date', date: tomorrow.date });
        cy.clickContinueButton();
      },
    },
    {
      description: 'facility value',
      page: 'facility-value',
      nextPage: 'eligibility',
      element: facilityValue,
      nextElement: eligibility,
      checkYourAnswersChangeElement: () => checkYourAnswers.amendmentSummaryListTable().facilityValueChangeLink(),
      fragment: 'facilityValue',
      nextPageHeading: 'Eligibility',
      change: () => {
        cy.keyboardInput(facilityValue.facilityValue(), '20000');
        cy.clickContinueButton();
      },
    },
    {
      description: 'effective date',
      page: 'effective-date',
      nextPage: 'check-your-answers',
      element: effectiveDate,
      nextElement: checkYourAnswers,
      checkYourAnswersChangeElement: () => checkYourAnswers.effectiveDateSummaryListTable().effectiveDateChangeLink(),
      fragment: 'effectiveDate-day',
      nextPageHeading: 'Check your answers before submitting the amendment request',
      change: () => {
        cy.completeDateFormFields({ idPrefix: 'effective-date', date: tomorrow.date });
        cy.clickContinueButton();
      },
    },
    ...eligibilityTestCases,
  ];

  const testCasesWithBRD = [
    {
      description: 'what do you need to change',
      page: 'what-do-you-need-to-change',
      nextPage: 'cover-end-date',
      element: whatDoYouNeedToChange,
      nextElement: coverEndDate,
      checkYourAnswersChangeElement: () => checkYourAnswers.amendmentSummaryListTable().amendmentOptionsChangeLink(),
      fragment: 'amendmentOptions',
      nextPageHeading: 'New cover end date',
      change: () => {
        whatDoYouNeedToChange.facilityValueCheckbox().click();
        cy.clickContinueButton();
      },
    },
    {
      description: 'bank review date',
      page: 'bank-review-date',
      nextPage: 'eligibility',
      element: bankReviewDate,
      nextElement: eligibility,
      checkYourAnswersChangeElement: () => checkYourAnswers.amendmentSummaryListTable().bankReviewDateChangeLink(),
      fragment: 'bankReviewDate-day',
      nextPageHeading: 'Eligibility',
      change: () => {
        cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: tomorrow.date });
        cy.clickContinueButton();
      },
    },
  ];

  const setupTest = async (testCases, pageActions, hasBankReviewDate) => {
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
            pageActions(hasBankReviewDate);
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

  const pageActions = (hasBankReviewDate) => {
    whatDoYouNeedToChange.coverEndDateCheckbox().click();
    whatDoYouNeedToChange.facilityValueCheckbox().click();
    cy.clickContinueButton();
    cy.completeDateFormFields({ idPrefix: 'cover-end-date' });
    cy.clickContinueButton();
    if (hasBankReviewDate) {
      doYouHaveAFacilityEndDate.noRadioButton().click();
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'bank-review-date' });
    } else {
      doYouHaveAFacilityEndDate.yesRadioButton().click();
      cy.clickContinueButton();
      cy.completeDateFormFields({ idPrefix: 'facility-end-date' });
    }
    cy.clickContinueButton();
    cy.keyboardInput(facilityValue.facilityValue(), '10000');
    cy.clickContinueButton();
    eligibility.allTrueRadioButtons().click({ multiple: true });
    cy.clickContinueButton();
    cy.completeDateFormFields({ idPrefix: 'effective-date' });
    cy.clickContinueButton();
  };

  (async () => {
    await setupTest(testCasesWithBRD, pageActions, true);
    await setupTest(testCasesWithoutBRD, pageActions, false);
  })();
});
