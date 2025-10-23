const { format, fromUnixTime } = require('date-fns');
const {
  TEAM_IDS,
  TFM_AMENDMENT_STATUS,
  DEAL_STATUS,
  TFM_DEAL_STAGE,
  PORTAL_AMENDMENT_STARTED_STATUSES,
  isFutureEffectiveDate,
  PORTAL_AMENDMENT_STATUS,
  DATE_FORMATS,
  AMENDMENT_TYPES,
  STATUS_TAG_COLOURS,
  isDealCancelled,
  isPortalFacilityAmendmentsFeatureFlagEnabled,
} = require('@ukef/dtfs2-common');
const { DECISIONS, DEAL } = require('../../constants');
const { userIsInTeam } = require('../../helpers/user');

/**
 * @param {object} deal
 * @param {Array} userTeams
 * @returns {boolean}
 * function to show amendment button
 * checks submissionType, tfm stages, deal status, and if PIM user
 */
const showAmendmentButton = (deal, userTeams) => {
  const acceptableSubmissionType = [DEAL.SUBMISSION_TYPE.AIN, DEAL.SUBMISSION_TYPE.MIN];
  const acceptableUserTeamId = TEAM_IDS.PIM;
  const acceptableStages = [DEAL.DEAL_STAGE.CONFIRMED, DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS];
  const unacceptableStatuses = [DEAL_STATUS.CANCELLED, DEAL_STATUS.PENDING_CANCELLATION];

  return (
    acceptableSubmissionType.includes(deal.dealSnapshot.submissionType) &&
    userTeams.some((teamId) => teamId === acceptableUserTeamId) &&
    acceptableStages.includes(deal.tfm.stage) &&
    !unacceptableStatuses.includes(deal.status)
  );
};

const userCanEditManagersDecision = (amendment, user) => {
  const isManager = userIsInTeam(user, [TEAM_IDS.UNDERWRITER_MANAGERS]);
  const hasSubmittedDecision = amendment?.ukefDecision?.submitted;
  return !!(isManager && !hasSubmittedDecision);
};

const userCanEditBankDecision = (amendment, user) => {
  const isPim = userIsInTeam(user, [TEAM_IDS.PIM]);
  const hasSubmittedDecision = amendment?.ukefDecision?.submitted && !amendment?.bankDecision?.submitted;
  return !!(isPim && hasSubmittedDecision);
};

/**
 * Ascertain whether the requested amendment
 * have been declined or not.
 * @param {object} amendment Amendment object
 * @returns {boolean} Whether both the amendments decision has been declined by the underwriter.
 */
const ukefDecisionRejected = (amendment) => {
  const { changeFacilityValue, changeCoverEndDate } = amendment;
  const { value, coverEndDate } = amendment.ukefDecision;
  const { DECLINED } = DECISIONS.UNDERWRITER_MANAGER_DECISIONS;

  // Ensure not all of the amendment requests are declined

  // Dual amendment request
  if (changeFacilityValue && changeCoverEndDate) {
    return value === DECLINED && coverEndDate === DECLINED;
  }
  // Single amendment request
  return value === DECLINED || coverEndDate === DECLINED;
};

/**
 * @param {object} amendment
 * @param {string} decisionType
 * @returns {boolean}
 * checks if amendment has declined or approved with conditions and returns true if so
 */
const validateUkefDecision = (ukefDecision, decisionType) => ukefDecision?.coverEndDate === decisionType || ukefDecision?.value === decisionType;

/**
 * A deal with one of these stages cannot be amended
 */
const nonAmendableDealStages = [TFM_DEAL_STAGE.CANCELLED];

/**
 * Gets amendments that are in progress and submitted by PIM.
 * These are amendments that require UKEF approval
 * They have been submitted but not completed as they do not have a UKEF decision yet.
 * @param {object} getAmendmentsInProgressSubmittedFromPim Params
 * @param {import('@ukef/dtfs2-common').TfmDeal} getAmendmentsInProgress Params.deal - the deal
 * @param {import('@ukef/dtfs2-common').TfmFacilityAmendment[]} getAmendmentsInProgress Params.amendments - the amendments
 * @returns {import('@ukef/dtfs2-common').TfmFacilityAmendment[]} - the amendments that are in progress
 */
const getAmendmentsInProgressSubmittedFromPim = ({ amendments, deal }) => {
  if (nonAmendableDealStages.includes(deal.tfm.stage)) {
    return [];
  }

  if (Array.isArray(amendments) && amendments.length) {
    return amendments.filter(({ status, submittedByPim }) => status === TFM_AMENDMENT_STATUS.IN_PROGRESS && submittedByPim);
  }

  return [];
};

/**
 * Gets amendments that are in progress.
 * Portal amendments which are ready for checkers or furthers makers input required
 * TFM amendments which have not yet been submitted by PIM
 * Returns the portal and tfm amendments that are in progress
 * If they are in progress
 * If the amendment in progress button should be shown
 * If the continue amendment button should be shown
 * @param {object} getAmendmentsInProgress Params
 * @param {import('@ukef/dtfs2-common').TfmDeal} deal Params.deal - the deal
 * @param {import('@ukef/dtfs2-common').TfmFacilityAmendment[] | import('@ukef/dtfs2-common').PortalFacilityAmendment[]} getAmendmentsInProgress Params.amendments - the amendments
 * @param {import('@ukef/dtfs2-common').Team[]} teams - the teams of the user
 * @returns {import('@ukef/dtfs2-common').GetTfmAmendmentInProgressResponse} - the amendments that are in progress
 */
const getAmendmentsInProgress = ({ amendments, deal, teams }) => {
  if (Array.isArray(amendments) && amendments.length) {
    // TFM amendments that are in progress and not submitted by PIM - submittedByPim means tfm amendment is submitted, hence aliased to submitted
    const unsubmittedTFMAmendments = amendments.filter(({ status, submittedByPim: submitted }) => status === TFM_AMENDMENT_STATUS.IN_PROGRESS && !submitted);
    // Portal amendments which are in progress
    const inProgressPortalAmendments = amendments.filter(({ status }) => PORTAL_AMENDMENT_STARTED_STATUSES.includes(status));

    const futureEffectiveDatePortalAmendments = amendments.filter(
      ({ status, effectiveDate }) => status === PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED && isFutureEffectiveDate(effectiveDate),
    );

    const dealIsCancelled = isDealCancelled(deal.tfm);

    const hasInProgressPortalAmendments = inProgressPortalAmendments.length > 0 && !dealIsCancelled;
    const hasFutureEffectiveDatePortalAmendments = futureEffectiveDatePortalAmendments.length > 0 && !dealIsCancelled;

    let formattedFutureEffectiveDatePortalAmendments = [];

    if (hasFutureEffectiveDatePortalAmendments) {
      formattedFutureEffectiveDatePortalAmendments = futureEffectiveDatePortalAmendments.map(
        ({ ukefFacilityId, effectiveDate, facilityId, referenceNumber, dealId }) => ({
          facilityId,
          ukefFacilityId,
          effectiveDate: format(fromUnixTime(effectiveDate), DATE_FORMATS.DD_MMMM_YYYY),
          referenceNumber,
          href: `/case/${dealId}/facility/${facilityId}#amendments`,
        }),
      );
    }

    const amendmentsInProgress = [...unsubmittedTFMAmendments, ...inProgressPortalAmendments];
    const hasAmendmentInProgress = amendmentsInProgress.length > 0;

    // If any TFM amendments which are in progress have been submitted by PIM
    const hasAmendmentSubmittedByPim = unsubmittedTFMAmendments.some(({ submittedByPim }) => submittedByPim);

    // If any TFM amendments have the status of in progress
    const hasAmendmentInProgressButton = unsubmittedTFMAmendments.some(({ status }) => status === TFM_AMENDMENT_STATUS.IN_PROGRESS);
    // Show continue amendment button if there is an in progress TFM amendment that has not been submitted by PIM and if the button can be shown
    const showContinueAmendmentButton = hasAmendmentInProgressButton && !hasAmendmentSubmittedByPim && showAmendmentButton(deal, teams);

    return {
      amendmentsInProgress,
      hasAmendmentInProgress,
      inProgressPortalAmendments,
      hasInProgressPortalAmendments,
      hasAmendmentInProgressButton,
      showContinueAmendmentButton,
      hasFutureEffectiveDatePortalAmendments,
      formattedFutureEffectiveDatePortalAmendments,
    };
  }

  return {
    amendmentsInProgress: [],
    hasAmendmentInProgress: false,
    hasAmendmentInProgressButton: false,
    showContinueAmendmentButton: false,
  };
};

/**
 * Maps all amendments for a facility
 * Reverses array so displayed in reverse order (most recent first)
 * Generates the eligibility rows for portal amendments which populates the eligibility table on the facility amendment tab
 * Generates a isPortalAmendment flag if amendment is portal amendment or not
 * Returns the mapped amendments with isPortalAmendment flag and eligibilityRows if portal amendment
 * @param {import('@ukef/dtfs2-common').PortalFacilityAmendment[] | import('@ukef/dtfs2-common').TfmFacilityAmendment[]} amendmentsArray
 * @returns {import('@ukef/dtfs2-common').AmendmentWithEligibilityRows[]} - the mapped portal amendments
 */
const generatePortalAmendmentEligibilityRows = (amendmentsArray) => {
  let amendments = amendmentsArray;

  if (isPortalFacilityAmendmentsFeatureFlagEnabled()) {
    // reverses array so most recent first
    amendments = amendmentsArray.reverse();
  }

  const mappedAmendments = amendments.map((amendment) => {
    let isPortalAmendment = false;

    if (amendment.type === AMENDMENT_TYPES.PORTAL) {
      isPortalAmendment = true;
    }

    // if not portal amendment, return amendment and flag
    if (!isPortalAmendment) {
      return {
        ...amendment,
        isPortalAmendment,
      };
    }

    /**
     * maps through eligibility criteria for each amendment
     * creates a row for each criterion
     * with number of criteria
     * A green tag for true or red if false
     * The eligibility text for each criterion
     */
    const eligibilityRows = amendment.eligibilityCriteria.criteria.map((criterion) => {
      const { id, text, answer } = criterion;

      const eligibilityId = `<span data-cy="amendment-${amendment.amendmentId}-eligibility-table-criterion-${id}-id">${id}</span>`;
      const eligibilityText = `<span data-cy="amendment-${amendment.amendmentId}-eligibility-table-criterion-${id}-text">${text}</span>`;

      // set tag colour to green if true and red if not
      const tagColour = answer === true ? STATUS_TAG_COLOURS.GREEN : STATUS_TAG_COLOURS.RED;
      const tagText = String(answer).toUpperCase();

      // html for tag including text and colour
      const tagHtml = `<span class="govuk-tag govuk-tag--${tagColour}" data-cy="amendment-${amendment.amendmentId}-eligibility-table-criterion-${id}-tag"><strong>${tagText}</strong></span>`;

      // return the generated row for each amendment's eligibility criteria
      return [{ html: eligibilityId }, { html: tagHtml }, { html: eligibilityText }];
    });

    return {
      ...amendment,
      isPortalAmendment,
      eligibilityRows,
    };
  });

  return mappedAmendments;
};

module.exports = {
  showAmendmentButton,
  userCanEditManagersDecision,
  userCanEditBankDecision,
  ukefDecisionRejected,
  validateUkefDecision,
  getAmendmentsInProgress,
  getAmendmentsInProgressSubmittedFromPim,
  generatePortalAmendmentEligibilityRows,
};
