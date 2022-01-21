/*
 * This function is not intended to be invoked directly. Instead it will be
 * triggered by an HTTP starter function.
 *
 * Before running this sample, please:
 * - create a Durable activity function (default name is "Hello")
 * - create a Durable HTTP starter function
 * - run 'npm install durable-functions' from the wwwroot folder of your
 *    function app in Kudu
 */

const df = require('durable-functions');
const retryOptions = require('../helpers/retryOptions');
const mappings = require('../mappings');

module.exports = df.orchestrator(function* updateACBSfacility(context) {
  const {
    facilityId, facility, supplierName, dealType,
  } = context.df.getInput();

  if (facilityId) {
    // 1. GET Facility master record object
    const { acbsFacility, etag } = yield context.df.callActivityWithRetry(
      'activity-get-facility-master',
      retryOptions,
      { facilityId },
    );

    if (acbsFacility && etag) {
      // 2. Create updated facility master record object
      const acbsFacilityMasterInput = mappings.facility.facilityUpdate(facility, acbsFacility, supplierName, dealType);
      console.log({ acbsFacilityMasterInput });
      // 3. PUT updated facility master record object
      const issuedFacilityMaster = yield context.df.callActivityWithRetry(
        'activity-update-facility-master',
        retryOptions,
        {
          facilityId, acbsFacilityMasterInput, updateType: 'issue', etag,
        },
      );

      return {
        facilityId: facility._id,
        issuedFacilityMaster,
      };
    }
  }

  return {};
});
