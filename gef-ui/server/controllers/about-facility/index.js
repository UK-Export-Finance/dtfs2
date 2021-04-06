import moment from 'moment';
import * as api from '../../services/api';
import { FACILITY_TYPE } from '../../../constants';
import { validationErrorHandler } from '../../utils/helpers';

const aboutFacility = async (req, res) => {
  const { params } = req;
  const { facilityId } = params;

  try {
    const { details } = await api.getFacility(facilityId);
    const facilityTypeString = FACILITY_TYPE[details.type].toLowerCase();
    const hasCoverStartDate = JSON.stringify(details.hasCoverStartDate);
    const coverStartDate = details.coverStartDate ? moment(details.coverStartDate) : null;
    const coverEndDate = details.coverEndDate ? moment(details.coverEndDate) : null;

    return res.render('partials/about-facility.njk', {
      facilityType: FACILITY_TYPE[details.type],
      hasCoverStartDate: hasCoverStartDate !== 'null' ? hasCoverStartDate : null,
      coverStartDateDay: coverStartDate ? coverStartDate.format('D') : null,
      coverStartDateMonth: coverStartDate ? coverStartDate.format('M') : null,
      coverStartDateYear: coverStartDate ? coverStartDate.format('Y') : null,
      coverEndDateDay: coverEndDate ? coverEndDate.format('D') : null,
      coverEndDateMonth: coverEndDate ? coverEndDate.format('M') : null,
      coverEndDateYear: coverEndDate ? coverEndDate.format('Y') : null,
      facilityTypeString,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateAboutFacility = async (req, res) => {
  const { body, query } = req;
  const { facilityType } = body;
  const facilityTypeString = facilityType.toLowerCase();
  const { saveAndReturn } = query;
  const aboutFacilityErrors = [];

  console.log('test', body.hasCoverStartDate);

  if (!saveAndReturn) {
    if (!body.facilityName) {
      aboutFacilityErrors.push({
        errRef: 'facilityName',
        errMsg: `Enter a name for this ${facilityTypeString} facility`,
      });
    }
    if (!body.hasCoverStartDate) {
      aboutFacilityErrors.push({
        errRef: 'hasCoverStartDate',
        errMsg: 'Select if you want UKEF cover to start on the day you submit the automatic inclusion notice',
      });
    }
    if (body.hasCoverStartDate && (!body.coverStartDateDay || !body.coverStartDateMonth || !body.coverStartDateYear)) {
      aboutFacilityErrors.push({
        errRef: 'coverStartDate',
        errMsg: 'Enter a cover start date',
      });
    }
  }

  if (aboutFacilityErrors.length > 0) {
    return res.render('partials/about-facility.njk', {
      errors: validationErrorHandler(aboutFacilityErrors),
      hasCoverStartDate: body.hasCoverStartDate,
      // coverStartDateDay: coverStartDate ? coverStartDate.format('D') : null,
      // coverStartDateMonth: coverStartDate ? coverStartDate.format('M') : null,
      // coverStartDateYear: coverStartDate ? coverStartDate.format('Y') : null,
      // coverEndDateDay: coverEndDate ? coverEndDate.format('D') : null,
      // coverEndDateMonth: coverEndDate ? coverEndDate.format('M') : null,
      // coverEndDateYear: coverEndDate ? coverEndDate.format('Y') : null,
      facilityType,
      facilityTypeString,
    });
  }
};

export {
  aboutFacility,
  validateAboutFacility,
};
