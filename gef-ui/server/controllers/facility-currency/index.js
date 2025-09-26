const { FACILITY_TYPE } = require('../../constants');
const { isTrueSet, validationErrorHandler } = require('../../utils/helpers');
const api = require('../../services/api');

/**
 * Renders the facility currency selection page or an error page if the facility cannot be retrieved.
 *
 * @async
 * @function facilityCurrency
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Renders the facility currency view or an error page.
 */
const facilityCurrency = async (req, res) => {
  const {
    params,
    query,
    session: { userToken },
  } = req;
  const { dealId, facilityId } = params;
  const { status } = query;

  try {
    const { details } = await api.getFacility({ facilityId, userToken });
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
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

/**
 * Handles the update of a facility's currency and redirects based on user actions.
 *
 * @async
 * @function updateFacilityCurrency
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 * @returns {Promise<void>} Redirects to the appropriate page based on the operation outcome.
 */
const updateFacilityCurrency = async (req, res) => {
  const { params, body, query, session } = req;
  const { dealId, facilityId } = params;
  const { currencyId, facilityType } = body;
  const { returnToApplication, status, saveAndReturn } = query;
  const { user, userToken } = session;
  const { _id: editorId } = user;
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

    await api.updateFacility({
      facilityId,
      payload: {
        currency: {
          id: currencyId,
        },
      },
      userToken,
    });

    // updates application with editorId
    const applicationUpdate = {
      editorId,
    };
    await api.updateApplication({ dealId, application: applicationUpdate, userToken });

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
    await api.updateFacility({
      facilityId,
      payload: {
        currency: {
          id: currencyId,
        },
      },
      userToken,
    });

    // updates application with editorId
    const applicationUpdate = {
      editorId,
    };
    await api.updateApplication({ dealId, application: applicationUpdate, userToken });

    if (status === 'change') {
      return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/facility-value?status=change`);
    }

    return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/facility-value`);
  } catch (error) {
    return res.render('partials/problem-with-service.njk');
  }
};

module.exports = {
  facilityCurrency,
  updateFacilityCurrency,
};
