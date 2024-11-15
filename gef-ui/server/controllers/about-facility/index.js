const { format, set, isSameDay } = require('date-fns');
const { isFacilityEndDateEnabledOnGefVersion, parseDealVersion, zBooleanStrictCoerce } = require('@ukef/dtfs2-common');
const api = require('../../services/api');
const { FACILITY_TYPE, DATE_FORMAT, DEAL_SUBMISSION_TYPE } = require('../../constants');
const { isTrueSet, validationErrorHandler } = require('../../utils/helpers');
const { validateAboutFacility } = require('./validation');
const { getNextPage } = require('./get-next-page-helper');

const aboutFacility = async (req, res) => {
  const {
    params,
    query,
    session: { userToken },
  } = req;
  const { dealId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility({ facilityId, userToken });
    const deal = await api.getApplication({ dealId, userToken });
    const facilityTypeString = FACILITY_TYPE[details.type.toUpperCase()].toLowerCase();
    const shouldCoverStartOnSubmission = JSON.stringify(details.shouldCoverStartOnSubmission);
    const coverStartDate = details.coverStartDate ? new Date(details.coverStartDate) : null;
    const coverEndDate = details.coverEndDate ? new Date(details.coverEndDate) : null;
    const monthsOfCover = JSON.stringify(details.monthsOfCover);

    let isUsingFacilityEndDate;
    if (details.isUsingFacilityEndDate === true) {
      isUsingFacilityEndDate = 'true';
    }
    if (details.isUsingFacilityEndDate === false) {
      isUsingFacilityEndDate = 'false';
    }

    return res.render('_partials/about-facility.njk', {
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
      isFacilityEndDateEnabled: isFacilityEndDateEnabledOnGefVersion(parseDealVersion(deal.version)),
      isUsingFacilityEndDate,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk');
  }
};

/**
 * @param {number} year
 * @param {number} month
 * @param {number} date
 * @returns the start of the date
 */
const calculateDateFromYearMonthDate = (year, month, date) => {
  const dateFullyComplete = date && month && year;

  return dateFullyComplete
    ? set(new Date(), {
        year,
        month: month - 1,
        date,
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      })
    : null;
};

const validateAndUpdateAboutFacility = async (req, res) => {
  const {
    body: {
      facilityType,
      hasBeenIssued,
      'cover-start-date-day': coverStartDateDay,
      'cover-start-date-month': coverStartDateMonth,
      'cover-start-date-year': coverStartDateYear,
      'cover-end-date-day': coverEndDateDay,
      'cover-end-date-month': coverEndDateMonth,
      'cover-end-date-year': coverEndDateYear,
      monthsOfCover,
      facilityName,
      shouldCoverStartOnSubmission,
      isUsingFacilityEndDate: isUsingFacilityEndDateString,
    },
    query: { saveAndReturn, status },
    params: { dealId, facilityId },
    session: {
      user: { _id: editorId },
      userToken,
    },
  } = req;
  const facilityTypeString = facilityType.toLowerCase();

  const isUsingFacilityEndDate = zBooleanStrictCoerce.optional().parse(isUsingFacilityEndDateString);

  const deal = await api.getApplication({ dealId, userToken });

  const coverStartDateIsFullyComplete = coverStartDateDay && coverStartDateMonth && coverStartDateYear;
  const coverEndDateIsFullyComplete = coverEndDateDay && coverEndDateMonth && coverEndDateYear;

  const coverStartDate = calculateDateFromYearMonthDate(coverStartDateYear, coverStartDateMonth, coverStartDateDay);
  const coverEndDate = calculateDateFromYearMonthDate(coverEndDateYear, coverEndDateMonth, coverEndDateDay);

  const aboutFacilityErrors = validateAboutFacility({
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
    isFacilityEndDateEnabled: isFacilityEndDateEnabledOnGefVersion(parseDealVersion(deal.version)),
  });

  if (aboutFacilityErrors.length > 0) {
    return res.render('_partials/about-facility.njk', {
      errors: validationErrorHandler(aboutFacilityErrors),
      facilityName,
      shouldCoverStartOnSubmission,
      monthsOfCover,
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
      isFacilityEndDateEnabled: isFacilityEndDateEnabledOnGefVersion(parseDealVersion(deal.version)),
      isUsingFacilityEndDate: isUsingFacilityEndDateString,
    });
  }

  const facilityUpdate = {
    name: facilityName,
    shouldCoverStartOnSubmission: isTrueSet(shouldCoverStartOnSubmission),
    monthsOfCover: monthsOfCover || null,
    coverStartDate: coverStartDate ? format(coverStartDate, DATE_FORMAT.COVER) : null,
    coverEndDate: coverEndDate ? format(coverEndDate, DATE_FORMAT.COVER) : null,
    coverDateConfirmed: deal.submissionType === DEAL_SUBMISSION_TYPE.AIN ? true : null,
  };

  if (isFacilityEndDateEnabledOnGefVersion(parseDealVersion(deal.version))) {
    facilityUpdate.isUsingFacilityEndDate = isUsingFacilityEndDate;

    const { details: existingFacility } = await api.getFacility({ facilityId, userToken });
    const existingCoverStartDate = existingFacility.coverStartDate ? new Date(existingFacility.coverStartDate) : null;

    const coverStartDateHasChanged = coverStartDate && existingCoverStartDate && !isSameDay(existingCoverStartDate, coverStartDate);

    if (coverStartDateHasChanged) {
      facilityUpdate.facilityEndDate = null;
      facilityUpdate.bankReviewDate = null;
    }
  }

  try {
    await api.updateFacility({
      facilityId,
      payload: facilityUpdate,
      userToken,
    });

    // updates application with editorId
    const applicationUpdate = {
      editorId,
    };
    await api.updateApplication({ dealId, application: applicationUpdate, userToken });

    if (isTrueSet(saveAndReturn)) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    return res.redirect(getNextPage({ dealId, facilityId, dealVersion: deal.version, isUsingFacilityEndDate }));
  } catch (error) {
    return res.render('_partials/problem-with-service.njk');
  }
};

module.exports = {
  aboutFacility,
  validateAndUpdateAboutFacility,
};
