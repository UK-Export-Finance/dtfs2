/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 */

const df = require('durable-functions');
const mappings = require('../../mappings');
const CONSTANTS = require('../../constants');
const retry = require('../../helpers/retry');

df.app.orchestration('acbs-facility-loan', function* createFacilityLoan(context) {
  const payload = context.df.input;

  try {
    const { deal, facility, dealAcbsData } = payload;

    const facilityIdentifier = facility.facilitySnapshot.ukefFacilityId.padStart(10, 0);
    let response;

    // 1. Create Guarantee (Facility Provider)
    const acbsFacilityProviderGuaranteeInput = mappings.facility.facilityGuarantee(
      deal,
      facility,
      { dealAcbsData },
      CONSTANTS.FACILITY.GUARANTEE_TYPE.FACILITY_PROVIDER,
    );

    const facilityProviderTask = context.df.callActivityWithRetry('create-facility-guarantee', retry, {
      facilityIdentifier,
      acbsFacilityGuaranteeInput: acbsFacilityProviderGuaranteeInput,
    });

    // 2. Create Guarantee (Facility buyer) - EWCS/BSS ONLY
    if (deal.dealSnapshot.dealType !== CONSTANTS.PRODUCT.TYPE.GEF) {
      const acbsFacilityBuyerGuaranteeInput = mappings.facility.facilityGuarantee(
        deal,
        facility,
        { dealAcbsData },
        CONSTANTS.FACILITY.GUARANTEE_TYPE.BUYER_FOR_EXPORTER_EWCS,
      );

      const facilityBuyerTask = context.df.callActivityWithRetry('create-facility-guarantee', retry, {
        facilityIdentifier,
        acbsFacilityGuaranteeInput: acbsFacilityBuyerGuaranteeInput,
      });

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
  } catch (error) {
    console.error('Error creating facility loan record %o', error);
    throw new Error(`Error creating facility loan record ${error}`);
  }
});
