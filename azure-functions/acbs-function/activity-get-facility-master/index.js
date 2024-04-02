/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an orchestrator function.
 *
 * Before running this sample, please:
 * - create a Durable orchestration function
 * - create a Durable HTTP starter function
 *  * - run 'npm install durable-functions' from the wwwroot folder of your
 *   function app in Kudu
 */
const df = require('durable-functions');
const api = require('../api');
const { isHttpErrorStatus } = require('../helpers/http');

const getFacilityMaster = async (context) => {
  try {
    const { facilityId } = context.bindingData;

    if (facilityId) {
      const {
        status,
        data,
        headers: { etag },
      } = await api.getFacility(facilityId);

      if (isHttpErrorStatus(status)) {
        throw new Error(
          JSON.stringify(
            {
              name: 'ACBS Facility fetch error',
              facilityId,
              dataReceived: data,
            },
            null,
            4,
          ),
        );
      }

      return {
        acbsFacility: data,
        etag,
      };
    }

    throw new Error('Invalid argument set');
  } catch (error) {
    console.error('Error getting facility master record: %o', error);
    throw new Error(`Error getting facility master record ${error}`);
  }
};

df.app.activity('get-facility-master', {
  handler: getFacilityMaster,
});
