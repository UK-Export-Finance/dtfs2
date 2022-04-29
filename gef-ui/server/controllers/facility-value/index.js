const { FACILITY_TYPE } = require('../../constants');
const { validationErrorHandler } = require('../../utils/helpers');
const Facility = require('../../models/facility');
const { validateFacilityValue } = require('./facility-value');

const api = require('../../services/api');

const facilityValue = async (req, res) => {
  const {
    params,
    query,
    session,
  } = req;
  const { dealId, facilityId } = params;
  const { status } = query;
  const { user } = session;

  try {
    const facility = await Facility.find(dealId, facilityId, status, user);
    if (!facility) {
      // eslint-disable-next-line no-console
      console.info('Facility not found, or not authorised');
      return res.redirect('/');
    }

    if (!facility.currency) {
      return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/facility-currency`);
    }

    return res.render('partials/facility-value.njk', facility);
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const updateFacilityValue = async (req, res) => {
  const {
    params, body, query, session,
  } = req;
  const { user } = session;
  const { _id: editorId } = user;
  const { dealId, facilityId } = params;
  const {
    value, interestPercentage, coverPercentage, facilityType, currency,
  } = body;

  const { status, saveAndReturn } = query;
  const facilityTypeConst = FACILITY_TYPE[facilityType?.toUpperCase()];
  const facilityTypeString = facilityTypeConst ? facilityTypeConst.toLowerCase() : '';
  const facilityValueErrors = [];
  async function update() {
    try {
      await api.updateFacility(facilityId, {
        coverPercentage: coverPercentage || null,
        interestPercentage: interestPercentage || null,
        value: value ? value.replace(/,/g, '') : null,
      });

      // updates application with editorId
      const applicationUpdate = {
        editorId,
      };
      await api.updateApplication(dealId, applicationUpdate);

      if (saveAndReturn) {
        return res.redirect(`/gef/application-details/${dealId}`);
      }
      return res.redirect(`/gef/application-details/${dealId}/facilities/${facilityId}/facility-guarantee`);
    } catch (err) {
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
