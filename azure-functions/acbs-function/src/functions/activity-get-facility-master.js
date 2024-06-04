/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * @module acbs-get-facility-master
 */

const df = require('durable-functions');
const api = require('../../api');
const { isHttpErrorStatus } = require('../../helpers/http');

df.app.activity('get-facility-master', {
  handler: async (facilityId) => {
    try {
      if (!facilityId) {
        throw new Error('Invalid facility ID');
      }

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
      console.error('Unable to get facility %o', error);
      throw new Error(`Unable to get facility ${error}`);
    }
  },
});
