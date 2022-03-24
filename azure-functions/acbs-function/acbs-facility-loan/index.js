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
const mappings = require('../mappings');
const CONSTANTS = require('../constants');
const retryOptions = require('../helpers/retryOptions');

module.exports = df.orchestrator(function* createACBSfacilityBond(context) {
  const {
    deal, facility, dealAcbsData,
  } = context.df.getInput();
  let response;

  // 1. Create Guarantee (Facility Provider)
  const acbsFacilityProviderGuaranteeInput = mappings.facility.facilityGuarantee(
    deal,
    facility,
    { dealAcbsData },
    CONSTANTS.FACILITY.GUARANTEE_TYPE.FACILITY_PROVIDER,
  );

  const facilityProviderTask = context.df.callActivityWithRetry(
    'activity-create-facility-guarantee',
    retryOptions,
    { acbsFacilityGuaranteeInput: acbsFacilityProviderGuaranteeInput },
  );

  // 2. Create Guarantee (Facility buyer) - EWCS/BSS ONLY
  if (deal.dealSnapshot.dealType !== CONSTANTS.PRODUCT.TYPE.GEF) {
    const acbsFacilityBuyerGuaranteeInput = mappings.facility.facilityGuarantee(
      deal,
      facility,
      { dealAcbsData },
      CONSTANTS.FACILITY.GUARANTEE_TYPE.BUYER_FOR_EXPORTER_EWCS,
    );

    const facilityBuyerTask = context.df.callActivityWithRetry(
      'activity-create-facility-guarantee',
      retryOptions,
      { acbsFacilityGuaranteeInput: acbsFacilityBuyerGuaranteeInput },
    );

    yield context.df.Task.all([facilityProviderTask, facilityBuyerTask]);
    response = {
      facilityProviderGuarantee: facilityProviderTask.result,
      facilityBuyerGuarantee: facilityBuyerTask.result,
    };
  } else {
    yield context.df.Task.all([facilityProviderTask]);
    response = {
      facilityProviderGuarantee: facilityProviderTask.result,
    };
  }
  return response;
});
