const {
  add, format, isAfter, isBefore, isEqual, set,
} = require('date-fns');
const Joi = require('joi');
const api = require('../../services/api');
const { FACILITY_TYPE, DATE_FORMAT, DEAL_SUBMISSION_TYPE } = require('../../constants');
const { isTrueSet, validationErrorHandler } = require('../../utils/helpers');

const aboutFacility = async (req, res) => {
  const { params, query } = req;
  const { dealId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility(facilityId);
    const facilityTypeString = FACILITY_TYPE[details.type.toUpperCase()].toLowerCase();
    const shouldCoverStartOnSubmission = JSON.stringify(details.shouldCoverStartOnSubmission);
    const coverStartDate = details.coverStartDate ? new Date(details.coverStartDate) : null;
    const coverEndDate = details.coverEndDate ? new Date(details.coverEndDate) : null;
    const monthsOfCover = JSON.stringify(details.monthsOfCover);

    return res.render('partials/about-facility.njk', {
      facilityType: FACILITY_TYPE[details.type.toUpperCase()],
      facilityName: details.name,
      hasBeenIssued: details.hasBeenIssued,
      monthsOfCover: monthsOfCover !== 'null' ? monthsOfCover : null,
      shouldCoverStartOnSubmission: shouldCoverStartOnSubmission !== 'null' ? shouldCoverStartOnSubmission : null,
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
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

// TODO: split this function up as too long
const validateAboutFacility = async (req, res) => {
  const {
    body, query, params, session,
  } = req;
  const { facilityType, hasBeenIssued } = body;
  const facilityTypeString = facilityType.toLowerCase();
  const { saveAndReturn, status } = query;
  const { dealId, facilityId } = params;
  const { user } = session;
  const { _id: editorId } = user;

  const aboutFacilityErrors = [];
  const coverStartDateDay = body['cover-start-date-day'];
  const coverStartDateMonth = body['cover-start-date-month'];
  const coverStartDateYear = body['cover-start-date-year'];
  const coverStartDateIsFullyComplete = coverStartDateDay && coverStartDateMonth && coverStartDateYear;
  const coverStartDateIsPartiallyComplete = !coverStartDateIsFullyComplete
    && (coverStartDateDay || coverStartDateMonth || coverStartDateYear);
  const coverStartDateIsBlank = !coverStartDateDay && !coverStartDateMonth && !coverStartDateYear;
  const coverEndDateDay = body['cover-end-date-day'];
  const coverEndDateMonth = body['cover-end-date-month'];
  const coverEndDateYear = body['cover-end-date-year'];
  const coverEndDateIsFullyComplete = coverEndDateDay && coverEndDateMonth && coverEndDateYear;
  const coverEndDateIsPartiallyComplete = !coverEndDateIsFullyComplete
    && (coverEndDateDay || coverEndDateMonth || coverEndDateYear);
  const coverEndDateIsBlank = !coverEndDateDay && !coverEndDateMonth && !coverEndDateYear;

  let coverStartDate = null;
  let coverEndDate = null;
  let coverEndDateValid = true;

  if (isTrueSet(body.hasBeenIssued)) {
    // Only validate facility name if hasBeenIssued is set to Yes
    if (!saveAndReturn && !body.facilityName) {
      aboutFacilityErrors.push({
        errRef: 'facilityName',
        errMsg: `Enter a name for this ${facilityTypeString} facility`,
      });
    }

    if (!body.shouldCoverStartOnSubmission && !saveAndReturn) {
      aboutFacilityErrors.push({
        errRef: 'shouldCoverStartOnSubmission',
        errMsg: 'Select if you want UKEF cover to start on the day you submit the automatic inclusion notice',
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
        let hasFormattingError = false;
        const now = new Date();
        const threeMonthsFromNow = add(now, { months: 3 });
        // schema which ensures that coverStartDate year only contains 4 numbers
        const yearSchema = Joi.string().length(4).pattern(/^\d+$/).required();
        const yearValidation = yearSchema.validate(coverStartDateYear);

        // schema which ensures that coverStart month and day is only numbers and of length 1 or 2
        const coverDayMonthSchema = Joi.string().min(1).max(2).pattern(/^\d+$/);
        const coverStartMonthValidation = coverDayMonthSchema.validate(coverStartDateMonth);
        const coverStartDayValidation = coverDayMonthSchema.validate(coverStartDateDay);

        // if coverStartDate day has validation error
        if (coverStartDayValidation.error) {
          hasFormattingError = true;
          aboutFacilityErrors.push({
            errRef: 'coverStartDate',
            errMsg: 'The day for the cover start date must include 1 or 2 numbers',
          });
        }
        // if coverStartDate month has validation error
        if (coverStartMonthValidation.error) {
          hasFormattingError = true;
          aboutFacilityErrors.push({
            errRef: 'coverStartDate',
            errMsg: 'The month for the cover start date must include 1 or 2 numbers',
          });
        }
        // if coverStartDate year has validation error
        if (yearValidation.error) {
          hasFormattingError = true;
          aboutFacilityErrors.push({
            errRef: 'coverStartDate',
            errMsg: 'The year for the cover start date must include 4 numbers',
          });
        }

        const startDate = set(
          new Date(),
          { year: coverStartDateYear, month: coverStartDateMonth - 1, date: coverStartDateDay },
        );

        if (isBefore(startDate, now) && !hasFormattingError) {
          aboutFacilityErrors.push({
            errRef: 'coverStartDate',
            errMsg: 'Cover start date cannot be before today',
          });
        }

        if (isAfter(startDate, threeMonthsFromNow) && !hasFormattingError) {
          aboutFacilityErrors.push({
            errRef: 'coverStartDate',
            errMsg: 'Cover start date cannot be more than 3 months from now',
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
  }
  // Only validate months of cover if hasBeenIssued is set to No
  if (!saveAndReturn && !isTrueSet(body.hasBeenIssued) && !body.monthsOfCover) {
    aboutFacilityErrors.push({
      errRef: 'monthsOfCover',
      errMsg: 'Enter the number of months you\'ll need UKEF cover for',
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

  if (coverStartDateIsFullyComplete) {
    coverStartDate = set(
      new Date(),
      {
        year: coverStartDateYear, month: coverStartDateMonth - 1, date: coverStartDateDay, hours: 0, minutes: 0, seconds: 0, milliseconds: 0,
      },
    );
  }

  if (coverEndDateIsFullyComplete) {
    // schema which ensures that coverEndDate year only contains 4 numbers
    const yearSchema = Joi.string().length(4).pattern(/^\d+$/).required();
    const yearValidation = yearSchema.validate(coverEndDateYear);

    // schema which ensures that coverEnd month and day is only numbers and of length 1 or 2
    const coverDayMonthSchema = Joi.string().min(1).max(2).pattern(/^\d+$/);
    const coverEndMonthValidation = coverDayMonthSchema.validate(coverEndDateMonth);
    const coverEndDayValidation = coverDayMonthSchema.validate(coverEndDateDay);

    // if coverEndDate day has validation error
    if (coverEndDayValidation.error) {
      coverEndDateValid = false;
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'The day for the cover end date must include 1 or 2 numbers',
      });
    }
    // if coverEndDate month has validation error
    if (coverEndMonthValidation.error) {
      coverEndDateValid = false;
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'The month for the cover end date must include 1 or 2 numbers',
      });
    }
    // if coverEndDate year has validation error
    if (yearValidation.error) {
      coverEndDateValid = false;
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'The year for the cover end date must include 4 numbers',
      });
    }

    coverEndDate = set(
      new Date(),
      {
        year: coverEndDateYear, month: coverEndDateMonth - 1, date: coverEndDateDay, hours: 0, minutes: 0, seconds: 0, milliseconds: 0,
      },
    );
  }

  if (coverStartDateIsFullyComplete && coverEndDateIsFullyComplete) {
    if ((coverEndDate < coverStartDate) && coverEndDateValid) {
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'Cover end date cannot be before cover start date',
      });
    }

    // if coverEndDate is the same as the coverStartDate
    if (isEqual(coverStartDate, coverEndDate) && coverEndDateValid) {
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'The cover end date must be after the cover start date',
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
    return res.render('partials/about-facility.njk', {
      errors: validationErrorHandler(aboutFacilityErrors),
      facilityName: body.facilityName,
      shouldCoverStartOnSubmission: body.shouldCoverStartOnSubmission,
      monthsOfCover: body.monthsOfCover,
      hasBeenIssued: isTrueSet(hasBeenIssued),
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

  try {
    const deal = await api.getApplication(dealId);
    await api.updateFacility(facilityId, {
      name: body.facilityName,
      shouldCoverStartOnSubmission: isTrueSet(body.shouldCoverStartOnSubmission),
      monthsOfCover: body.monthsOfCover || null,
      coverStartDate: coverStartDate ? format(coverStartDate, DATE_FORMAT.COVER) : null,
      coverEndDate: coverEndDate ? format(coverEndDate, DATE_FORMAT.COVER) : null,
      coverDateConfirmed: deal.submissionType === DEAL_SUBMISSION_TYPE.AIN
        ? true
        : null,
    });

    // updates application with editorId
    const applicationUpdate = {
      editorId,
    };
    await api.updateApplication(dealId, applicationUpdate);

    if (isTrueSet(saveAndReturn)) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/provided-facility`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  aboutFacility,
  validateAboutFacility,
};
