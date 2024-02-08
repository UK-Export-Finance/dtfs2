// Number Generator API is used to get a new deal/facility id.
// However, the id might already be in use so we need to check it with ACBS.
//
// the flow is:
// 1) number-generator API gives us deal and facility IDs
// 2) ACBS API tells us if the deal/facility IDs are already in use.
//
// if the ID from number-generator is already in use
// we keep iterating over this flow until we get an ID that can be used.

/**
 * EXPECTED RESPONSE
 * ******************
 * [
    {
        "id": 12345678,
        "maskedId": "0030000000",
        "type": 1,
        "createdBy": "Portal v2/TFM",
        "createdDatetime": "1970-01-01T00:00:00.000Z",
        "requestingSystem": "Portal v2/TFM"
    }
]
 */

const api = require('../api');

const callNumberGenerator = async (numberType) => {
  try {
    const response = await api.callNumberGenerator(numberType);

    if (response.error) {
      throw new Error('Error received from APIM %O', response.error);
    }

    if (!response.data) {
      throw new Error('Void response received');
    }

    if (!response.data.length) {
      throw new Error('Void response length');
    }

    if (!response.data[0].maskedId) {
      throw new Error('Non-existent `maskedId` in response');
    }

    // Return number
    return response.data[0].maskedId;
  } catch (error) {
    console.error('Error while calling number generator %O', error);
    return {};
  }
};

exports.callNumberGenerator = callNumberGenerator;
