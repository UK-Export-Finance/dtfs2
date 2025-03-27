const cyGetEligibilitySummaryListChild = (selector) => cy.get('[data-cy="eligibility-summary-list"]').find(selector);

const amendmentSummaryList = {
  amendmentSummaryListTable: () => ({
    amendmentOptionsChangeLink: () => cy.get('[data-cy="change-amendment-options-link"]'),
    amendmentOptionsValue: () => cy.get('[data-cy="amendment-options-value"]'),
    amendmentOptionsKey: () => cy.get(`.amendment-options-key`),
    coverEndDateChangeLink: () => cy.get('[data-cy="change-cover-end-date-link"]'),
    coverEndDateValue: () => cy.get(`.amendment-cover-end-date-value`),
    coverEndDateKey: () => cy.get(`.amendment-cover-end-date-key`),
    facilityEndDateChangeLink: () => cy.get('[data-cy="change-facility-end-date-link"]'),
    facilityEndDateValue: () => cy.get(`.amendment-facility-end-date-value`),
    facilityEndDateKey: () => cy.get(`.amendment-facility-end-date-key`),
    bankReviewDateChangeLink: () => cy.get('[data-cy="change-bank-review-date-link"]'),
    bankReviewDateValue: () => cy.get(`.amendment-bank-review-date-value`),
    bankReviewDateKey: () => cy.get(`.amendment-bank-review-date-key`),
    facilityValueChangeLink: () => cy.get('[data-cy="change-facility-value-link"]'),
    facilityValueValue: () => cy.get(`.amendment-facility-value-value`),
    facilityValueKey: () => cy.get(`.amendment-facility-value-key`),
  }),

  eligibilityCriteriaSummaryListTable: () => ({
    eligibilityCriterionChangeLink: (id) => cy.get(`[data-cy="change-eligibility-criterion-${id}-link"]`),
    eligibilityCriterionValue: (id) => cy.get(`.amendment-eligibility-${id}-value`),
    eligibilityCriterionKey: (id) => cy.get(`.amendment-eligibility-${id}-key`),
    allEligibilityCriterionChangeLinks: () => cyGetEligibilitySummaryListChild('[data-cy^="change-eligibility-criterion-"]'),
  }),

  effectiveDateSummaryListTable: () => ({
    effectiveDateKey: () => cy.get(`.amendment-effective-date-key`),
    effectiveDateValue: () => cy.get(`.amendment-effective-date-value`),
    effectiveDateChangeLink: () => cy.get('[data-cy="change-effective-date-link"]'),
  }),
};

module.exports = amendmentSummaryList;
