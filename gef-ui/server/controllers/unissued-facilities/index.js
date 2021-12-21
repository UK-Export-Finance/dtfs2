const {
  add, format, isAfter, isBefore, set,
} = require('date-fns');
const api = require('../../services/api');
const { FACILITY_TYPE } = require('../../constants');
const { isTrueSet, validationErrorHandler } = require('../../utils/helpers');
const CONSTANTS = require('../../constants');
const { applicationDetails } = require('../application-details');

/**
 * creates body/parameters for the template for unissued facilities
 * if change set to true, changes cancel and back button href back to application preview
 * else renders back to unissued facilities list
 */
const renderChangeFacilityPartial = async (params, query, change) => {
  const { dealId, facilityId } = params;
  const { status } = query;

  const { details } = await api.getFacility(facilityId);
  const facilityTypeString = FACILITY_TYPE[details.type].toLowerCase();
  const shouldCoverStartOnSubmission = JSON.stringify(details.shouldCoverStartOnSubmission);
  const issueDate = details.issueDate ? new Date(details.issueDate) : null;
  const coverStartDate = details.coverStartDate ? new Date(details.coverStartDate) : null;
  const coverEndDate = details.coverEndDate ? new Date(details.coverEndDate) : null;
  const monthsOfCover = JSON.stringify(details.monthsOfCover);

  const body = {
    facilityType: FACILITY_TYPE[details.type],
    facilityName: details.name,
    hasBeenIssued: details.hasBeenIssued,
    monthsOfCover: monthsOfCover !== 'null' ? monthsOfCover : null,
    shouldCoverStartOnSubmission: shouldCoverStartOnSubmission !== 'null' ? shouldCoverStartOnSubmission : null,
    issueDateDay: issueDate ? format(issueDate, 'd') : null,
    issueDateMonth: issueDate ? format(issueDate, 'M') : null,
    issueDateYear: issueDate ? format(issueDate, 'yyyy') : null,
    coverStartDateDay: coverStartDate ? format(coverStartDate, 'd') : null,
    coverStartDateMonth: coverStartDate ? format(coverStartDate, 'M') : null,
    coverStartDateYear: coverStartDate ? format(coverStartDate, 'yyyy') : null,
    coverEndDateDay: coverEndDate ? format(coverEndDate, 'd') : null,
    coverEndDateMonth: coverEndDate ? format(coverEndDate, 'M') : null,
    coverEndDateYear: coverEndDate ? format(coverEndDate, 'yyyy') : null,
    facilityTypeString,
    dealId,
    facilityId,
    status,
    change,
  };

  return body;
};

// when changing unissued facility from unissued facility list
const changeUnissuedAboutFacility = async (req, res) => {
  const { params, query } = req;

  try {
    const {
      facilityType,
      facilityName,
      hasBeenIssued,
      monthsOfCover,
      shouldCoverStartOnSubmission,
      issueDateDay,
      issueDateMonth,
      issueDateYear,
      coverStartDateDay,
      coverStartDateMonth,
      coverStartDateYear,
      coverEndDateDay,
      coverEndDateMonth,
      coverEndDateYear,
      facilityTypeString,
      dealId,
      facilityId,
      status,
      change,
    } = await renderChangeFacilityPartial(params, query, false);
    return res.render('partials/unissued-change-about-facility.njk', {
      facilityType,
      facilityName,
      hasBeenIssued,
      monthsOfCover,
      shouldCoverStartOnSubmission,
      issueDateDay,
      issueDateMonth,
      issueDateYear,
      coverStartDateDay,
      coverStartDateMonth,
      coverStartDateYear,
      coverEndDateDay,
      coverEndDateMonth,
      coverEndDateYear,
      facilityTypeString,
      dealId,
      facilityId,
      status,
      change,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

// when changing unissued facility from application preview page
const changeUnissuedAboutFacilityChange = async (req, res) => {
  const { params, query } = req;

  try {
    const {
      facilityType,
      facilityName,
      hasBeenIssued,
      monthsOfCover,
      shouldCoverStartOnSubmission,
      issueDateDay,
      issueDateMonth,
      issueDateYear,
      coverStartDateDay,
      coverStartDateMonth,
      coverStartDateYear,
      coverEndDateDay,
      coverEndDateMonth,
      coverEndDateYear,
      facilityTypeString,
      dealId,
      facilityId,
      status,
      change,
    } = await renderChangeFacilityPartial(params, query, true);
    return res.render('partials/unissued-change-about-facility.njk', {
      facilityType,
      facilityName,
      hasBeenIssued,
      monthsOfCover,
      shouldCoverStartOnSubmission,
      issueDateDay,
      issueDateMonth,
      issueDateYear,
      coverStartDateDay,
      coverStartDateMonth,
      coverStartDateYear,
      coverEndDateDay,
      coverEndDateMonth,
      coverEndDateYear,
      facilityTypeString,
      dealId,
      facilityId,
      status,
      change,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * validation for changing facilities
 * returns required parameters for post update facility
 */
const facilityValidation = async (req, res) => {
  const { body, query, params } = req;
  const { facilityType } = body;
  const facilityTypeString = facilityType.toLowerCase();
  const { saveAndReturn, status } = query;
  const { dealId, facilityId } = params;
  const application = await api.getApplication(dealId);
  const aboutFacilityErrors = [];
  const issueDateDay = body['issue-date-day'];
  const issueDateMonth = body['issue-date-month'];
  const issueDateYear = body['issue-date-year'];
  const issueDateIsFullyComplete = issueDateDay && issueDateMonth && issueDateYear;
  const issueDateIsPartiallyComplete = !issueDateIsFullyComplete && (issueDateDay || issueDateMonth || issueDateYear);
  const issueDateIsBlank = !issueDateDay && !issueDateMonth && !issueDateYear;
  const coverStartDateDay = body['cover-start-date-day'];
  const coverStartDateMonth = body['cover-start-date-month'];
  const coverStartDateYear = body['cover-start-date-year'];
  const coverStartDateIsFullyComplete = coverStartDateDay && coverStartDateMonth && coverStartDateYear;
  const coverStartDateIsPartiallyComplete = !coverStartDateIsFullyComplete && (coverStartDateDay || coverStartDateMonth || coverStartDateYear);
  const coverStartDateIsBlank = !coverStartDateDay && !coverStartDateMonth && !coverStartDateYear;
  const coverEndDateDay = body['cover-end-date-day'];
  const coverEndDateMonth = body['cover-end-date-month'];
  const coverEndDateYear = body['cover-end-date-year'];
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
    const submissionDate = new Date(+application.submissionDate);
    const threeMonthsFromSubmission = add(submissionDate, { months: 3 });
    const issueDateSet = set(new Date(), { year: issueDateYear, month: issueDateMonth - 1, date: issueDateDay });

    if (isBefore(issueDateSet, submissionDate)) {
      aboutFacilityErrors.push({
        errRef: 'issueDate',
        errMsg: 'The issue date must not be before the date of the inclusion notice submission date',
      });
    }

    if (isAfter(issueDateSet, threeMonthsFromSubmission)) {
      aboutFacilityErrors.push({
        errRef: 'issueDate',
        errMsg: 'The issue date must be within 3 months of the inclusion notice submission date',
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
      const submissionDate = new Date(+application.submissionDate);
      const threeMonthsFromSubmission = add(submissionDate, { months: 3 });
      const startDate = set(new Date(), { year: coverStartDateYear, month: coverStartDateMonth - 1, date: coverStartDateDay });

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

  if (aboutFacilityErrors.length > 0) {
    return res.render('partials/unissued-change-about-facility.njk', {
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
    });
  }

  return {
    issueDate,
    coverStartDate,
    coverEndDate,
    body,
    facilityId,
    dealId,
  };
};

/**
 * post for changing unissued facilities to issued from unissued facilities list
 * validates first and gets parameters from validation
 * displays success message and redirects to unissued facilities list
 */
const postChangeUnissuedAboutFacility = async (req, res) => {
  const {
    issueDate, coverStartDate, coverEndDate, body, facilityId, dealId,
  } = await facilityValidation(req, res);

  try {
    await api.updateFacility(
      facilityId,
      {
        name: body.facilityName,
        shouldCoverStartOnSubmission: isTrueSet(body.shouldCoverStartOnSubmission),
        monthsOfCover: body.monthsOfCover || null,
        issueDate: issueDate ? format(issueDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverStartDate: coverStartDate ? format(coverStartDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverEndDate: coverEndDate ? format(coverEndDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        hasBeenIssued: true,
        changedToIssued: true,
        coverDateConfirmed: true,
      },
      (req.success = {
        message: `${body.facilityName} is updated`,
      }),
      (req.url = `/gef/application-details/${dealId}/unissued-facilities`),
    );
    // TODO: redirect where it changes the link away from /gef/application-details/${dealId}/unissued-facilities/facilityid
    //  ... to /gef/application-details/${dealId}/unissued-facilities
    return applicationDetails(req, res);
  } catch (err) {
    console.log(err);
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * post for changing unissued facilities from application preview
 * redirects to application preview once changed
 */
const postChangeUnissuedAboutFacilityChange = async (req, res) => {
  const {
    issueDate, coverStartDate, coverEndDate, body, facilityId, dealId,
  } = await facilityValidation(req, res);

  try {
    await api.updateFacility(
      facilityId,
      {
        name: body.facilityName,
        shouldCoverStartOnSubmission: isTrueSet(body.shouldCoverStartOnSubmission),
        monthsOfCover: body.monthsOfCover || null,
        issueDate: issueDate ? format(issueDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverStartDate: coverStartDate ? format(coverStartDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        coverEndDate: coverEndDate ? format(coverEndDate, CONSTANTS.DATE_FORMAT.COVER) : null,
        hasBeenIssued: true,
        changedToIssued: true,
        coverDateConfirmed: true,
      },
      (req.url = `/gef/application-details/${dealId}`),
    );

    return res.redirect(`/gef/application-details/${dealId}`);
  } catch (err) {
    console.log(err);
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  renderChangeFacilityPartial,
  changeUnissuedAboutFacility,
  changeUnissuedAboutFacilityChange,
  postChangeUnissuedAboutFacility,
  postChangeUnissuedAboutFacilityChange,
  facilityValidation,
};
