import { tomorrow } from '@ukef/dtfs2-common/test-helpers';
import coverEndDate from '../../../gef/cypress/e2e/pages/amendments/cover-end-date';
import facilityEndDate from '../../../gef/cypress/e2e/pages/amendments/facility-end-date';
import bankReviewDate from '../../../gef/cypress/e2e/pages/amendments/bank-review-date';
import effectiveDate from '../../../gef/cypress/e2e/pages/amendments/effective-date';
import whatDoYouNeedToChange from '../../../gef/cypress/e2e/pages/amendments/what-do-you-need-to-change';
import doYouHaveAFacilityEndDate from '../../../gef/cypress/e2e/pages/amendments/do-you-have-a-facility-end-date';
import facilityValue from '../../../gef/cypress/e2e/pages/amendments/facility-value';
import eligibility from '../../../gef/cypress/e2e/pages/amendments/eligibility';
import amendmentPage from '../../../gef/cypress/e2e/pages/amendments/amendment-shared';
import amendmentSummaryList from '../../../gef/cypress/e2e/pages/amendments/amendment-summary-list';
import manualApprovalNeeded from '../../../gef/cypress/e2e/pages/amendments/manual-approval-needed';

const ELIGIBILITY_CRITERIA_COUNT = 7;
const NEW_FACILITY_VALUE = '20000';

const MOCK_ELIGIBILITY_TEST_CASES = Array.from({ length: ELIGIBILITY_CRITERIA_COUNT }, (_, index) => ({
  description: 'eligibility',
  page: 'eligibility',
  nextPage: 'manual-approval-needed',
  element: eligibility,
  nextElement: manualApprovalNeeded,
  checkYourAnswersChangeElement: () => amendmentSummaryList.eligibilityCriteriaSummaryListTable().eligibilityCriterionChangeLink(index + 1),
  fragment: `${index + 1}`,
  nextPageHeading: 'This amendment cannot be automatically approved',
  change: () => {
    eligibility.allFalseRadioButtons().click({ multiple: true });
    cy.clickContinueButton();
  },
}));

export const MOCK_JOURNEYS_WITH_FED = [
  {
    description: 'cover end date',
    page: 'cover-end-date',
    nextPage: 'do-you-have-a-facility-end-date',
    element: coverEndDate,
    nextElement: doYouHaveAFacilityEndDate,
    checkYourAnswersChangeElement: () => amendmentSummaryList.amendmentSummaryListTable().coverEndDateChangeLink(),
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
    checkYourAnswersChangeElement: () => amendmentSummaryList.amendmentSummaryListTable().facilityEndDateChangeLink(),
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
    checkYourAnswersChangeElement: () => amendmentSummaryList.amendmentSummaryListTable().facilityValueChangeLink(),
    fragment: 'facilityValue',
    nextPageHeading: 'Eligibility',
    change: () => {
      cy.keyboardInput(facilityValue.facilityValue(), NEW_FACILITY_VALUE);
      cy.clickContinueButton();
    },
  },
  {
    description: 'effective date',
    page: 'effective-date',
    nextPage: 'check-your-answers',
    element: effectiveDate,
    nextElement: amendmentPage,
    checkYourAnswersChangeElement: () => amendmentSummaryList.effectiveDateSummaryListTable().effectiveDateChangeLink(),
    fragment: 'effectiveDate-day',
    nextPageHeading: 'Check your answers before submitting the amendment request',
    change: () => {
      cy.completeDateFormFields({ idPrefix: 'effective-date', date: tomorrow.date });
      cy.clickContinueButton();
    },
  },
  ...MOCK_ELIGIBILITY_TEST_CASES,
];

export const MOCK_JOURNEYS_WITH_BRD = [
  {
    description: 'what do you need to change',
    page: 'what-do-you-need-to-change',
    nextPage: 'cover-end-date',
    element: whatDoYouNeedToChange,
    nextElement: coverEndDate,
    checkYourAnswersChangeElement: () => amendmentSummaryList.amendmentSummaryListTable().amendmentOptionsChangeLink(),
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
    checkYourAnswersChangeElement: () => amendmentSummaryList.amendmentSummaryListTable().bankReviewDateChangeLink(),
    fragment: 'bankReviewDate-day',
    nextPageHeading: 'Eligibility',
    change: () => {
      cy.completeDateFormFields({ idPrefix: 'bank-review-date', date: tomorrow.date });
      cy.clickContinueButton();
    },
  },
];
