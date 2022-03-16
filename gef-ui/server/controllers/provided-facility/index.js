const api = require('../../services/api');
const { FACILITY_TYPE } = require('../../constants');
const { isTrueSet, validationErrorHandler } = require('../../utils/helpers');

const providedFacility = async (req, res) => {
  const { params, query } = req;
  const { dealId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility(facilityId);
    const facilityTypeConst = FACILITY_TYPE[details.type.toUpperCase()];
    const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';

    return res.render('partials/provided-facility.njk', {
      facilityType: FACILITY_TYPE[details.type.toUpperCase()],
      details: details.details || [],
      detailsOther: details.detailsOther,
      facilityTypeString,
      dealId,
      facilityId,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const validateProvidedFacility = async (req, res) => {
  const {
    params, body, query, session,
  } = req;
  const { dealId, facilityId } = params;
  const { facilityType, detailsOther } = body;
  const { saveAndReturn, status } = query;
  const { user } = session;
  const { _id } = user;
  const providedFacilityErrors = [];
  const facilityTypeConst = FACILITY_TYPE[body.facilityType?.toUpperCase()];
  const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';
  const details = Array.isArray(body.details) ? body.details : [body.details];

  if (!isTrueSet(saveAndReturn)) {
    if (!body.details) {
      providedFacilityErrors.push({
        errRef: 'details',
        errMsg: 'You must select at least one option',
      });
    }

    if (body.details && body.details.includes('OTHER') && !body.detailsOther) {
      providedFacilityErrors.push({
        errRef: 'detailsOther',
        errMsg: 'Enter details for "Other"',
      });
    }
  }

  if (providedFacilityErrors.length > 0) {
    return res.render('partials/provided-facility.njk', {
      errors: validationErrorHandler(providedFacilityErrors),
      details,
      facilityType,
      detailsOther,
      facilityTypeString,
      dealId,
      facilityId,
      status,
    });
  }

  try {
    await api.updateFacility(facilityId, {
      details,
      detailsOther,
    });

    // updates application with editorId
    const applicationUpdate = {
      editorId: _id,
    };
    await api.updateApplication(dealId, applicationUpdate);

    if (isTrueSet(saveAndReturn) || status === 'change') {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/facility-currency`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  providedFacility,
  validateProvidedFacility,
};
