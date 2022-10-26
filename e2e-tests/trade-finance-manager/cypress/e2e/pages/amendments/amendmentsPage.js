const amendmentsPage = {
  amendmentInProgressBar: () => cy.get('[data-cy="amendment--in-progress-bar"]'),
  amendmentInProgressBarLink: () => cy.get('[data-cy="amendment--in-progress-bar-link"]'),

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
        effectiveDate: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-effective-date"]`),
        bankDecision: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-banks-decision"]`),

        ukefDecisionCoverEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-cover-end-date-decision"]`),
        currentCoverEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-current-cover-end-date"]`),
        newCoverEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-new-cover-end-date"]`),

        ukefDecisionFacilityValue: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-facility-value-decision"]`),
        currentFacilityValue: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-current-facility-value"]`),
        newFacilityValue: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-new-facility-value"]`),

        bankDecisionTag: () => cy.get('@row').get(`[data-cy="amendment--details-${version}-banks-decision"]`),
      };
    },
  },

  amendmentsManagersDecisionConditions: () => cy.get('[data-cy="amendment--managers-decision-conditions"]'),
  amendmentsManagersDecisionReasons: () => cy.get('[data-cy="amendment--managers-decision-reasons"]'),
  amendmentsManagersDecisionComments: () => cy.get('[data-cy="amendment--managers-decision-comments"]'),

  addBankDecisionButton: () => cy.get('[data-cy="add-amendment-bank-decision-link"]'),

  amendmentBankChoiceHeading: () => cy.get('[data-cy="amendment--banks-decision-choice-heading"]'),
  amendmentBankChoiceProceedRadio: () => cy.get('[data-cy="amendment--bank-decision-proceed-radio-button"]'),
  amendmentBankChoiceWithdrawRadio: () => cy.get('[data-cy="amendment--bank-decision-Withdraw-radio-button"]'),

  amendmentBankDecisionReceivedDateHeading: () => cy.get('[data-cy="amendment--banks-decision-receive-date-heading"]'),
  amendmentBankDecisionReceivedDateHint: () => cy.get('[data-cy="amendment--receive-bank-decision-date-hint"]'),
  amendmentBankDecisionReceivedDateDay: () => cy.get('[data-cy="amendment--bank-decision-date-day"]'),
  amendmentBankDecisionReceivedDateMonth: () => cy.get('[data-cy="amendment--bank-decision-date-month"]'),
  amendmentBankDecisionReceivedDateYear: () => cy.get('[data-cy="amendment--bank-decision-date-year"]'),

  amendmentBankDecisionEffectiveDateHeading: () => cy.get('[data-cy="amendment--banks-decision-effective-date-heading"]'),
  amendmentBankDecisionEffectiveDateHint: () => cy.get('[data-cy="amendment--receive-bank-decision-date-hint"]'),
  amendmentBankDecisionEffectiveDateDay: () => cy.get('[data-cy="amendment--bank-decision-date-day"]'),
  amendmentBankDecisionEffectiveDateMonth: () => cy.get('[data-cy="amendment--bank-decision-date-month"]'),
  amendmentBankDecisionEffectiveDateYear: () => cy.get('[data-cy="amendment--bank-decision-date-year"]'),

  amendmentBankDecisionCheckAnswersHeading: () => cy.get('[data-cy="amendment--answers-heading"]'),

  amendmentBankDecisionCheckDecisionHeading: () => cy.get('[data-cy="amendment--bank-decision-choice-heading"]'),
  amendmentBankDecisionCheckDecisionValue: () => cy.get('[data-cy="amendment--bank-decision-choice-response"]'),
  amendmentBankDecisionCheckDecisionLink: () => cy.get('[data-cy="amendment--bank-decision-choice-link"]'),

  amendmentBankDecisionCheckReceivedHeading: () => cy.get('[data-cy="amendment--bank-decision-received-heading"]'),
  amendmentBankDecisionCheckReceivedValue: () => cy.get('[data-cy="amendment--bank-decision-received-response"]'),
  amendmentBankDecisionCheckReceivedLink: () => cy.get('[data-cy="amendment--change-date-received-link"]'),

  amendmentBankDecisionCheckEffectiveHeading: () => cy.get('[data-cy="amendment--bank-decision-effective-heading"]'),
  amendmentBankDecisionCheckEffectiveValue: () => cy.get('[data-cy="amendment--bank-decision-effective-response"]'),
  amendmentBankDecisionCheckEffectiveLink: () => cy.get('[data-cy="amendment--change-effective-date-link"]'),

  amendmentManagersDecisionByHeading: () => cy.get('[data-cy="amendment--decision-made-by-heading"]'),
  amendmentManagersDecisionBy: (version) => cy.get(`[data-cy="amendment--decision-${version}-made-by-value"]`),

  amendmentManagersDecisionDateHeading: () => cy.get('[data-cy="amendment--date-time-heading"]'),
  amendmentManagersDecisionDate: (version) => cy.get(`[data-cy="amendment--decision-${version}-date-time-value"]`),

  amendmentManagersDecisionConditionsHeading: () => cy.get('[data-cy="amendment--conditions-heading"]'),
  amendmentManagersDecisionConditions: (version) => cy.get(`[data-cy="amendment--decision-${version}-ukef-decision-conditions"]`),

  amendmentManagersDecisionReasonsHeading: () => cy.get('[data-cy="amendment--reasons-heading"]'),
  amendmentManagersDecisionReasons: (version) => cy.get(`[data-cy="amendment--decision-${version}-ukef-decision-reasons"]`),

  amendmentManagersDecisionCommentsHeading: () => cy.get('[data-cy="amendment--comments-heading"]'),
  amendmentManagersDecisionComments: (version) => cy.get(`[data-cy="amendment--decision-${version}-ukef-decision-comments"]`),
};

module.exports = amendmentsPage;
