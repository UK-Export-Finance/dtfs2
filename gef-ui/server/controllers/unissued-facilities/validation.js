const {
  add, isAfter, isBefore, set,
} = require('date-fns');
const api = require('../../services/api');
const { validationErrorHandler } = require('../../utils/helpers');

/**
 * validation for changing facilities
 * checks issue date, coverStartDate and coverEndDate dates
 * returns required parameters for post update facility
 * @param {req}
 * @returns {res} if validation errors
 * @returns {Object} if no validation errors
 */
const facilityValidation = async (body, query, params) => {
  const { facilityType } = body;
  const facilityTypeString = facilityType.toLowerCase();
  const { saveAndReturn, status } = query;
  const { dealId, facilityId } = params;
  const {
    'issue-date-day': issueDateDay,
    'issue-date-month': issueDateMonth,
    'issue-date-year': issueDateYear,
    'cover-start-date-day': coverStartDateDay,
    'cover-start-date-month': coverStartDateMonth,
    'cover-start-date-year': coverStartDateYear,
    'cover-end-date-day': coverEndDateDay,
    'cover-end-date-month': coverEndDateMonth,
    'cover-end-date-year': coverEndDateYear,
  } = body;

  const application = await api.getApplication(dealId);

  const aboutFacilityErrors = [];

  const issueDateIsFullyComplete = issueDateDay && issueDateMonth && issueDateYear;
  const issueDateIsPartiallyComplete = !issueDateIsFullyComplete && (issueDateDay || issueDateMonth || issueDateYear);
  const issueDateIsBlank = !issueDateDay && !issueDateMonth && !issueDateYear;
  const coverStartDateIsFullyComplete = coverStartDateDay && coverStartDateMonth && coverStartDateYear;
  const coverStartDateIsPartiallyComplete = !coverStartDateIsFullyComplete && (coverStartDateDay || coverStartDateMonth || coverStartDateYear);
  const coverStartDateIsBlank = !coverStartDateDay && !coverStartDateMonth && !coverStartDateYear;
  const coverEndDateIsFullyComplete = coverEndDateDay && coverEndDateMonth && coverEndDateYear;
  const coverEndDateIsPartiallyComplete = !coverEndDateIsFullyComplete && (coverEndDateDay || coverEndDateMonth || coverEndDateYear);
  const coverEndDateIsBlank = !coverEndDateDay && !coverEndDateMonth && !coverEndDateYear;

  let issueDate = null;
  let coverStartDate = null;
  let coverEndDate = null;

  // Only validate facility name if hasBeenIssued is set to Yes
  if (!saveAndReturn && !body.facilityName) {
    aboutFacilityErrors.push({
      errRef: 'facilityName',
      errMsg: `Enter a name for this ${facilityTypeString} facility`,
    });
  }

  if (issueDateIsBlank) {
    if (!saveAndReturn) {
      aboutFacilityErrors.push({
        errRef: 'issueDate',
        errMsg: 'Enter the date you issued the facility to the exporter',
      });
    }
  } else if (issueDateIsPartiallyComplete) {
    let msg = 'Issued date must include a ';
    const dateFieldsInError = [];
    if (!issueDateDay) {
      msg += 'day ';
      dateFieldsInError.push('issueDate-day');
    }
    if (!issueDateMonth) {
      msg += !issueDateDay ? ' and month ' : 'month ';
      dateFieldsInError.push('issueDate-month');
    }
    if (!issueDateYear) {
      msg += !issueDateDay || !issueDateMonth ? 'and year' : 'year';
      dateFieldsInError.push('issueDate-year');
    }

    aboutFacilityErrors.push({
      errRef: 'issueDate',
      errMsg: msg,
      subFieldErrorRefs: dateFieldsInError,
    });
  } else if (issueDateIsFullyComplete) {
    // set to midnight to stop mismatch if submission date in past so set to midnight of past date
    const submissionDate = (new Date(Number(application.submissionDate))).setHours(0, 0, 0, 0);
    const now = new Date();
    const issueDateSet = (set(new Date(), { year: issueDateYear, month: issueDateMonth - 1, date: issueDateDay })).setHours(0, 0, 0, 0);

    if (isBefore(issueDateSet, submissionDate)) {
      aboutFacilityErrors.push({
        errRef: 'issueDate',
        errMsg: 'The issue date must not be before the date of the inclusion notice submission date',
      });
    }

    if (isAfter(issueDateSet, now)) {
      aboutFacilityErrors.push({
        errRef: 'issueDate',
        errMsg: 'The issue date cannot be in the future',
      });
    }
  }

  if (!body.shouldCoverStartOnSubmission && !saveAndReturn) {
    aboutFacilityErrors.push({
      errRef: 'shouldCoverStartOnSubmission',
      errMsg: 'Select if you want UKEF cover to start on the day you issue the facility',
    });
  }

  if (body.shouldCoverStartOnSubmission === 'false') {
    if (coverStartDateIsBlank) {
      if (!saveAndReturn) {
        aboutFacilityErrors.push({
          errRef: 'coverStartDate',
          errMsg: 'Enter a cover start date',
        });
      }
    } else if (coverStartDateIsPartiallyComplete) {
      let msg = 'Cover start date must include a ';
      const dateFieldsInError = [];
      if (!coverStartDateDay) {
        msg += 'day ';
        dateFieldsInError.push('coverStartDate-day');
      }
      if (!coverStartDateMonth) {
        msg += !coverStartDateDay ? ' and month ' : 'month ';
        dateFieldsInError.push('coverStartDate-month');
      }
      if (!coverStartDateYear) {
        msg += !coverStartDateDay || !coverStartDateMonth ? 'and year' : 'year';
        dateFieldsInError.push('coverStartDate-year');
      }

      aboutFacilityErrors.push({
        errRef: 'coverStartDate',
        errMsg: msg,
        subFieldErrorRefs: dateFieldsInError,
      });
    } else if (coverStartDateIsFullyComplete) {
      // set to midnight to stop mismatch if submission date in past so set to midnight of past date
      const submissionDate = (new Date(Number(application.submissionDate))).setHours(0, 0, 0, 0);

      let threeMonthsFromSubmission;

      if (application.manualInclusionNoticeSubmissionDate) {
        const minSubmissionDate = (new Date(Number(application.manualInclusionNoticeSubmissionDate))).setHours(0, 0, 0, 0);
        threeMonthsFromSubmission = add(minSubmissionDate, { months: 3 });
      } else {
        threeMonthsFromSubmission = add(submissionDate, { months: 3 });
      }

      const startDate = (set(new Date(), { year: coverStartDateYear, month: coverStartDateMonth - 1, date: coverStartDateDay })).setHours(0, 0, 0, 0);

      if (isBefore(startDate, submissionDate)) {
        aboutFacilityErrors.push({
          errRef: 'coverStartDate',
          errMsg: 'The cover start date must not be before the date of the inclusion notice submission date',
        });
      }

      if (isAfter(startDate, threeMonthsFromSubmission)) {
        aboutFacilityErrors.push({
          errRef: 'coverStartDate',
          errMsg: 'The cover start date must be within 3 months of the inclusion notice submission date',
        });
      }
    }
  }

  if (coverEndDateIsBlank) {
    if (!saveAndReturn) {
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'Enter a cover end date',
      });
    }
  } else if (coverEndDateIsPartiallyComplete) {
    let msg = 'Cover end date must include a ';
    const dateFieldsInError = [];
    if (!coverEndDateDay) {
      msg += 'day ';
      dateFieldsInError.push('coverEndDate-day');
    }
    if (!coverEndDateMonth) {
      msg += !coverEndDateDay ? ' and month ' : 'month ';
      dateFieldsInError.push('coverEndDate-month');
    }
    if (!coverEndDateYear) {
      msg += !coverEndDateDay || !coverEndDateMonth ? 'and year' : 'year';
      dateFieldsInError.push('coverEndDate-year');
    }

    aboutFacilityErrors.push({
      errRef: 'coverEndDate',
      errMsg: msg,
      subFieldErrorRefs: dateFieldsInError,
    });
  }

  if (body.facilityName && body.facilityName.length > 30) {
    aboutFacilityErrors.push({
      errRef: 'facilityName',
      errMsg: 'Facility name cannot be more than 30 characters in length',
    });
  }

  if (/[^A-Za-z0-9 .,:;'-]/.test(body.facilityName)) {
    aboutFacilityErrors.push({
      errRef: 'facilityName',
      errMsg: 'Facility name must only include letters a to z, full stops, commas, colons, semi-colons, hyphens, spaces and apostrophes',
    });
  }

  if (issueDateIsFullyComplete) {
    issueDate = set(new Date(), { year: issueDateYear, month: issueDateMonth - 1, date: issueDateDay });
  }

  if (coverStartDateIsFullyComplete) {
    coverStartDate = set(new Date(), { year: coverStartDateYear, month: coverStartDateMonth - 1, date: coverStartDateDay });
  }

  if (coverEndDateIsFullyComplete) {
    coverEndDate = set(new Date(), { year: coverEndDateYear, month: coverEndDateMonth - 1, date: coverEndDateDay });
  }

  if (coverStartDateIsFullyComplete && coverEndDateIsFullyComplete) {
    if (coverEndDate < coverStartDate) {
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'Cover end date cannot be before cover start date',
      });
    }
  }

  if (issueDateIsFullyComplete && coverEndDateIsFullyComplete) {
    if (coverEndDate < issueDate) {
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'Cover end date cannot be before the issue date',
      });
    }
  }

  if (issueDateIsFullyComplete && coverStartDateIsFullyComplete) {
    if (coverStartDate < issueDate) {
      aboutFacilityErrors.push({
        errRef: 'coverStartDate',
        errMsg: 'Cover start date cannot be before the issue date',
      });
    }
  }

  // Regex tests to see if value is a number only
  const digitsRegex = /^[0-9]*$/;
  if (body.monthsOfCover) {
    if (!digitsRegex.test(body.monthsOfCover)) {
      aboutFacilityErrors.push({
        errRef: 'monthsOfCover',
        errMsg: 'You can only enter numbers',
      });
    }
    if (body.monthsOfCover > 999) {
      aboutFacilityErrors.push({
        errRef: 'monthsOfCover',
        errMsg: 'You can only enter a maximum of 999 months cover',
      });
    }
  }

  const errorsObject = {
    errors: validationErrorHandler(aboutFacilityErrors),
    facilityName: body.facilityName,
    shouldCoverStartOnSubmission: body.shouldCoverStartOnSubmission,
    monthsOfCover: body.monthsOfCover,
    hasBeenIssued: true,
    issueDateDay,
    issueDateMonth,
    issueDateYear,
    coverStartDateDay,
    coverStartDateMonth,
    coverStartDateYear,
    coverEndDateDay,
    coverEndDateMonth,
    coverEndDateYear,
    facilityType,
    facilityTypeString,
    dealId,
    facilityId,
    status,
  };

  return {
    issueDate,
    coverStartDate,
    coverEndDate,
    aboutFacilityErrors,
    facilityId,
    dealId,
    errorsObject,
  };
};

module.exports = { facilityValidation };
