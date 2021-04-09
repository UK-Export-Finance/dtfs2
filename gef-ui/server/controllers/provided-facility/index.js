import * as api from '../../services/api';
import { FACILITY_TYPE } from '../../../constants';

const providedFacility = async (req, res) => {
  const { params, query } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility(facilityId);
    const facilityTypeString = FACILITY_TYPE[details.type].toLowerCase();

    return res.render('partials/provided-facility.njk', {
      facilityType: FACILITY_TYPE[details.type],
      details: details.details || [],
      detailsOther: details.detailsOther,
      facilityTypeString,
      applicationId,
      facilityId,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateProvidedFacility = async (req, res) => {
  const { params, body, query } = req;
  const { applicationId, facilityId } = params;
  const { details, detailsOther } = body;
  const { saveAndReturn } = query;

  try {
    await api.updateFacility(facilityId, {
      details,
      detailsOther,
    });

    if (saveAndReturn) {
      return res.redirect(`/gef/application-details/${applicationId}`);
    }

    return res.redirect(`/gef/application-details/${applicationId}/facilities/${facilityId}/facility-currency`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

export {
  providedFacility,
  validateProvidedFacility,
};
