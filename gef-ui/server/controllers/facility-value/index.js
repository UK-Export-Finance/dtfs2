const { FACILITY_TYPE } = require('../../constants');
const { validationErrorHandler } = require('../../utils/helpers');
const Facility = require('../../models/facility');
const { validateFacilityValue } = require('./facility-value');

const api = require('../../services/api');

const facilityValue = async (req, res) => {
  const { params, query, session } = req;
  const { dealId, facilityId } = params;
  const { status } = query;
  const { user, userToken } = session;

  try {
    const facility = await Facility.find({
      dealId,
      facilityId,
      status,
      user,
      userToken,
    });

    if (!facility) {
      console.error('Unable to fetch facility %s', facilityId);
      return res.redirect('/not-found');
    }

    if (!facility.currency) {
      return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/facility-currency`);
    }

    return res.render('partials/facility-value.njk', facility);
  } catch (error) {
    console.error('Unable to get facility value %o', error);
    return res.render('partials/problem-with-service.njk');
  }
};

const updateFacilityValue = async (req, res) => {
  const { params, body, query, session } = req;
  const { user, userToken } = session;
  const { _id: editorId } = user;
  const { dealId, facilityId } = params;
  const { value, interestPercentage, coverPercentage, facilityType, currency } = body;

  const { status, saveAndReturn } = query;
  const facilityTypeConst = FACILITY_TYPE[facilityType?.toUpperCase()];
  const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';
  const facilityValueErrors = [];
  async function update() {
    try {
      await api.updateFacility({
        facilityId,
        payload: {
          coverPercentage: coverPercentage || null,
          interestPercentage: interestPercentage || null,
          value: value ? value.replace(/,/g, '') : null,
        },
        userToken,
      });

      // updates application with editorId
      const applicationUpdate = {
        editorId,
      };
      await api.updateApplication({ dealId, application: applicationUpdate, userToken });

      if (saveAndReturn) {
        return res.redirect(`/gef/application-details/${dealId}`);
      }
      return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/facility-guarantee`);
    } catch (error) {
      return res.render('partials/problem-with-service.njk');
    }
  }

  if (saveAndReturn) {
    facilityValueErrors.push(...validateFacilityValue(body, saveAndReturn));
    //  save the updated values
    if (facilityValueErrors.length > 0) {
      return res.render('partials/facility-value.njk', {
        errors: validationErrorHandler(facilityValueErrors),
        currency,
        value,
        coverPercentage,
        interestPercentage,
        facilityType,
        facilityTypeString,
        dealId,
        facilityId,
        status,
      });
    }
    return update();
  }
  facilityValueErrors.push(...validateFacilityValue(body));
  if (facilityValueErrors.length > 0) {
    return res.render('partials/facility-value.njk', {
      errors: validationErrorHandler(facilityValueErrors),
      currency,
      value,
      coverPercentage,
      interestPercentage,
      facilityType,
      facilityTypeString,
      dealId,
      facilityId,
      status,
    });
  }
  return update();
};

module.exports = {
  facilityValue,
  updateFacilityValue,
};
