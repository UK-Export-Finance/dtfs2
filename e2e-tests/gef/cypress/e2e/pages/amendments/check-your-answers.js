const cyGetAmendmentsSummaryListChild = (selector) => cy.get('[data-cy="amendment-summary-list"]').find(selector);
const cyGetAmendmentsSummaryListValue = (actionSelector) =>
  cyGetAmendmentsSummaryListChild(actionSelector).parent().parent().find('.govuk-summary-list__value');

const cyGetEligibilitySummaryListChild = (selector) => cy.get('[data-cy="eligibility-summary-list"]').find(selector);
const cyGetEligibilitySummaryListValue = (actionSelector) =>
  cyGetEligibilitySummaryListChild(actionSelector).parent().parent().find('.govuk-summary-list__value');

const cyGetEffectiveDateSummaryListChild = (selector) => cy.get('[data-cy="effective-date-summary-list"]').find(selector);
const cyGetEffectiveDateSummaryListValue = (actionSelector) =>
  cyGetEffectiveDateSummaryListChild(actionSelector).parent().parent().find('.govuk-summary-list__value');

const checkYourAnswers = {
  amendmentSummaryListTable: () => ({
    amendmentOptionsAction: () => cyGetAmendmentsSummaryListChild('[data-cy="change-amendment-options-link"]'),
    amendmentOptionsValue: () => cyGetAmendmentsSummaryListValue('[data-cy="change-amendment-options-link"]'),
    coverEndDateValue: () => cyGetAmendmentsSummaryListValue('[data-cy="change-cover-end-date-link"]'),
    coverEndDateAction: () => cyGetAmendmentsSummaryListChild('[data-cy="change-cover-end-date-link"]'),
    facilityEndDateAction: () => cyGetAmendmentsSummaryListChild('[data-cy="change-facility-end-date-link"]'),
    facilityEndDateValue: () => cyGetAmendmentsSummaryListValue('[data-cy="change-facility-end-date-link"]'),
    bankReviewDateAction: () => cyGetAmendmentsSummaryListChild('[data-cy="change-bank-review-date-link"]'),
    bankReviewDateValue: () => cyGetAmendmentsSummaryListValue('[data-cy="change-bank-review-date-link"]'),
    facilityValueAction: () => cyGetAmendmentsSummaryListChild('[data-cy="change-facility-value-link"]'),
    facilityValueValue: () => cyGetAmendmentsSummaryListValue('[data-cy="change-facility-value-link"]'),
  }),

  eligibilityCriteriaSummaryListTable: () => ({
    eligibilityCriterionAction: (id) => cyGetEligibilitySummaryListChild(`[data-cy="change-eligibility-criterion-${id}-link"]`),
    eligibilityCriterionValue: (id) => cyGetEligibilitySummaryListValue(`[data-cy="change-eligibility-criterion-${id}-link"]`),
    allEligibilityCriterionActions: () => cyGetEligibilitySummaryListChild('[data-cy^="change-eligibility-criterion-"]'),
  }),

  effectiveDateSummaryListTable: () => ({
    effectiveDateAction: () => cyGetEffectiveDateSummaryListChild('[data-cy="change-effective-date-link"]'),
    effectiveDateValue: () => cyGetEffectiveDateSummaryListValue('[data-cy="change-effective-date-link"]'),
  }),
};

module.exports = checkYourAnswers;
