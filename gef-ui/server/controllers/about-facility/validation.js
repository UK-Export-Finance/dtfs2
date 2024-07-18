const { add, isAfter, isBefore, isEqual, set, startOfDay } = require('date-fns');
const Joi = require('joi');
const { isTrueSet } = require('../../utils/helpers');
const { validateAndParseDayMonthYear } = require('../../utils/day-month-year-validation');

/**
 * @param {object} params
 * @param {string} params.coverStartDateDay
 * @param {string} params.coverStartDateMonth,
 * @param {string} params.coverStartDateYear,
 * @param {boolean} params.coverStartDateIsFullyComplete,
 * @param {string} params.coverEndDateDay,
 * @param {string} params.coverEndDateMonth,
 * @param {string} params.coverEndDateYear,
 * @param {boolean} params.coverEndDateIsFullyComplete,
 * @param {string} params.facilityTypeString,
 * @param {string} params.saveAndReturn,
 * @param {Date | null} params.coverStartDate,
 * @param {Date | null} params.coverEndDate,
 * @param {'true' | 'false' | undefined} params.hasBeenIssued,
 * @param {string} params.monthsOfCover,
 * @param {string} params.facilityName,
 * @param {'true' | 'false' | undefined} params.shouldCoverStartOnSubmission,
 * @param {boolean | undefined} params.isUsingFacilityEndDate,
 * @param {boolean} params.isFacilityEndDateEnabled,
 * @returns {{ errRef: string, errMsg: string }[]} array of validation errors
 */
// Unit test coverage is in `index.validate-and-update-about-facility.test.js`
const validateAboutFacility = ({
  coverStartDateDay,
  coverStartDateMonth,
  coverStartDateYear,
  coverStartDateIsFullyComplete,
  coverEndDateDay,
  coverEndDateMonth,
  coverEndDateYear,
  coverEndDateIsFullyComplete,
  facilityTypeString,
  saveAndReturn,
  coverStartDate,
  coverEndDate,
  hasBeenIssued,
  monthsOfCover,
  facilityName,
  shouldCoverStartOnSubmission,
  isUsingFacilityEndDate,
  isFacilityEndDateEnabled,
}) => {
  let coverEndDateValid = true;

  const coverStartDateIsBlank = !coverStartDateDay && !coverStartDateMonth && !coverStartDateYear;
  const coverEndDateIsBlank = !coverEndDateDay && !coverEndDateMonth && !coverEndDateYear;

  const aboutFacilityErrors = [];
  if (isTrueSet(hasBeenIssued)) {
    // Only validate facility name if hasBeenIssued is set to Yes
    if (!saveAndReturn && !facilityName) {
      aboutFacilityErrors.push({
        errRef: 'facilityName',
        errMsg: `Enter a name for this ${facilityTypeString} facility`,
      });
    }

    if (!shouldCoverStartOnSubmission && !saveAndReturn) {
      aboutFacilityErrors.push({
        errRef: 'shouldCoverStartOnSubmission',
        errMsg: 'Select if you want UKEF cover to start on the day you submit the automatic inclusion notice',
      });
    }

    if (shouldCoverStartOnSubmission === 'false') {
      if (!coverStartDateIsBlank || !saveAndReturn) {
        const { errors: coverStartDateFormattingErrors, date: startDate } = validateAndParseDayMonthYear(
          {
            day: coverStartDateDay,
            month: coverStartDateMonth,
            year: coverStartDateYear,
          },
          {
            errRef: 'coverStartDate',
            variableDisplayName: 'cover start date',
          },
        );

        if (coverStartDateFormattingErrors) {
          aboutFacilityErrors.push(...coverStartDateFormattingErrors);
        } else {
          const now = startOfDay(new Date());
          const threeMonthsFromNow = add(now, { months: 3 });

          if (isBefore(startDate, now)) {
            aboutFacilityErrors.push({
              errRef: 'coverStartDate',
              errMsg: 'Cover start date cannot be before today',
            });
          }

          if (isAfter(startDate, threeMonthsFromNow)) {
            aboutFacilityErrors.push({
              errRef: 'coverStartDate',
              errMsg: 'Cover start date cannot be more than 3 months from now',
            });
          }
        }
      }
    }

    if (!coverEndDateIsBlank || !saveAndReturn) {
      const { errors: coverEndDateFormattingErrors } = validateAndParseDayMonthYear(
        {
          day: coverEndDateDay,
          month: coverEndDateMonth,
          year: coverEndDateYear,
        },
        {
          errRef: 'coverEndDate',
          variableDisplayName: 'cover end date',
        },
      );

      if (coverEndDateFormattingErrors) {
        aboutFacilityErrors.push(...coverEndDateFormattingErrors);
      }
    }
  }
  // Only validate months of cover if hasBeenIssued is set to No
  if (!saveAndReturn && !isTrueSet(hasBeenIssued) && !monthsOfCover) {
    aboutFacilityErrors.push({
      errRef: 'monthsOfCover',
      errMsg: "Enter the number of months you'll need UKEF cover for",
    });
  }

  if (facilityName && facilityName.length > 30) {
    aboutFacilityErrors.push({
      errRef: 'facilityName',
      errMsg: 'Facility name cannot be more than 30 characters in length',
    });
  }

  if (/[^A-Za-z0-9 .,:;'-]/.test(facilityName)) {
    aboutFacilityErrors.push({
      errRef: 'facilityName',
      errMsg: 'Facility name must only include letters a to z, full stops, commas, colons, semi-colons, hyphens, spaces and apostrophes',
    });
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
  }

  if (coverStartDateIsFullyComplete && coverEndDateIsFullyComplete) {
    if (coverEndDate < coverStartDate && coverEndDateValid) {
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

  // validation if should start on submission - no coverStartDate to check against
  if (shouldCoverStartOnSubmission && coverEndDateIsFullyComplete) {
    // temporarily set coverStartDate to now
    const coverStartNow = set(new Date(), {
      hours: 0,
      minutes: 0,
      seconds: 0,
      milliseconds: 0,
    });

    if (coverEndDate < coverStartNow && coverEndDateValid) {
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'Cover end date cannot be before cover start date',
      });
    }

    if (isEqual(coverStartNow, coverEndDate) && coverEndDateValid) {
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'The cover end date must be after the cover start date',
      });
    }
  }

  // Regex tests to see if value is a number only
  const digitsRegex = /^[0-9]*$/;
  if (monthsOfCover) {
    if (!digitsRegex.test(monthsOfCover)) {
      aboutFacilityErrors.push({
        errRef: 'monthsOfCover',
        errMsg: 'You can only enter numbers',
      });
    }
    if (monthsOfCover > 999) {
      aboutFacilityErrors.push({
        errRef: 'monthsOfCover',
        errMsg: 'You can only enter a maximum of 999 months cover',
      });
    }
  }

  if (isFacilityEndDateEnabled) {
    if (isUsingFacilityEndDate === undefined && !saveAndReturn) {
      aboutFacilityErrors.push({
        errRef: 'isUsingFacilityEndDate',
        errMsg: 'Select if there is an end date for this facility',
      });
    }
  }

  return aboutFacilityErrors;
};

module.exports = {
  validateAboutFacility,
};
