import * as api from '../../services/api';
import { FACILITY_TYPE } from '../../../constants';
import { isTrueSet, validationErrorHandler } from '../../utils/helpers';

const providedFacility = async (req, res) => {
  const { params, query } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility(facilityId);
    const facilityTypeConst = FACILITY_TYPE[details.type];
    const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';

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
  const { facilityType, detailsOther } = body;
  const { saveAndReturn, status } = query;
  const providedFacilityErrors = [];
  const facilityTypeConst = FACILITY_TYPE[body.facilityType];
  const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';
  const details = Array.isArray(body.details) ? body.details : [body.details];

  if (body.details && body.details.includes('OTHER') && !body.detailsOther) {
    providedFacilityErrors.push({
      errRef: 'detailsOther',
      errMsg: 'Enter details for "Other"',
    });
  }

  if (providedFacilityErrors.length > 0) {
    return res.render('partials/provided-facility.njk', {
      errors: validationErrorHandler(providedFacilityErrors),
      details,
      facilityType,
      detailsOther,
      facilityTypeString,
      applicationId,
      facilityId,
      status,
    });
  }

  try {
    await api.updateFacility(facilityId, {
      details,
      detailsOther,
    });

    if (isTrueSet(saveAndReturn) || status === 'change') {
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
