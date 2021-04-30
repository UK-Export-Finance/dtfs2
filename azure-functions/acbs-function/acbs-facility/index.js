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

module.exports = df.orchestrator(function* createACBSfacility(context) {
  const {
    deal, facility, dealAcbsData, acbsReference,
  } = context.df.getInput();

  const { facilitySnapshot } = facility;

  try {
  // Facility Master
    const acbsFacilityMasterInput = mappings.facility.facilityMaster(
      deal, facility, dealAcbsData, acbsReference,
    );

    const facilityMaster = yield context.df.callActivityWithRetry(
      'activity-create-facility-master',
      retryOptions,
      { acbsFacilityMasterInput },
    );

    // Facility Investor
    const acbsFacilityInvestorInput = mappings.facility.facilityInvestor(deal, facility);

    const facilityInvestor = yield context.df.callActivityWithRetry(
      'activity-create-facility-investor',
      retryOptions,
      { acbsFacilityInvestorInput },
    );

    // Facility Covenant
    const acbsFacilityCovenantInput = mappings.facility.facilityCovenant(
      deal, facility, CONSTANTS.FACILITY.COVENANT_TYPE.UK_CONTRACT_VALUE,
    );
    const facilityCovenant = yield context.df.callActivityWithRetry(
      'activity-create-facility-covenant',
      retryOptions,
      { acbsFacilityCovenantInput },
    );

    let facilityTypeSpecific = {};

    if (facilitySnapshot.facilityType === CONSTANTS.FACILITY.FACILITY_TYPE.LOAN) {
      facilityTypeSpecific = yield context.df.callSubOrchestrator('acbs-facility-loan', {
        deal, facility, dealAcbsData,
      });
    } else {
      facilityTypeSpecific = yield context.df.callSubOrchestrator('acbs-facility-bond', {
        deal, facility, dealAcbsData,
      });
    }

    // Activate bundle
    const acbsCodeValueTransactionInput = mappings.facility.codeValueTransaction(deal, facility);

    const codeValueTransaction = yield context.df.callActivity(
      'activity-create-code-value-transaction',
      { acbsCodeValueTransactionInput },
      retryOptions,
    );

    return {
    // eslint-disable-next-line no-underscore-dangle
      facilityId: facility._id,
      facilityStage: facility.facilitySnapshot.facilityStage,
      facilityMaster,
      facilityInvestor,
      facilityCovenant,
      ...facilityTypeSpecific,
      codeValueTransaction,
    };
  } catch ({ message }) {
    const [type, errorDetails] = message.split('Error: ');

    return {
      error: {
        type,
        details: JSON.parse(errorDetails),
      },
    };
    //    throw new Error(err);
    //    return Promise.resolve(err);
  }
});
