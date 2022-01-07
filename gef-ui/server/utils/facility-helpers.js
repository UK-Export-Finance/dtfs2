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

const summaryIssuedChangedToIssued = (app, user, data) =>
  ((app.status === CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED) || (app.status === CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED))
   && user.roles.includes('maker') && data.details.canResubmitIssuedFacilities === true;

const summaryIssuedUnchanged = (app, user, data, facilitiesChanged) =>
  ((app.status === CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED) || (app.status === CONSTANTS.DEAL_STATUS.CHANGES_REQUIRED))
   && user.roles.includes('maker') && data.details.hasBeenIssued === false && facilitiesChanged.length !== 0;

/**
   * this function checks that the deal is an AIN or MIN
   * checks that it has been submitted to UKEF
   * if any unissued facilitites
   * if changes required add to application type and status
* */
const areUnissuedFacilitiesPresent = (application) => {
  const acceptableStatuses = [CONSTANTS.DEAL_STATUS.UKEF_ACKNOWLEDGED];
  const acceptableApplicationType = [CONSTANTS.DEAL_SUBMISSION_TYPE.AIN, CONSTANTS.DEAL_SUBMISSION_TYPE.MIN];

  if (!acceptableApplicationType.includes(application.submissionType)) {
    return false;
  }
  if (!acceptableStatuses.includes(application.status)) {
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
    const date = new Date(+submissionDate);
    const deadlineDate = add(new Date(date), { months: 3 });

    return format(deadlineDate, 'dd MMM yyyy');
  }

  return null;
};

/* govukTable mapping function to return array of facilities which are
   not yet issued for the cover-start-date.njk template.
*/
const getUnissuedFacilitiesAsArray = (facilities, submissionDate) =>
  facilities.items
    .filter(({ details }) => !details.hasBeenIssued)
    .map(({ details }, index) => [
      { text: details.name },
      { text: details.ukefFacilityId },
      { text: `${details.currency.id} ${details.value.toLocaleString('en', { minimumFractionDigits: 2 })}` },
      { text: facilityIssueDeadline(submissionDate) },
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
const getIssuedFacilitiesAsArray = (facilities) => facilities.items.filter(({ details }) => !details.coverDateConfirmed && details.hasBeenIssued)
  .map(({ details }) =>
    [
      { text: details.name },
      { text: details.ukefFacilityId },
      { text: `${details.currency.id} ${details.value.toLocaleString('en', { minimumFractionDigits: 2 })}` },
      { html: `<a href = '/gef/application-details/${details.dealId}/${details._id}/confirm-cover-start-date' class = 'govuk-button govuk-button--secondary govuk-!-margin-0'>Update</a>` },
    ]);

const getFacilityCoverStartDate = (facility) => {
  const epoch = facility.details.coverStartDate ? facility.details.coverStartDate : null;
  return {
    date: format(new Date(epoch), 'd'),
    month: format(new Date(epoch), 'M'),
    year: format(new Date(epoch), 'yyyy'),
  };
};

const coverDatesConfirmed = (facilities) =>
  facilities.items.filter(({ details }) => details.hasBeenIssued).length === facilities.items.filter(({ details }) => details.coverDateConfirmed).length;

/*
   function returns true or false based on length of array
   of facilities that have changed to issued from unissued
*/
const hasChangedToIssued = (application) => {
  const canResubmitIssuedFacilities = facilitiesChangedToIssuedAsArray(application);

  return canResubmitIssuedFacilities.length > 0;
};

const facilitiesChangedPresent = (app) => facilitiesChangedToIssuedAsArray(app).length > 0;

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
};
