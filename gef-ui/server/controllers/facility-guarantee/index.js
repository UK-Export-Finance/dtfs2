const { validationErrorHandler } = require('../../utils/helpers');
const Facility = require('../../models/facility');
const validateFacilityGuarantee = require('./facility-guarantee');
const api = require('../../services/api');
const { FACILITY_PAYMENT_TYPE } = require('../../constants');

const facilityGuarantee = async (req, res) => {
  const { params, query, session } = req;
  const { dealId, facilityId } = params;
  const { status } = query;
  const { user, userToken } = session;

  try {
    const facility = await Facility.find(dealId, facilityId, status, user, userToken);
    if (!facility) {
      console.error('Facility not found, or not authorised');
      return res.redirect('/');
    }
    return res.render('partials/facility-guarantee.njk', {
      dealId: facility.dealId,
      facilityId: facility.facilityId,
      feeType: facility.feeType,
      inAdvanceFrequency: facility.feeType === FACILITY_PAYMENT_TYPE.IN_ADVANCE ? facility.feeFrequency : '',
      inArrearsFrequency: facility.feeType === FACILITY_PAYMENT_TYPE.IN_ARREARS ? facility.feeFrequency : '',
      dayCountBasis: facility.dayCountBasis,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const updateFacilityGuarantee = async (req, res) => {
  const {
    params, body, query, session,
  } = req;
  const { dealId, facilityId } = params;
  const { user } = session;
  const { _id } = user;
  const {
    feeType, inAdvanceFrequency, inArrearsFrequency, dayCountBasis,
  } = body;
  const { status } = query;
  const facilityGuaranteeErrors = [];

  async function update() {
    const feeTypeIsInAdvance = feeType === FACILITY_PAYMENT_TYPE.IN_ADVANCE;
    const feeTypeIsInArrears = feeType === FACILITY_PAYMENT_TYPE.IN_ARREARS;

    let paymentType;
    let feeFrequency;

    if (feeTypeIsInAdvance) {
      paymentType = inAdvanceFrequency;
      feeFrequency = inAdvanceFrequency;
    }

    if (feeTypeIsInArrears) {
      paymentType = inArrearsFrequency;
      feeFrequency = inArrearsFrequency;
    }

    const facilityUpdate = {
      feeType,
      paymentType,
      feeFrequency,
      dayCountBasis,
    };

    try {
      await api.updateFacility(facilityId, facilityUpdate);
      // updates application with editorId
      const applicationUpdate = {
        editorId: _id,
      };
      await api.updateApplication(dealId, applicationUpdate);

      return res.redirect(`/gef/application-details/${dealId}`);
    } catch (err) {
      return res.render('partials/problem-with-service.njk');
    }
  }

  facilityGuaranteeErrors.push(...validateFacilityGuarantee(body));

  if (facilityGuaranteeErrors.length > 0) {
    return res.render('partials/facility-guarantee.njk', {
      errors: validationErrorHandler(facilityGuaranteeErrors),
      feeType,
      inArrearsFrequency,
      inAdvanceFrequency,
      dayCountBasis,
      dealId,
      facilityId,
      status,
    });
  }
  return update();
};

module.exports = {
  facilityGuarantee,
  updateFacilityGuarantee,
};
