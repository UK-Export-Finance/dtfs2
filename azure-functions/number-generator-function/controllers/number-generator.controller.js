// Number Generator API is used to get a new deal/facility id.
// However, the id might already be in use so we need to check it with ACBS.
//
// the flow is:
// 1) number-generator API gives us deal and facility IDs
// 2) ACBS API tells us if the deal/facility IDs are already in use.
//
// if the ID from number-generator is already in use
// we keep iterating over this flow until we get an ID that can be used.

const api = require('../api');

const callNumberGenerator = async (numberType) => {
  console.info('Azure functions - callNumberGenerator');

  const response = await api.callNumberGenerator(numberType);

  if (response.error) {
    console.error('Azure functions - callNumberGenerator error');

    return {
      error: response.error,
    };
  }

  return response.data.maskedId;
};
exports.callNumberGenerator = callNumberGenerator;
