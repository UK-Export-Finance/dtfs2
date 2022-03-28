const { format, add } = require('date-fns');
const CONSTANTS = require('../constants');

/*
   Maps through facilities to check for canResubmitIssuedFacilities to be true
   if true, adds to array and returns array
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
  const {
    acceptableStatus,
    acceptableRole,
    app,
    data,
    user,
  } = params;

  return acceptableStatus.includes(app.status)
   && user.roles.some((role) => acceptableRole.includes(role))
   && Boolean(data.details.canResubmitIssuedFacilities);
};

const summaryIssuedUnchanged = (params) => {
  const {
    acceptableStatus,
    acceptableRole,
    facilitiesChanged,
    app,
    data,
    user,
  } = params;
  return acceptableStatus.includes(app.status)
   && user.roles.some((role) => acceptableRole.includes(role))
   && Boolean(!data.details.hasBeenIssued)
   && facilitiesChanged.length !== 0;
};

/**
   * this function checks that the deal is an AIN or MIN
   * checks that it has been submitted to UKEF
   * if any unissued facilitites
   * if changes required add to application type and status
* */
const areUnissuedFacilitiesPresent = (application) => {
  const acceptableStatuses = [
    CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED,
    CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS,
    CONSTANTS.DEAL_STATUS.UKEF_APPROVED_WITH_CONDITIONS,
    CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED,
  ];
  const acceptableApplicationType = [
    CONSTANTS.DEAL_SUBMISSION_TYPE.AIN,
    CONSTANTS.DEAL_SUBMISSION_TYPE.MIN,
    CONSTANTS.DEAL_SUBMISSION_TYPE.MIA,
  ];

  if (!acceptableApplicationType.includes(application.submissionType)) {
    return false;
  }
  if (!acceptableStatuses.includes(application.status)) {
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

/*
   This function sets the deadline to display for unissued
   facilities on the unissued facilities table 3 months
   from date of submission
*/
const facilityIssueDeadline = (submissionDate) => {
  if (submissionDate) {
  // converts to timestamp from epoch - '+' to convert from str to int
    const date = new Date(parseInt(submissionDate, 10));
    const deadlineDate = add(new Date(date), { months: 3 });

    return format(deadlineDate, 'dd MMM yyyy');
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
        text: application.manualInclusionNoticeSubmissionDate ? facilityIssueDeadline(application.manualInclusionNoticeSubmissionDate)
          : facilityIssueDeadline(application.submissionDate),
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
    return facilities.items.filter(({ details }) => !details.coverDateConfirmed && details.hasBeenIssued)
      .map(({ details }, index) =>
        [
          { text: details?.name },
          { text: details?.ukefFacilityId },
          { text: `${details?.currency?.id} ${details.value?.toLocaleString('en', { minimumFractionDigits: 2 })}` },
          { html: `<a href = '/gef/application-details/${details?.dealId}/${details?._id}/confirm-cover-start-date' class = 'govuk-button govuk-button--secondary govuk-!-margin-0' data-cy='update-coverStartDate-button-${index}'>Update</a>` },
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
    return facilities.items.filter(({ details }) => details.hasBeenIssued).length
   === facilities.items.filter(({ details }) => details.coverDateConfirmed).length;
  }
  return false;
};

/*
   function returns true or false based on length of array
   of facilities that have changed to issued from unissued
*/
const hasChangedToIssued = (application) => {
  const canResubmitIssuedFacilities = facilitiesChangedToIssuedAsArray(application);
  return canResubmitIssuedFacilities.length > 0;
};

const facilitiesChangedPresent = (application) => facilitiesChangedToIssuedAsArray(application).length > 0;

/**
 * Helper function ascertain whether the facility confirmation message should appear or not.
 * It takes into account recent issuance of a facility, submission type to be MIN.
 * @param {Object} application Application object with facilities
 * @returns {Boolean} Boolean value
 */
const issuedFacilityConfirmation = (application) => {
  const hasUnissuedToIssued = hasChangedToIssued(application);
  const { submissionType } = application;

  return hasUnissuedToIssued
  && (submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.MIN || submissionType === CONSTANTS.DEAL_SUBMISSION_TYPE.AIN);
};

const facilityTypeStringGenerator = (facilityType) => CONSTANTS.FACILITY_TYPE[facilityType?.toUpperCase()].toLowerCase();

module.exports = {
  areUnissuedFacilitiesPresent,
  getUnissuedFacilitiesAsArray,
  facilitiesChangedToIssuedAsArray,
  getIssuedFacilitiesAsArray,
  getFacilityCoverStartDate,
  coverDatesConfirmed,
  hasChangedToIssued,
  facilityIssueDeadline,
  facilitiesChangedPresent,
  summaryIssuedChangedToIssued,
  summaryIssuedUnchanged,
  issuedFacilityConfirmation,
  facilityTypeStringGenerator,
};
