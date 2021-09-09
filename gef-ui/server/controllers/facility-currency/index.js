const { FACILITY_TYPE } = require('../../../constants');
const { isTrueSet, validationErrorHandler } = require('../../utils/helpers');
const api = require('../../services/api');

const facilityCurrency = async (req, res) => {
  const { params, query } = req;
  const { applicationId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility(facilityId);
    const facilityTypeConst = FACILITY_TYPE[details.type];
    const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';

    return res.render('partials/facility-currency.njk', {
      currency: details.currency,
      facilityType: facilityTypeConst,
      facilityTypeString,
      applicationId,
      facilityId,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const updateFacilityCurrency = async (req, res) => {
  const { params, body, query } = req;
  const { applicationId, facilityId } = params;
  const { currency, facilityType } = body;
  const { returnToApplication, status, saveAndReturn } = query;
  const facilityTypeConst = FACILITY_TYPE[facilityType];
  const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';
  const facilityCurrencyErrors = [];

  if (isTrueSet(returnToApplication)) {
    return res.redirect(`/gef/application-details/${applicationId}`);
  }

  if (isTrueSet(saveAndReturn)) {
    if (!currency) {
      return res.redirect(`/gef/application-details/${applicationId}`);
    }

    await api.updateFacility(facilityId, {
      currency,
    });
    return res.redirect(`/gef/application-details/${applicationId}`);
  }

  if (!currency) {
    facilityCurrencyErrors.push({
      errRef: 'currency',
      errMsg: `Select a currency of your ${facilityTypeString} facility`,
    });
  }

  if (facilityCurrencyErrors.length > 0) {
    return res.render('partials/facility-currency.njk', {
      errors: validationErrorHandler(facilityCurrencyErrors),
      currency,
      facilityTypeString,
      applicationId,
      facilityId,
      status,
    });
  }

  try {
    await api.updateFacility(facilityId, {
      currency,
    });

    if (status === 'change') {
      return res.redirect(`/gef/application-details/${applicationId}/facilities/${facilityId}/facility-value?status=change`);
    }

    return res.redirect(`/gef/application-details/${applicationId}/facilities/${facilityId}/facility-value`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  facilityCurrency,
  updateFacilityCurrency,
};
