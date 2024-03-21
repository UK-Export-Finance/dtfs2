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
  try {
    const { deal, facility, dealAcbsData } = context.df.getInput();

    const { facilitySnapshot } = facility;
    const facilityIdentifier = facilitySnapshot.ukefFacilityId.padStart(10, 0);

    // BOND specific data
    const code = facilitySnapshot.currency.id === CONSTANTS.DEAL.CURRENCY.DEFAULT
      ? CONSTANTS.FACILITY.COVENANT_TYPE.CHARGEABLE_AMOUNT_GBP
      : CONSTANTS.FACILITY.COVENANT_TYPE.CHARGEABLE_AMOUNT_NON_GBP;

    // Facility Covenant
    const acbsFacilityBondCovenantInput = mappings.facility.facilityCovenant(deal, facility, code);

    const facilityCovenantChargeable = yield context.df.callActivityWithRetry('activity-create-facility-covenant', retryOptions, {
      facilityIdentifier,
      acbsFacilityCovenantInput: acbsFacilityBondCovenantInput,
    });

    const parties = {};
    // Create parties
    if (facility.tfm.bondIssuerPartyUrn) {
      parties.bondIssuer = yield context.df.callActivityWithRetry('activity-create-party', retryOptions, {
        party: mappings.party.bondIssuer({ deal, facility }),
      });
    }

    if (facility.tfm.bondBeneficiaryPartyUrn) {
      parties.bondBeneficiary = yield context.df.callActivityWithRetry('activity-create-party', retryOptions, {
        party: mappings.party.bondBeneficiary({ deal, facility }),
      });
    }

    // Facility Guarantee Bond Issuer
    const acbsFacilityBondIssuerGuaranteeInput = mappings.facility.facilityGuarantee(
      deal,
      facility,
      { dealAcbsData, facilityAcbsData: { parties } },
      CONSTANTS.FACILITY.GUARANTEE_TYPE.BOND_GIVER,
    );

    const facilityBondIssuerGuarantee = yield context.df.callActivityWithRetry('activity-create-facility-guarantee', retryOptions, {
      facilityIdentifier,
      acbsFacilityGuaranteeInput: acbsFacilityBondIssuerGuaranteeInput,
    });

    const acbsFacilityBondBeneficiaryGuaranteeInput = mappings.facility.facilityGuarantee(
      deal,
      facility,
      { dealAcbsData, facilityAcbsData: { parties } },
      CONSTANTS.FACILITY.GUARANTEE_TYPE.BOND_BENEFICIARY,
    );

    const facilityBondBeneficiaryGuarantee = yield context.df.callActivityWithRetry('activity-create-facility-guarantee', retryOptions, {
      facilityIdentifier,
      acbsFacilityGuaranteeInput: acbsFacilityBondBeneficiaryGuaranteeInput,
    });

    return {
      parties,
      facilityCovenantChargeable,
      facilityBondIssuerGuarantee,
      facilityBondBeneficiaryGuarantee,
    };
  } catch (error) {
    console.error('Error creating facility bond record: %s', error);
    throw new Error('Error creating facility bond record');
  }
});
