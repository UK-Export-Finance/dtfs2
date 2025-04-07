const { format, add } = require('date-fns');
const { PORTAL_AMENDMENT_STATUS } = require('@ukef/dtfs2-common');
const CONSTANTS = require('../constants');

/**
 * Extracts an array of facilities that have been marked as eligible for resubmission
 * with the "canResubmitIssuedFacilities" flag set to true.
 *
 * @param {Object} application - The application object containing facilities data.
 * @param {Object[]} application.facilities.items - An array of facility objects.
 * @param {Object} application.facilities.items[].details - The details of a facility.
 * @param {string} application.facilities.items[].details.name - The name of the facility.
 * @param {string} application.facilities.items[].details._id - The unique identifier of the facility.
 * @param {boolean} application.facilities.items[].details.canResubmitIssuedFacilities - Flag indicating if the facility can be resubmitted.
 * @returns {Object[]} An array of objects representing facilities that can be resubmitted,
 * each containing the facility's name and ID.
 */
const facilitiesChangedToIssuedAsArray = (application) => {
  const hasChanged = [];

  application.facilities.items.map((facility) => {
    if (facility.details.canResubmitIssuedFacilities) {
      const changed = {
        name: facility.details.name,
        id: facility.details._id,
      };
      hasChanged.push(changed);
    }

    return hasChanged;
  });

  return hasChanged;
};

const summaryIssuedChangedToIssued = (params) => {
  const { acceptableStatus, acceptableRole, app, data, user } = params;

  return acceptableStatus.includes(app.status) && user.roles.some((role) => acceptableRole.includes(role)) && Boolean(data.details.canResubmitIssuedFacilities);
};

const summaryIssuedUnchanged = (params) => {
  const { acceptableStatus, acceptableRole, facilitiesChanged, app, data, user } = params;
  return (
    acceptableStatus.includes(app.status) &&
    user.roles.some((role) => acceptableRole.includes(role)) &&
    Boolean(!data.details.hasBeenIssued) &&
    facilitiesChanged.length !== 0
  );
};

/**
 * this function checks that the deal is an AIN or MIN
 * checks that it has been submitted to UKEF
 * if any unissued facilities
 * if changes required add to application type and status
 * */
const areUnissuedFacilitiesPresent = (application) => {
  const ACCEPTABLE_STATUSES = [
    CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
    CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
    CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
    CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED,
  ];
  const acceptableApplicationType = [CONSTANTS.DEAL_SUBMISSION_TYPE.AIN, CONSTANTS.DEAL_SUBMISSION_TYPE.MIN, CONSTANTS.DEAL_SUBMISSION_TYPE.MIA];

  if (!acceptableApplicationType.includes(application.submissionType)) {
    return false;
  }
  if (!ACCEPTABLE_STATUSES.includes(application.status)) {
    return false;
  }
  /**
   * accounts for edge case
   * when MIA -> MIN and returned to maker without issuing facilities (must be able to see unissued facilities link)
   * does not work if not MIA (ie AIN first submission)
   */
  if (application.status === CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED && application.submissionCount < 1) {
    return false;
  }

  let hasUnissuedFacilities = false;

  application.facilities.items.map((facility) => {
    if (facility.details.hasBeenIssued === false) {
      hasUnissuedFacilities = true;
      return hasUnissuedFacilities;
    }
    return hasUnissuedFacilities;
  });

  return hasUnissuedFacilities;
};

// adds 3 months to date and returns formatted string deadline date
const formatIssueDeadlineDate = (initialDate) => {
  // if initialDate then uses that or if not provided then uses today
  const date = initialDate || new Date();
  const deadlineDate = add(date, { months: 3 });

  return format(deadlineDate, 'dd MMM yyyy');
};

/*
   This function sets the deadline to display for unissued
   facilities on the unissued facilities table 3 months
   from date of submission or MIN submission or now based on submission type
*/
const facilityIssueDeadline = (application) => {
  // if MIA, then deadline should be 3 months from today
  if (application.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.MIA) {
    return formatIssueDeadlineDate();
  }

  // if MIN, then deadline should be 3 months from MIN submission date
  if (application.submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.MIN && application.manualInclusionNoticeSubmissionDate) {
    // converts to timestamp from epoch
    const date = new Date(parseInt(application.manualInclusionNoticeSubmissionDate, 10));
    return formatIssueDeadlineDate(date);
  }

  // if AIN then 3 months from submission date
  if (application.submissionDate) {
    // converts to timestamp from epoch
    const date = new Date(parseInt(application.submissionDate, 10));
    return formatIssueDeadlineDate(date);
  }

  return null;
};

/* govukTable mapping function to return array of facilities which are
   not yet issued for the cover-start-date.njk template.
*/
const getUnissuedFacilitiesAsArray = (facilities, application) =>
  facilities.items
    .filter(({ details }) => !details.hasBeenIssued)
    .map(({ details }, index) => [
      { text: details.name },
      { text: details.ukefFacilityId },
      { text: `${details.currency.id} ${details.value.toLocaleString('en', { minimumFractionDigits: 2 })}` },
      {
        text: facilityIssueDeadline(application),
      },
      {
        html: `<a href = '/gef/application-details/${details.dealId}/unissued-facilities/${details._id}/about' class='govuk-button govuk-button--secondary govuk-!-margin-0' data-cy='update-facility-button-${index}'>Update</a>`,
      },
    ]);

/**
 * This is a bespoke govUkTable mapping function which
 * returns an array of all the facilities specifically
 * for the cover-start-date.njk template.
 * @param {Object} facilities
 * @returns {Array}
 */
const getIssuedFacilitiesAsArray = (facilities) => {
  if (facilities.items) {
    return facilities.items
      .filter(({ details }) => !details.coverDateConfirmed && details.hasBeenIssued)
      .map(({ details }, index) => [
        { text: details?.name },
        { text: details?.ukefFacilityId },
        { text: `${details?.currency?.id} ${details.value?.toLocaleString('en', { minimumFractionDigits: 2 })}` },
        {
          html: `<a href = '/gef/application-details/${details?.dealId}/${details?._id}/confirm-cover-start-date' class = 'govuk-button govuk-button--secondary govuk-!-margin-0' data-cy='update-coverStartDate-button-${index}'>Update</a>`,
        },
      ]);
  }
  return [];
};

const getFacilityCoverStartDate = (facility) => {
  const epoch = facility.details.coverStartDate ? facility.details.coverStartDate : null;
  return {
    date: format(new Date(epoch), 'd'),
    month: format(new Date(epoch), 'M'),
    year: format(new Date(epoch), 'yyyy'),
  };
};

const coverDatesConfirmed = (facilities) => {
  if (facilities.items.filter(({ details }) => details.hasBeenIssued).length > 0) {
    return (
      facilities.items.filter(({ details }) => details.hasBeenIssued).length === facilities.items.filter(({ details }) => details.coverDateConfirmed).length
    );
  }
  return false;
};

/**
 * Determines if any facilities in the given application have been issued.
 *
 * @param {Object} application - The application object containing facility data.
 * @returns {boolean} Returns `true` if one or more facilities have been issued, otherwise `false`.
 */
const isFacilityResubmissionAvailable = (application) => facilitiesChangedToIssuedAsArray(application).length > 0;

/**
 * Helper function ascertain whether the facility confirmation message should appear or not.
 * It takes into account recent issuance of a facility, submission type to be MIN.
 * @param {Object} application Application object with facilities
 * @returns {boolean} Boolean value
 */
const issuedFacilityConfirmation = (application) => {
  const hasUnissuedToIssued = isFacilityResubmissionAvailable(application);
  const { submissionType } = application;

  return hasUnissuedToIssued && (submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.MIN || submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
};

const facilityTypeStringGenerator = (facilityType) => {
  if (facilityType) {
    const type = CONSTANTS.FACILITY_TYPE[facilityType.toUpperCase()];
    return type.toLowerCase();
  }
  return null;
};

/**
 * Determines if a facility amendment is currently in progress for a given application.
 *
 * @param {Object} application - The application object to check.
 * @param {boolean} application.sPortalAmendmentInProgress - Indicates if a portal amendment is in progress.
 * @param {string} application.facilityIdWithAmendmentInProgress - The ID of the facility with an amendment in progress.
 * @param {string} application.portalAmendmentStatus - The current status of the portal amendment.
 * @returns {boolean} Returns `true` if a facility amendment is in progress and has not been acknowledged; otherwise, `false`.
 */
const isFacilityAmendmentInProgress = (application) => {
  return Boolean(
    application.isPortalAmendmentInProgress &&
      application.facilityIdWithAmendmentInProgress &&
      application.portalAmendmentStatus !== PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
  );
};

module.exports = {
  areUnissuedFacilitiesPresent,
  getUnissuedFacilitiesAsArray,
  facilitiesChangedToIssuedAsArray,
  getIssuedFacilitiesAsArray,
  getFacilityCoverStartDate,
  coverDatesConfirmed,
  facilityIssueDeadline,
  isFacilityResubmissionAvailable,
  summaryIssuedChangedToIssued,
  summaryIssuedUnchanged,
  issuedFacilityConfirmation,
  facilityTypeStringGenerator,
  formatIssueDeadlineDate,
  isFacilityAmendmentInProgress,
};
