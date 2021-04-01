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

module.exports = df.orchestrator(function* createACBSfacilityBond(context) {
  const firstRetryIntervalInMilliseconds = 5000;
  const maxNumberOfAttempts = 3;

  const retryOptions = new df.RetryOptions(firstRetryIntervalInMilliseconds, maxNumberOfAttempts);

  const {
    deal, facility, acbsData,
  } = context.df.getInput();

  const { facilitySnapshot } = facility;

  // BOND specific data
  const convenantCode = facilitySnapshot.currency.id === 'GDP'
    ? CONSTANTS.FACILITY.COVENANT_TYPE.CHARGEABLE_AMOUNT_GDP
    : CONSTANTS.FACILITY.COVENANT_TYPE.CHARGEABLE_AMOUNT_NON_GDP;

  // Facility Covenant
  const acbsFacilityBondCovenantInput = mappings.facility.facilityCovenant(deal, facility, convenantCode);

  const facilityCovenantChargeable = yield context.df.callActivity(
    'create-facility-covenant',
    { acbsFacilityCovenantInput: acbsFacilityBondCovenantInput },
    retryOptions,
  );


  const parties = {};
  // Create facility parties
  if (facility.tfm.bondIssuerPartyUrn) {
    parties.bondIssuer = yield context.df.callActivity(
      'create-party',
      { party: mappings.party.bondIssuer({ deal, facility }) },
      retryOptions,
    );
  }

  if (facility.tfm.bondBeneficiaryPartyUrn) {
    parties.bondBeneficiary = yield context.df.callActivity(
      'create-party',
      { party: mappings.party.bondBeneficiary({ deal, facility }) },
      retryOptions,
    );
  }

  // Facility Guarantee Bond Issuer
  // const acbsFacilityBondIssuerGuaranteeInput = mappings.facility.facilityGuarantee(
  //   deal,
  //   facility,
  //   { acbsData, facilityAcbsData: { parties } },
  //   CONSTANTS.FACILITY.GUARANTEE_TYPE.BOND_GIVER,
  // );

  // const facilityBondIssuerGuarantee = yield context.df.callActivity(
  //   'create-facility-guarantee',
  //   { acbsFacilityGuaranteeInput: acbsFacilityBondIssuerGuaranteeInput },
  //   retryOptions,
  // );

  // const acbsFacilityBondBeneficiaryGuaranteeInput = mappings.facility.facilityGuarantee(
  //   deal,
  //   facility,
  //   { acbsData, facilityAcbsData: { parties } },
  //   CONSTANTS.FACILITY.GUARANTEE_TYPE.BOND_BENEFICIARY,
  // );

  // const facilityBondBeneficiaryGuarantee = yield context.df.callActivity(
  //   'create-facility-guarantee',
  //   { acbsFacilityGuaranteeInput: acbsFacilityBondBeneficiaryGuaranteeInput },
  //   retryOptions,
  // );


  return {
    parties,
    facilityCovenantChargeable,
    //    facilityBondIssuerGuarantee,
    // facilityBondBeneficiaryGuarantee,
  };
});
