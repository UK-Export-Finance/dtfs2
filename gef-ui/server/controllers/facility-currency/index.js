const { FACILITY_TYPE } = require('../../constants');
const { isTrueSet, validationErrorHandler } = require('../../utils/helpers');
const api = require('../../services/api');

const facilityCurrency = async (req, res) => {
  const { params, query } = req;
  const { dealId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility(facilityId);
    const facilityTypeConst = FACILITY_TYPE[details.type.toUpperCase()];
    const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';

    return res.render('partials/facility-currency.njk', {
      // currency: details.currency.id,
      currencyId: details.currency?.id,
      facilityType: facilityTypeConst,
      facilityTypeString,
      dealId,
      facilityId,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const updateFacilityCurrency = async (req, res) => {
  const {
    params, body, query, session,
  } = req;
  const { dealId, facilityId } = params;
  const { currencyId, facilityType } = body;
  const { returnToApplication, status, saveAndReturn } = query;
  const { user } = session;
  const { _id } = user;
  const facilityTypeConst = FACILITY_TYPE[facilityType?.toUpperCase()];
  const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';
  const facilityCurrencyErrors = [];

  if (isTrueSet(returnToApplication)) {
    return res.redirect(`/gef/application-details/${dealId}`);
  }

  if (isTrueSet(saveAndReturn)) {
    if (!currencyId) {
      return res.redirect(`/gef/application-details/${dealId}`);
    }

    await api.updateFacility(facilityId, {
      currency: {
        id: currencyId,
      },
    });

    // updates application with editorId
    const applicationUpdate = {
      editorId: _id,
    };
    await api.updateApplication(dealId, applicationUpdate);

    return res.redirect(`/gef/application-details/${dealId}`);
  }

  if (!currencyId) {
    facilityCurrencyErrors.push({
      errRef: 'currencyId',
      errMsg: `Select a currency of your ${facilityTypeString} facility`,
    });
  }

  if (facilityCurrencyErrors.length > 0) {
    return res.render('partials/facility-currency.njk', {
      errors: validationErrorHandler(facilityCurrencyErrors),
      currencyId,
      facilityTypeString,
      dealId,
      facilityId,
      status,
    });
  }

  try {
    await api.updateFacility(facilityId, {
      currency: {
        id: currencyId,
      },
    });

    // updates application with editorId
    const applicationUpdate = {
      editorId: _id,
    };
    await api.updateApplication(dealId, applicationUpdate);

    if (status === 'change') {
      return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/facility-value?status=change`);
    }

    return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/facility-value`);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  facilityCurrency,
  updateFacilityCurrency,
};
