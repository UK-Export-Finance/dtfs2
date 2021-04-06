import * as api from '../../services/api';
import { FACILITY_TYPE } from '../../../constants';

const aboutFacility = async (req, res) => {
  const { params } = req;
  const { facilityId } = params;

  try {
    const { details } = await api.getFacility(facilityId);
    const { type } = details;
    return res.render('partials/about-facility.njk', {
      facilityType: FACILITY_TYPE[type],
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export default aboutFacility;
