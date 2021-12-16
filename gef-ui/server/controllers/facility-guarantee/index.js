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
      // eslint-disable-next-line no-console
      console.log('Facility not found, or not authorised');
      return res.redirect('/');
    }
    return res.render('partials/facility-guarantee.njk', {
      dealId: facility.dealId,
      facilityId: facility.facilityId,
      feeType: facility.feeType,
      inAdvanceFrequency: facility.feeType === 'in advance' ? facility.feeFrequency : '',
      inArrearsFrequency: facility.feeType === 'in arrears' ? facility.feeFrequency : '',
      dayCountBasis: facility.dayCountBasis,
      status,
    });
  } catch (err) {
    return res.render('partials/problem-with-service.njk');
  }
};

const updateFacilityGuarantee = async (req, res) => {
  const { params, body, query } = req;
  const { dealId, facilityId } = params;
  const {
    feeType, inAdvanceFrequency, inArrearsFrequency, dayCountBasis,
  } = body;
  const { status } = query;
  const facilityGuaranteeErrors = [];

  async function update() {
    const feeTypeIsInAdvance = feeType === 'in advance';
    const feeTypeIsInArrears = feeType === 'in arrears';
    const feeTypeIsInAtMaturity = feeType === 'at maturity';

    const cleanFrequencyValue = (str) => str.replace('-', '_').toUpperCase();

    let paymentType;

    if (feeTypeIsInAdvance) {
      paymentType = `${FACILITY_PAYMENT_TYPE.IN_ADVANCE}_${cleanFrequencyValue(inAdvanceFrequency)}`;
    }

    if (feeTypeIsInArrears) {
      paymentType = `${FACILITY_PAYMENT_TYPE.IN_ARREARS}_${cleanFrequencyValue(inAdvanceFrequency)}`;
    }

    if (feeTypeIsInAtMaturity) {
      paymentType = FACILITY_PAYMENT_TYPE.AT_MATURITY;
    }

    try {
      await api.updateFacility(facilityId, {
        feeType,
        paymentType,
        feeFrequency: feeTypeIsInAdvance ? inAdvanceFrequency : inArrearsFrequency,
        dayCountBasis,
      });
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
