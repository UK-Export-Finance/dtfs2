import moment from 'moment';
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
    const hasCoverStartDate = JSON.stringify(details.hasCoverStartDate);
    const coverStartDate = details.coverStartDate ? moment(details.coverStartDate) : null;
    const coverEndDate = details.coverEndDate ? moment(details.coverEndDate) : null;
    const monthsOfCover = JSON.stringify(details.monthsOfCover);

    return res.render('partials/about-facility.njk', {
      facilityType: FACILITY_TYPE[details.type],
      facilityName: details.name,
      hasBeenIssued: details.hasBeenIssued,
      monthsOfCover: monthsOfCover !== 'null' ? monthsOfCover : null,
      hasCoverStartDate: hasCoverStartDate !== 'null' ? hasCoverStartDate : null,
      coverStartDateDay: coverStartDate ? coverStartDate.format('D') : null,
      coverStartDateMonth: coverStartDate ? coverStartDate.format('M') : null,
      coverStartDateYear: coverStartDate ? coverStartDate.format('YYYY') : null,
      coverEndDateDay: coverEndDate ? coverEndDate.format('D') : null,
      coverEndDateMonth: coverEndDate ? coverEndDate.format('M') : null,
      coverEndDateYear: coverEndDate ? coverEndDate.format('YYYY') : null,
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
  const { facilityType } = body;
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
    // Only validate facility name if hasBeenIssued is set to True
    if (isTrueSet(body.hasBeenIssued) && !body.facilityName) {
      aboutFacilityErrors.push({
        errRef: 'facilityName',
        errMsg: `Enter a name for this ${facilityTypeString} facility`,
      });
    }
    if (isTrueSet(body.hasBeenIssued) && !body.hasCoverStartDate) {
      aboutFacilityErrors.push({
        errRef: 'hasCoverStartDate',
        errMsg: 'Select if you want UKEF cover to start on the day you submit the automatic inclusion notice',
      });
    }
    if (body.hasCoverStartDate === 'false' && (!coverStartDateDay || !coverStartDateMonth || !coverStartDateYear)) {
      aboutFacilityErrors.push({
        errRef: 'coverStartDate',
        errMsg: 'Enter a cover start date',
      });
    }
    if (isTrueSet(body.hasBeenIssued) && (!coverEndDateDay || !coverEndDateMonth || !coverEndDateYear)) {
      aboutFacilityErrors.push({
        errRef: 'coverEndDate',
        errMsg: 'Enter a cover end date',
      });
    }
    if (!body.monthsOfCover) {
      aboutFacilityErrors.push({
        errRef: 'monthsOfCover',
        errMsg: 'Enter the number of months you\'ll need UKEF cover for',
      });
    }
  }

  if (coverStartDateDay && coverStartDateMonth && coverStartDateYear) {
    coverStartDate = moment();
    coverStartDate.set('date', Number(coverStartDateDay));
    coverStartDate.set('month', Number(coverStartDateMonth) - 1);
    coverStartDate.set('year', Number(coverStartDateYear));
    coverStartDate.format();
  }

  if (coverEndDateDay && coverEndDateMonth && coverEndDateYear) {
    coverEndDate = moment();
    coverEndDate.set('date', Number(coverEndDateDay));
    coverEndDate.set('month', Number(coverEndDateMonth) - 1);
    coverEndDate.set('year', Number(coverEndDateYear));
    coverEndDate.format();
  }

  if (body.monthsOfCover && !/^[0-9]*$/.test(body.monthsOfCover)) {
    aboutFacilityErrors.push({
      errRef: 'monthsOfCover',
      errMsg: 'You can only enter numbers',
    });
  }

  if (aboutFacilityErrors.length > 0) {
    return res.render('partials/about-facility.njk', {
      errors: validationErrorHandler(aboutFacilityErrors),
      facilityName: body.facilityName,
      hasCoverStartDate: body.hasCoverStartDate,
      hasBeenIssued: body.hasBeenIssued,
      monthsOfCover: body.monthsOfCover,
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
    await api.updateFacility(facilityId, {
      name: body.facilityName,
      hasCoverStartDate: isTrueSet(body.hasCoverStartDate),
      monthsOfCover: body.monthsOfCover || null,
      coverStartDate,
      coverEndDate,
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
