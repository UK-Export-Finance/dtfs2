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
    facilityId, facility, supplierName,
  } = context.df.getInput();

  // Facility Master
  const { acbsFacility, etag } = yield context.df.callActivityWithRetry(
    'activity-get-facility-master',
    retryOptions,
    { facilityId },
  );

  const acbsFacilityMasterInput = mappings.facility.facilityUpdate(facility, acbsFacility, supplierName);

  const issuedFacilityMaster = yield context.df.callActivityWithRetry(
    'activity-update-facility-master',
    retryOptions,
    {
      facilityId, acbsFacilityMasterInput, updateType: 'issue', etag,
    },
  );

  return {
    // eslint-disable-next-line no-underscore-dangle
    facilityId: facility._id,
    issuedFacilityMaster,
  };
});
