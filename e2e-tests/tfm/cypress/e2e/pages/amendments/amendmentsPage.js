const amendmentsPage = {
  amendmentInProgressBar: () => cy.get('[data-cy="amendment--in-progress-bar"]'),
  amendmentInProgressBarLink: () => cy.get('[data-cy="amendment--in-progress-bar-link"]'),

  portalAmendmentInProgressBar: () => cy.get('[data-cy="portal-amendment--in-progress-bar"]'),
  portalAmendmentInProgressDealBar: () => cy.get('[data-cy="portal-amendment--in-progress-deal-bar"]'),

  amendmentFutureEffectiveDateFacilityBar: () => cy.get('[data-cy="amendment--future-effective-date-facility-bar"]'),

  amendmentFutureEffectiveDateAmendmentBar: () => cy.get('[data-cy="amendment--future-effective-date-amendment-bar"]'),

  amendmentFutureEffectiveDateDealBar: (ukefFacilityId) => cy.get(`[data-cy="amendment--future-effective-date-deal-bar-${ukefFacilityId}"]`),
  amendmentFutureEffectiveDateDealLink: (ukefFacilityId) => cy.get(`[data-cy="amendment--future-effective-date-deal-link-${ukefFacilityId}"]`),

  amendmentRequestHeading: () => cy.get('[data-cy="amendment--request-heading"]'),
  amendmentRequestHint: () => cy.get('[data-cy="amendments--request-hint"]'),
  amendmentRequestDayInput: () => cy.get('[data-cy="amendment--request-date-day"]'),
  amendmentRequestMonthInput: () => cy.get('[data-cy="amendment--request-date-month"]'),
  amendmentRequestYearInput: () => cy.get('[data-cy="amendment--request-date-year"]'),

  amendmentNewCoverEndDateDay: () => cy.get('[data-cy="amendment--cover-end-date"]'),
  amendmentFacilityValueInput: () => cy.get('[data-cy="amendment--facility-value"]'),
  amendmentCurrentFacilityValue: () => cy.get('[data-cy="amendment--current-facility-value"]'),

  amendmentCurrentCoverEndDate: () => cy.get('[data-cy="amendment--current-cover-end-date"]'),

  amendmentCoverEndDateCheckbox: () => cy.get('[data-cy="amendment--coverEndDate-checkbox"]'),
  amendmentFacilityValueCheckbox: () => cy.get('[data-cy="amendment--facilityValue-checkbox"]'),

  errorMessage: () => cy.get('[data-cy="amendment--inline-error"]'),

  amendmentRequestApprovalYes: () => cy.get('[data-cy="amendment--request-approval-yes"]'),
  amendmentRequestApprovalNo: () => cy.get('[data-cy="amendment--request-approval-no"]'),

  isUsingFacilityEndDateYes: () => cy.get('[data-cy="amendment--is-using-facility-end-date-yes"]'),
  isUsingFacilityEndDateNo: () => cy.get('[data-cy="amendment--is-using-facility-end-date-no"]'),

  amendmentCurrentFacilityEndDate: () => cy.get('[data-cy="amendment--current-facility-end-date"]'),
  amendmentFacilityEndDateDetails: () => cy.get('[data-cy="amendment--facility-end-date-details"]'),

  amendmentCurrentBankReviewDate: () => cy.get('[data-cy="amendment--current-bank-review-date"]'),
  amendmentBankReviewDateDetails: () => cy.get('[data-cy="amendment--bank-review-date-details"]'),

  addAmendmentButton: () => cy.get('[data-cy="amendment--add-amendment-button"]'),
  amendmentSendToBankButton: () => cy.get('[data-cy="amendment--send-to-bank-button"]'),

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

  amendmentAnswerBankRequestDate: () => cy.get('[data-cy="amendment--bank-request-date-response"]'),
  amendmentAnswerRequireApproval: () => cy.get('[data-cy="amendment--require-approval-response"]'),
  amendmentAnswerEffectiveDate: () => cy.get('[data-cy="amendment--effective-date-response"]'),
  amendmentAnswerCoverEndDate: () => cy.get('[data-cy="amendment--cover-end-date-response"]'),
  amendmentAnswerIsUsingFacilityEndDate: () => cy.get('[data-cy="amendment--is-using-facility-end-date-response"]'),
  amendmentAnswerIsUsingFacilityEndDateChangeLink: () => cy.get('[data-cy="amendment--is-using-facility-end-date-link"]'),
  amendmentAnswerFacilityEndDate: () => cy.get('[data-cy="amendment--facility-end-date-response"]'),
  amendmentAnswerFacilityEndDateChangeLink: () => cy.get('[data-cy="amendment--facility-end-date-link"]'),
  amendmentAnswerBankReviewDate: () => cy.get('[data-cy="amendment--bank-review-date-response"]'),
  amendmentAnswerBankReviewDateChangeLink: () => cy.get('[data-cy="amendment--bank-review-date-link"]'),
  amendmentAnswerFacilityValue: () => cy.get('[data-cy="amendment--facility-value-response"]'),

  amendmentDetails: {
    row: (index) => {
      cy.get(`[data-cy="amendment--details-${index}"]`).as('row');
      return {
        heading: () => cy.get('@row').get(`[data-cy="amendment--heading-${index}"]`),
        effectiveDate: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-effective-date"]`),
        requireApproval: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-require-approval"]`),
        bankDecision: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-banks-decision"]`),

        ukefDecisionCoverEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-cover-end-date-decision"]`),
        currentCoverEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-current-cover-end-date"]`),
        newCoverEndDate: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-new-cover-end-date"]`),

        ukefDecisionFacilityValue: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-facility-value-decision"]`),
        currentFacilityValue: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-current-facility-value"]`),
        newFacilityValue: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-new-facility-value"]`),

        bankDecisionTag: () => cy.get('@row').get(`[data-cy="amendment--details-${index}-banks-decision"]`),

        eligibilityCriteriaTable: () => cy.get(`[data-cy="amendment-${index}-eligibility-criteria"]`),

        eligibilityCriteriaIdColumn: (amendmentId, criterionId) => cy.get(`[data-cy="amendment-${amendmentId}-eligibility-table-criterion-${criterionId}-id"]`),
        eligibilityCriteriaTextColumn: (amendmentId, criterionId) =>
          cy.get(`[data-cy="amendment-${amendmentId}-eligibility-table-criterion-${criterionId}-text"]`),
        eligibilityCriteriaTagColumn: (amendmentId, criterionId) =>
          cy.get(`[data-cy="amendment-${amendmentId}-eligibility-table-criterion-${criterionId}-tag"]`),
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
