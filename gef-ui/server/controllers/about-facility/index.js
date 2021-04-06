import moment from 'moment';
import * as api from '../../services/api';
import { FACILITY_TYPE } from '../../../constants';

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
      facilityType: facilityTypeString,
      hasCoverStartDate: hasCoverStartDate !== 'null' ? hasCoverStartDate : null,
      coverStartDateDay: coverStartDate ? coverStartDate.format('D') : null,
      coverStartDateMonth: coverStartDate ? coverStartDate.format('M') : null,
      coverStartDateYear: coverStartDate ? coverStartDate.format('Y') : null,
      coverEndDateDay: coverEndDate ? coverEndDate.format('D') : null,
      coverEndDateMonth: coverEndDate ? coverEndDate.format('M') : null,
      coverEndDateYear: coverEndDate ? coverEndDate.format('Y') : null,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateAboutFacility = async (req, res) => {
  const { body, query } = req;
  const { facilityType } = body;
  const facilityTypeString = FACILITY_TYPE[details.type].toLowerCase();
  const { saveAndReturn } = query;
  const aboutFacilityErrors = [];

  if (!saveAndReturn) {
    if (!body.facilityName) {
      aboutFacilityErrors.push({
        errRef: 'facilityName',
        errMsg: `Enter a name for this ${facilityTypeString} facility`,
      });
    }
  }
};

export {
  aboutFacility,
  validateAboutFacility,
};
