/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 */

const df = require('durable-functions');
const mappings = require('../../mappings');
const CONSTANTS = require('../../constants');
const retryOptions = require('../../helpers/retryOptions');

df.app.orchestration('acbs-facility-bond', function* createFacilityBond(context) {
  const payload = context.df.input;

  try {
    const { deal, facility, dealAcbsData } = payload;

    const { facilitySnapshot } = facility;
    const facilityIdentifier = facilitySnapshot.ukefFacilityId.padStart(10, 0);

    // BOND specific data
    const code =
      facilitySnapshot.currency.id === CONSTANTS.DEAL.CURRENCY.DEFAULT
        ? CONSTANTS.FACILITY.COVENANT_TYPE.CHARGEABLE_AMOUNT_GBP
        : CONSTANTS.FACILITY.COVENANT_TYPE.CHARGEABLE_AMOUNT_NON_GBP;

    // Facility Covenant
    const acbsFacilityBondCovenantInput = mappings.facility.facilityCovenant(deal, facility, code);

    const facilityCovenantChargeable = yield context.df.callActivityWithRetry('create-facility-covenant', retryOptions, {
      facilityIdentifier,
      acbsFacilityCovenantInput: acbsFacilityBondCovenantInput,
    });

    const parties = {};
    // Create parties
    if (facility.tfm.bondIssuerPartyUrn) {
      parties.bondIssuer = yield context.df.callActivityWithRetry('create-party', retryOptions, {
        party: mappings.party.bondIssuer({ deal, facility }),
      });
    }

    if (facility.tfm.bondBeneficiaryPartyUrn) {
      parties.bondBeneficiary = yield context.df.callActivityWithRetry('create-party', retryOptions, {
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

    const facilityBondIssuerGuarantee = yield context.df.callActivityWithRetry('create-facility-guarantee', retryOptions, {
      facilityIdentifier,
      acbsFacilityGuaranteeInput: acbsFacilityBondIssuerGuaranteeInput,
    });

    const acbsFacilityBondBeneficiaryGuaranteeInput = mappings.facility.facilityGuarantee(
      deal,
      facility,
      { dealAcbsData, facilityAcbsData: { parties } },
      CONSTANTS.FACILITY.GUARANTEE_TYPE.BOND_BENEFICIARY,
    );

    const facilityBondBeneficiaryGuarantee = yield context.df.callActivityWithRetry('create-facility-guarantee', retryOptions, {
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
    console.error('Error creating facility bond record %o', error);
    throw new Error(`Error creating facility bond record ${error}`);
  }
});
