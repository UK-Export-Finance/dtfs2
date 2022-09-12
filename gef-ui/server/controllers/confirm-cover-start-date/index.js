const { format } = require('date-fns');
const
  {
    validationErrorHandler,
    getEpoch,
    pastDate,
    sameDate,
    futureDateInRange,
  } = require('../../utils/helpers');
const { applicationDetails } = require('../application-details');
const api = require('../../services/api');
const CONSTANTS = require('../../constants');

const setError = (field, message) => validationErrorHandler({
  errRef: field,
  errMsg: message,
});

const updateCoverStartDate = async (facilityId, { coverStartDate, shouldCoverStartOnSubmission }, dealId, editorId) => {
  try {
    const applicationUpdate = {
      editorId,
    };
    await api.updateApplication(dealId, applicationUpdate);

    return api.updateFacility(facilityId, {
      coverStartDate,
      shouldCoverStartOnSubmission,
      coverDateConfirmed: true,
    });
  } catch (error) {
    console.error('Unable to update the facility.', { error });
  }
  return false;
};

const processCoverStartDate = async (req, res) => {
  const { dealId, facilityId } = req.params;
  const { user } = req.session;
  const { _id: editorId } = user;
  const {
    ukefCoverStartDate,
    day,
    month,
    year,
  } = req.body;
  let facility;
  const { details } = await api.getFacility(facilityId);

  try {
    if (ukefCoverStartDate === undefined) {
      req.errors = setError('ukefCoverStartDate', 'Select yes if you want UKEF cover to start on the day the notice is submitted to UKEF');
    } else if (ukefCoverStartDate === 'true') {
      /**
         * Facility cover start will be set to the
         * notice submission date i.e. The date
         * checker will submit the application to the UKEF.
         * Please do not update the coverStartDate value.
         */
      facility = await updateCoverStartDate(facilityId, {
        coverStartDate: null,
        shouldCoverStartOnSubmission: true,
      }, dealId, editorId);
    } else if (ukefCoverStartDate === 'false') {
      /**
         * Facility cover start will be set to the
         * user specified date as long as below conditions
         * are met.
         */
      // 1. Check date components have valid values

      if (!Number(day) || !Number(month) || !Number(year) || (`${year}`.length < 4)) {
        req.errors = setError('ukefCoverStartDateInput', 'Enter the cover start date');
      } else if (pastDate({ day, month, year })) {
      // 2. Check date is not in the past
        req.errors = setError('ukefCoverStartDateInput', 'Cover date cannot be in the past');
      } else if (!futureDateInRange({ day, month, year }, 90)) {
        // 3. Check date is with-in three months
        req.errors = setError('ukefCoverStartDateInput', 'Cover date must be within 3 months');
      } else if (sameDate({ day, month, year }, details.coverEndDate)) {
        req.errors = setError('ukefCoverStartDateInput', 'The cover start date must be before the cover end date');
      } else {
        // Update facility's cover start date
        facility = await updateCoverStartDate(facilityId, {
          coverStartDate: format(getEpoch({ day, month, year }), CONSTANTS.DATE_FORMAT.COVER),
          shouldCoverStartOnSubmission: false,
        }, dealId, editorId);
      }
    }

    if (facility) {
      req.success = {
        message: `Cover start date for ${details.name} confirmed`,
      };
      req.url = `/gef/application-details/${dealId}/cover-start-date`;
    }

    return applicationDetails(req, res);
  } catch (error) {
    console.error('Unable to process cover start date', { error });
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  processCoverStartDate,
};
