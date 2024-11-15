const { FACILITY_PROVIDED_DETAILS } = require('@ukef/dtfs2-common');
const api = require('../../services/api');
const { FACILITY_TYPE } = require('../../constants');
const { isTrueSet, validationErrorHandler } = require('../../utils/helpers');
const { getPreviousPage } = require('./get-previous-page-helper');

const providedFacility = async (req, res) => {
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
    const facilityTypeConst = FACILITY_TYPE[details.type.toUpperCase()];
    const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';

    const previousPage = getPreviousPage({
      dealId,
      facilityId,
      dealVersion: deal.version,
      isUsingFacilityEndDate: details.isUsingFacilityEndDate,
    });

    return res.render('_partials/provided-facility.njk', {
      facilityType: FACILITY_TYPE[details.type.toUpperCase()],
      details: details.details || [],
      detailsOther: details.detailsOther,
      facilityTypeString,
      dealId,
      facilityId,
      status,
      previousPage,
    });
  } catch (error) {
    return res.render('_partials/problem-with-service.njk');
  }
};

const validateProvidedFacility = async (req, res) => {
  const { params, body, query, session } = req;
  const { dealId, facilityId } = params;
  const { facilityType, detailsOther, previousPage } = body;
  const { saveAndReturn, status } = query;
  const { user, userToken } = session;
  const { _id: editorId } = user;
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

    if (body.details && body.details.includes(FACILITY_PROVIDED_DETAILS.OTHER) && !body.detailsOther) {
      providedFacilityErrors.push({
        errRef: 'detailsOther',
        errMsg: 'Enter details for "Other"',
      });
    }
  }

  if (providedFacilityErrors.length > 0) {
    return res.render('_partials/provided-facility.njk', {
      errors: validationErrorHandler(providedFacilityErrors),
      details,
      facilityType,
      detailsOther,
      facilityTypeString,
      dealId,
      facilityId,
      status,
      previousPage,
    });
  }

  try {
    await api.updateFacility({
      facilityId,
      payload: {
        details,
        detailsOther,
      },
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

    return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/facility-currency`);
  } catch (error) {
    return res.render('_partials/problem-with-service.njk');
  }
};

module.exports = {
  providedFacility,
  validateProvidedFacility,
};
