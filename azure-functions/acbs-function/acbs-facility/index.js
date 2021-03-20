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

module.exports = df.orchestrator(function* createACBSfacility(context) {
  const firstRetryIntervalInMilliseconds = 5000;
  const maxNumberOfAttempts = 3;

  const retryOptions = new df.RetryOptions(firstRetryIntervalInMilliseconds, maxNumberOfAttempts);

  const {
    deal, facility, acbsData, acbsReference, bank,
  } = context.df.getInput();

  const { facilitySnapshot } = facility;

  // Facility Master
  const acbsFacilityMasterInput = mappings.facility.facilityMaster(
    deal, facility, acbsData, acbsReference,
  );

  const facilityMaster = yield context.df.callActivity(
    'create-facility-master',
    { acbsFacilityMasterInput },
    retryOptions,
  );

  // Facility Investor
  const acbsFacilityInvestorInput = mappings.facility.facilityInvestor(deal, facility);

  const facilityInvestor = yield context.df.callActivity(
    'create-facility-investor',
    { acbsFacilityInvestorInput },
    retryOptions,
  );

  // Facility Covenant
  const acbsFacilityCovenantInput = mappings.facility.facilityCovenant(
    deal, facility, CONSTANTS.FACILITY.COVENANT_TYPE.UK_CONTRACT_VALUE,
  );
  const facilityCovenant = yield context.df.callActivity(
    'create-facility-covenant',
    { acbsFacilityCovenantInput },
    retryOptions,
  );

  let facilityTypeSpecific = {};

  if (facilitySnapshot.facilityType === CONSTANTS.FACILITY.FACILITY_TYPE.LOAN) {
    facilityTypeSpecific = yield context.df.callSubOrchestrator('acbs-facility-loan', {
      deal, facility, acbsData,
    });
  } else {
    facilityTypeSpecific = yield context.df.callSubOrchestrator('acbs-facility-bond', {
      deal, facility, acbsData,
    });
  }

  // Activate bundle
  const acbsCodeValueTransactionInput = mappings.facility.codeValueTransaction(deal, facility);

  const codeValueTransaction = yield context.df.callActivity(
    'create-code-value-transaction',
    { acbsCodeValueTransactionInput },
    retryOptions,
  );

  return {
    // eslint-disable-next-line no-underscore-dangle
    [facility._id]: {
      facilityMaster,
      facilityInvestor,
      facilityCovenant,
      ...facilityTypeSpecific,
      codeValueTransaction,
    },
  };
});
