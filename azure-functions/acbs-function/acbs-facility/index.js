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
const CONSTANTS = require('../constants');
const helpers = require('../mappings/facility/helpers');

module.exports = df.orchestrator(function* createACBSfacility(context) {
  const {
    deal, facility, dealAcbsData, acbsReference,
  } = context.df.getInput();

  try {
    // 1. Facility Master
    const acbsFacilityMasterInput = mappings.facility.facilityMaster(
      deal, facility, dealAcbsData, acbsReference,
    );
    const facilityMaster = yield context.df.callActivityWithRetry(
      'activity-create-facility-master',
      retryOptions,
      { acbsFacilityMasterInput },
    );

    // 2. Facility Investor
    const acbsFacilityInvestorInput = mappings.facility.facilityInvestor(deal, facility);
    const facilityInvestor = yield context.df.callActivityWithRetry(
      'activity-create-facility-investor',
      retryOptions,
      { acbsFacilityInvestorInput },
    );

    // 3. Facility Covenant
    const acbsFacilityCovenantInput = mappings.facility.facilityCovenant(
      deal, facility, CONSTANTS.FACILITY.COVENANT_TYPE.UK_CONTRACT_VALUE,
    );
    const facilityCovenant = yield context.df.callActivityWithRetry(
      'activity-create-facility-covenant',
      retryOptions,
      { acbsFacilityCovenantInput },
    );

    // 4. Facility Type / Facility Guarantee
    let facilityTypeSpecific = {};

    if (deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
      facilityTypeSpecific = yield context.df.callSubOrchestrator('acbs-facility-loan', {
        deal, facility, dealAcbsData,
      });
    }

    if (deal.dealSnapshot.dealType !== CONSTANTS.PRODUCT.TYPE.GEF) {
      if (facility.facilityType === CONSTANTS.FACILITY.FACILITY_TYPE.LOAN) {
        facilityTypeSpecific = yield context.df.callSubOrchestrator('acbs-facility-loan', {
          deal, facility, dealAcbsData,
        });
      } else {
        facilityTypeSpecific = yield context.df.callSubOrchestrator('acbs-facility-bond', {
          deal, facility, dealAcbsData,
        });
      }
    }

    // 5. Bundle creation + Facility activation
    const acbsCodeValueTransactionInput = mappings.facility.codeValueTransaction(deal, facility);
    const codeValueTransaction = yield context.df.callActivity(
      'activity-create-code-value-transaction',
      { acbsCodeValueTransactionInput },
      retryOptions,
    );

    return {
    // eslint-disable-next-line no-underscore-dangle
      facilityId: facility._id,
      facilityStage: helpers.getFacilityStageCode(facility.facilitySnapshot, deal.dealSnapshot.dealType),
      facilityMaster,
      facilityInvestor,
      facilityCovenant,
      ...facilityTypeSpecific,
      codeValueTransaction,
    };
  } catch ({ message }) {
    const [type, errorDetails] = message.split('Error: ');
    console.error(errorDetails);
    return {
      error: {
        type,
        details: JSON.parse(errorDetails),
      },
    };
  }
});
