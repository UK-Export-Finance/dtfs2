import moment from 'moment';
import * as api from '../../services/api';
import { FACILITY_TYPE } from '../../../constants';

const aboutFacility = async (req, res) => {
  const { params } = req;
  const { facilityId } = params;

  try {
    const { details } = await api.getFacility(facilityId);
    const { coverStartDate } = details;
    const facilityTypeString = FACILITY_TYPE[details.type].toLowerCase();
    const hasCoverStartDate = JSON.stringify(details.hasCoverStartDate);
    console.log('details', moment(1617275806087, 'DD/MM/YYYY'));
    return res.render('partials/about-facility.njk', {
      facilityType: facilityTypeString,
      hasCoverStartDate: hasCoverStartDate !== 'null' ? hasCoverStartDate : null,
      coverStartDate: details.coverStartDate,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  aboutFacility,
};
