const axios = require('axios');
const CONSTANTS = require('../../constants');

const mapProductGroup = (facilityType) => {
  if (facilityType === CONSTANTS.EXPOSURE_PERIOD.FACILITY_TYPE.BOND) {
    return CONSTANTS.EXPOSURE_PERIOD.PRODUCT_GROUP.BOND;
  }

  if (facilityType === CONSTANTS.EXPOSURE_PERIOD.FACILITY_TYPE.LOAN) {
    return CONSTANTS.EXPOSURE_PERIOD.PRODUCT_GROUP.LOAN;
  }

  // return null;
  //
  // TEMP for dev whilst we don't know what product group to use for GEF.
  // this code 'works'.
  return CONSTANTS.EXPOSURE_PERIOD.PRODUCT_GROUP.LOAN;
};

exports.getExposurePeriod = async (req, res) => {
  const { startDate, endDate, facilityType } = req.params;

  const productGroup = mapProductGroup(facilityType);

  console.log('Calling Exposure Period API');

  const response = await axios({
    method: 'get',
    url: `${process.env.MULESOFT_API_EXPOSURE_PERIOD_URL}?startdate=${startDate}&enddate=${endDate}&productgroup=${productGroup}`,
    auth: {
      username: process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_KEY,
      password: process.env.MULESOFT_API_CURRENCY_EXCHANGE_RATE_SECRET,
    },
  }).catch((catchErr) => {
    console.error('Error calling Exposure Period API');
    return catchErr.response;
  });

  const { status, data } = response;

  const { exposurePeriod } = data;

  return res.status(status).send({
    exposurePeriodInMonths: exposurePeriod,
  });
};
