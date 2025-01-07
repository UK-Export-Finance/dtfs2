const { add, isAfter, isBefore, isEqual, set, startOfDay } = require('date-fns');
const { applyStandardValidationAndParseDateInput } = require('@ukef/dtfs2-common');
const { isTrueSet } = require('../../utils/helpers');

/**
 * @param {Object} params
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
        const coverStartDateErrRef = 'coverStartDate';
        const coverStartDateDisplayName = 'cover start date';

        const { parsedDate: startDate, error: coverStartDateFormattingError } = applyStandardValidationAndParseDateInput(
          {
            day: coverStartDateDay,
            month: coverStartDateMonth,
            year: coverStartDateYear,
          },
          coverStartDateDisplayName,
          coverStartDateErrRef,
        );

        if (coverStartDateFormattingError) {
          aboutFacilityErrors.push({
            errRef: coverStartDateErrRef,
            errMsg: coverStartDateFormattingError.message,
            subFieldErrorRefs: coverStartDateFormattingError.fieldRefs,
          });
        } else {
          const now = startOfDay(new Date());
          const threeMonthsFromNow = add(now, { months: 3 });

          if (isBefore(startDate, now)) {
            aboutFacilityErrors.push({
              errRef: coverStartDateErrRef,
              errMsg: 'Cover start date cannot be before today',
            });
          }

          if (isAfter(startDate, threeMonthsFromNow)) {
            aboutFacilityErrors.push({
              errRef: coverStartDateErrRef,
              errMsg: 'Cover start date cannot be more than 3 months from now',
            });
          }
        }
      }
    }

    if (!(coverEndDateIsBlank && saveAndReturn)) {
      const coverEndDateErrRef = 'coverEndDate';
      const coverEndDateDisplayName = 'cover end date';

      const { error: coverEndDateFormattingError } = applyStandardValidationAndParseDateInput(
        {
          day: coverEndDateDay,
          month: coverEndDateMonth,
          year: coverEndDateYear,
        },
        coverEndDateDisplayName,
        coverEndDateErrRef,
      );

      if (coverEndDateFormattingError) {
        coverEndDateValid = false;

        aboutFacilityErrors.push({
          errRef: coverEndDateErrRef,
          errMsg: coverEndDateFormattingError.message,
          subFieldErrorRefs: coverEndDateFormattingError.fieldRefs,
        });
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

  if (coverStartDateIsFullyComplete && coverEndDateIsFullyComplete && coverEndDateValid) {
    if (coverEndDate < coverStartDate) {
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'Cover end date cannot be before cover start date',
      });
    }

    // if coverEndDate is the same as the coverStartDate
    if (isEqual(coverStartDate, coverEndDate)) {
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
