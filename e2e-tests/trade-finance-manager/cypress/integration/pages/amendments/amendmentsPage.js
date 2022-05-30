const amendmentsPage = {
  amendmentRequestHeading: () => cy.get('[data-cy="amendment--request-heading"]'),
  amendmentRequestHint: () => cy.get('[data-cy="amendments--request-hint"]'),
  amendmentRequestDayInput: () => cy.get('[data-cy="amendment--request-date-day"]'),
  amendmentRequestMonthInput: () => cy.get('[data-cy="amendment--request-date-month"]'),
  amendmentRequestYearInput: () => cy.get('[data-cy="amendment--request-date-year"]'),

  amendmentNewCoverEndDateDay: () => cy.get('[data-cy="amendment--cover-end-date"]'),
  amendmentCoverEndDateDayInput: () => cy.get('[data-cy="amendment--cover-end-date-day"]'),
  amendmentCoverEndDateMonthInput: () => cy.get('[data-cy="amendment--cover-end-date-month"]'),
  amendmentCoverEndDateYearInput: () => cy.get('[data-cy="amendment--cover-end-date-year"]'),
  amendmentFacilityValueInput: () => cy.get('[data-cy="amendment--facility-value"]'),
  amendmentCurrentFacilityValue: () => cy.get('[data-cy="amendment--current-facility-value"]'),

  amendmentEffectiveDayInput: () => cy.get('[data-cy="amendment--effective-date-day"]'),
  amendmentEffectiveMonthInput: () => cy.get('[data-cy="amendment--effective-date-month"]'),
  amendmentEffectiveYearInput: () => cy.get('[data-cy="amendment--effective-date-year"]'),
  amendmentCurrentCoverEndDate: () => cy.get('[data-cy="amendment--current-cover-end-date"]'),

  amendmentCoverEndDateCheckbox: () => cy.get('[data-cy="amendment--coverEndDate-checkbox"]'),
  amendmentFacilityValueCheckbox: () => cy.get('[data-cy="amendment--facilityValue-checkbox"]'),

  errorSummary: () => cy.get('[data-cy="amendment--error-summary"]'),
  errorMessage: () => cy.get('[data-cy="amendment--inline-error"]'),

  amendmentRequestApprovalYes: () => cy.get('[data-cy="amendment--request-approval-yes"]'),
  amendmentRequestApprovalNo: () => cy.get('[data-cy="amendment--request-approval-no"]'),

  addAmendmentButton: () => cy.get('[data-cy="amendment--add-amendment-button"]'),
  continueAmendmentButton: () => cy.get('[data-cy="amendment--continue-amendment-button"]'),
  continueAmendment: () => cy.get('[data-cy="amendment--continue-button"]'),
  amendmentSendToBankButton: () => cy.get('[data-cy="amendment--send-to-bank-button"]'),
  cancelLink: () => cy.get('[data-cy="amendment--cancel-button"]'),

  leadUnderwriterHeading: () => cy.get('[data-cy="amendment-assign-lead-underwriter-heading"]'),

  assignedToSelectInput: () => cy.get('[data-cy="assigned-to-select-input"]').first(),
  assignedToSelectInputOption: () => cy.get('[data-cy="assigned-to-select-input"] option'),
  assignedToSelectInputSelectedOption: () => cy.get('[data-cy="assigned-to-select-input"]').first().find('option:selected'),

  underWriterManagerDecisionCoverEndDateHeading: () => cy.get('[data-cy="amendment--managers-decision-cover-end-date-heading"]'),

  underWriterManagerDecisionErrorSummaryItems: () => cy.get('[data-cy="error-summary"] li'),

  underWriterManagerDecisionRadioInputApproveWithoutConditions: () => cy.get('[data-cy="amendment--approve-without-conditions-radio-button"]'),
  underWriterManagerDecisionRadioInputApproveWithConditions: () => cy.get('[data-cy="amendment--approve-with-conditions-radio-button"]'),
  underWriterManagerDecisionRadioInputDecline: () => cy.get('[data-cy="amendment--decline-radio-button"]'),

  underWriterManagerDecisionRadioInputValidationError: () => cy.get('[data-cy="decision-input-error"]'),

  underWritingSubmitButton: () => cy.get('[data-cy="amendment--continue-button"]'),
  underWritingCancelLink: () => cy.get('[data-cy="cancel-link"]'),

  amendmentAnswerBankRequestDate: () => cy.get('[data-cy="amendment--bank-request-date-response"]'),
  amendmentAnswerRequireApproval: () => cy.get('[data-cy="amendment--require-approval-response"]'),
  amendmentAnswerEffectiveDate: () => cy.get('[data-cy="amendment--effective-date-response"]'),
  amendmentAnswerCoverEndDate: () => cy.get('[data-cy="amendment--cover-end-date-response"]'),
  amendmentAnswerFacilityValue: () => cy.get('[data-cy="amendment--facility-value-response"]'),

  amendmentDetails: {
    row: (version) => {
      cy.get(`[data-cy="amendment--details-${version}"]`).as('row');
      return {
        heading: () => cy.get('@row').get(`[data-cy="amendment--heading-version-${version}"]`),
        bankDecision: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-banks-decision"]`),

        ukefDecisionCoverEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-cover-end-date-decision"]`),
        currentCoverEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-current-cover-end-date"]`),
        newCoverEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-new-cover-end-date"]`),

        ukefDecisionFacilityValue: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-facility-value-decision"]`),
        currentFacilityValue: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-current-facility-value"]`),
        newFacilityValue: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-new-facility-value"]`),
      };
    },
  },

  amendmentsManagersDecisionConditions: () => cy.get('[data-cy="amendment--managers-decision-conditions"]'),
  amendmentsManagersDecisionReasons: () => cy.get('[data-cy="amendment--managers-decision-reasons"]'),
  amendmentsManagersDecisionComments: () => cy.get('[data-cy="amendment--managers-decision-comments"]'),
};

module.exports = amendmentsPage;
