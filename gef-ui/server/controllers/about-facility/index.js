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
    const coverStartDate = moment(details.coverStartDate);
    const coverEndDate = moment(details.coverEndDate);

    return res.render('partials/about-facility.njk', {
      facilityType: facilityTypeString,
      hasCoverStartDate: hasCoverStartDate !== 'null' ? hasCoverStartDate : null,
      coverStartDateDay: coverStartDate.format('D'),
      coverStartDateMonth: coverStartDate.format('M'),
      coverStartDateYear: coverStartDate.format('Y'),
      coverEndDateDay: coverEndDate.format('D'),
      coverEndDateMonth: coverEndDate.format('M'),
      coverEndDateYear: coverEndDate.format('Y'),
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  aboutFacility,
};
