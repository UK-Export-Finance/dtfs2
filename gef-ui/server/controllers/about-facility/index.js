import {
  add, format, isAfter, isBefore, set,
} from 'date-fns';
import * as api from '../../services/api';
import { FACILITY_TYPE } from '../../../constants';
import { isTrueSet, validationErrorHandler } from '../../utils/helpers';

const aboutFacility = async (req, res) => {
  const { params, query } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility(facilityId);
    const facilityTypeString = FACILITY_TYPE[details.type].toLowerCase();
    const shouldCoverStartOnSubmission = JSON.stringify(details.shouldCoverStartOnSubmission);
    const coverStartDate = details.coverStartDate ? new Date(details.coverStartDate) : null;
    const coverEndDate = details.coverEndDate ? new Date(details.coverEndDate) : null;
    const monthsOfCover = JSON.stringify(details.monthsOfCover);

    return res.render('partials/about-facility.njk', {
      facilityType: FACILITY_TYPE[details.type],
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
      applicationId,
      facilityId,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateAboutFacility = async (req, res) => {
  const { body, query, params } = req;
  const { facilityType, hasBeenIssued } = body;
  const facilityTypeString = facilityType.toLowerCase();
  const { saveAndReturn, status } = query;
  const { applicationId, facilityId } = params;
  const aboutFacilityErrors = [];
  const coverStartDateDay = body['cover-start-date-day'];
  const coverStartDateMonth = body['cover-start-date-month'];
  const coverStartDateYear = body['cover-start-date-year'];
  const coverEndDateDay = body['cover-end-date-day'];
  const coverEndDateMonth = body['cover-end-date-month'];
  const coverEndDateYear = body['cover-end-date-year'];
  let coverStartDate = null;
  let coverEndDate = null;

  if (!saveAndReturn) {
    if (isTrueSet(body.hasBeenIssued)) {
    // Only validate facility name if hasBeenIssued is set to Yes
      if (!body.facilityName) {
        aboutFacilityErrors.push({
          errRef: 'facilityName',
          errMsg: `Enter a name for this ${facilityTypeString} facility`,
        });
      }
      if (!body.shouldCoverStartOnSubmission) {
        aboutFacilityErrors.push({
          errRef: 'shouldCoverStartOnSubmission',
          errMsg: 'Select if you want UKEF cover to start on the day you submit the automatic inclusion notice',
        });
      }
      if (body.shouldCoverStartOnSubmission === 'false' && (!coverStartDateDay || !coverStartDateMonth || !coverStartDateYear)) {
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
        if (!coverStartDateDay && !coverStartDateMonth && !coverStartDateYear) {
          msg = 'Enter a cover start date';
        }

        aboutFacilityErrors.push({
          errRef: 'coverStartDate',
          errMsg: msg,
          subFieldErrorRefs: dateFieldsInError,
        });
      }

      if (body.shouldCoverStartOnSubmission === 'false' && coverStartDateDay && coverStartDateMonth && coverStartDateYear) {
        const now = new Date();
        const threeMonthsFromNow = add(now, { months: 3 });
        const startDate = set(new Date(),
          { year: coverStartDateYear, month: coverStartDateMonth - 1, date: coverStartDateDay });

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

      if (!coverEndDateDay || !coverEndDateMonth || !coverEndDateYear) {
        aboutFacilityErrors.push({
          errRef: 'coverEndDate',
          errMsg: 'Enter a cover end date',
        });
      }
    }
    // Only validate months of cover if hasBeenIssued is set to No
    if (!isTrueSet(body.hasBeenIssued) && !body.monthsOfCover) {
      aboutFacilityErrors.push({
        errRef: 'monthsOfCover',
        errMsg: 'Enter the number of months you\'ll need UKEF cover for',
      });
    }
  }

  if (coverStartDateDay && coverStartDateMonth && coverStartDateYear) {
    coverStartDate = set(new Date(),
      { year: coverStartDateYear, month: coverStartDateMonth - 1, date: coverStartDateDay });
  }

  if (coverEndDateDay && coverEndDateMonth && coverEndDateYear) {
    coverEndDate = set(new Date(),
      { year: coverEndDateYear, month: coverEndDateMonth - 1, date: coverEndDateDay });
  }

  // Regex tests to see if value is a number only
  const digitsRegex = /^[0-9]*$/;
  if (body.monthsOfCover && !digitsRegex.test(body.monthsOfCover)) {
    aboutFacilityErrors.push({
      errRef: 'monthsOfCover',
      errMsg: 'You can only enter numbers',
    });
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
      applicationId,
      facilityId,
      status,
    });
  }

  try {
    const dateFormat = 'MMMM d, yyyy';
    await api.updateFacility(facilityId, {
      name: body.facilityName,
      shouldCoverStartOnSubmission: isTrueSet(body.shouldCoverStartOnSubmission),
      monthsOfCover: body.monthsOfCover || null,
      coverStartDate: coverStartDate ? format(coverStartDate, dateFormat) : null,
      coverEndDate: coverEndDate ? format(coverEndDate, dateFormat) : null,
    });

    if (isTrueSet(saveAndReturn) || status === 'change') {
      return res.redirect(`/gef/application-details/${applicationId}`);
    }

    return res.redirect(`/gef/application-details/${applicationId}/facilities/${facilityId}/provided-facility`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  aboutFacility,
  validateAboutFacility,
};
