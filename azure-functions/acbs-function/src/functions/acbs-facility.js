/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 */

const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const mappings = require('../../mappings');
const CONSTANTS = require('../../constants');
const helpers = require('../../mappings/facility/helpers');

df.app.orchestration('acbs-facility', function* createFacility(context) {
  const payload = context.df.input;

  try {
    const { deal, facility, dealAcbsData, acbsReference } = payload;
    let facilityLoan;
    let facilityFee;

    // 1. Facility Master
    const acbsFacilityMasterInput = mappings.facility.facilityMaster(deal, facility, dealAcbsData, acbsReference);
    const { facilityIdentifier } = acbsFacilityMasterInput;

    if (facilityIdentifier.includes(CONSTANTS.DEAL.UKEF_ID.PENDING) || facilityIdentifier.includes(CONSTANTS.DEAL.UKEF_ID.TEST)) {
      throw new Error(`Invalid facility ID ${facilityIdentifier}`);
    }

    const facilityMaster = yield context.df.callActivityWithRetry('create-facility-master', retryOptions, acbsFacilityMasterInput);

    // 2. Facility Investor
    const acbsFacilityInvestorInput = mappings.facility.facilityInvestor(deal, facility);

    const facilityInvestor = yield context.df.callActivityWithRetry('create-facility-investor', retryOptions, {
      facilityIdentifier,
      acbsFacilityInvestorInput,
    });

    // 3. Facility Covenant
    const acbsFacilityCovenantInput = mappings.facility.facilityCovenant(deal, facility, CONSTANTS.FACILITY.COVENANT_TYPE.UK_CONTRACT_VALUE);

    const facilityCovenant = yield context.df.callActivityWithRetry('create-facility-covenant', retryOptions, {
      facilityIdentifier,
      acbsFacilityCovenantInput,
    });

    // 4. Facility Type / Facility Guarantee
    let facilityTypeSpecific = {};

    if (deal.dealSnapshot.dealType === CONSTANTS.PRODUCT.TYPE.GEF) {
      facilityTypeSpecific = yield context.df.callSubOrchestrator('acbs-facility-loan', {
        deal,
        facility,
        dealAcbsData,
      });
    }

    if (deal.dealSnapshot.dealType !== CONSTANTS.PRODUCT.TYPE.GEF) {
      if (facility.facilitySnapshot.type === CONSTANTS.FACILITY.FACILITY_TYPE.LOAN) {
        facilityTypeSpecific = yield context.df.callSubOrchestrator('acbs-facility-loan', {
          deal,
          facility,
          dealAcbsData,
        });
      } else if (facility.facilitySnapshot.type === CONSTANTS.FACILITY.FACILITY_TYPE.BOND) {
        facilityTypeSpecific = yield context.df.callSubOrchestrator('acbs-facility-bond', {
          deal,
          facility,
          dealAcbsData,
        });
      }
    }

    // 5. Bundle creation + Facility activation
    const acbsCodeValueTransactionInput = mappings.facility.codeValueTransaction();

    const codeValueTransaction = yield context.df.callActivityWithRetry('create-code-value-transaction', retryOptions, {
      facilityIdentifier,
      acbsCodeValueTransactionInput,
    });

    // Records only created for `Issued` and `Activated` facilities only
    if (helpers.hasFacilityBeenIssued(facility)) {
      // 6. Facility loan record
      const acbsFacilityLoanInput = mappings.facility.facilityLoan(deal, facility, dealAcbsData);

      facilityLoan = yield context.df.callActivityWithRetry('create-facility-loan', retryOptions, {
        facilityIdentifier,
        acbsFacilityLoanInput,
      });

      // 7. Facility fee record
      const acbsFacilityFeeInput = mappings.facility.facilityFee(deal, facility);

      if (Array.isArray(acbsFacilityFeeInput)) {
        facilityFee = [];
        // eslint-disable-next-line no-plusplus
        for (let i = 0; i < acbsFacilityFeeInput.length; i++) {
          const input = acbsFacilityFeeInput[i];
          facilityFee.push(
            yield context.df.callActivityWithRetry('create-facility-fee', retryOptions, {
              facilityIdentifier,
              acbsFacilityFeeInput: input,
            }),
          );
        }
      } else {
        facilityFee = yield context.df.callActivityWithRetry('create-facility-fee', retryOptions, {
          facilityIdentifier,
          acbsFacilityFeeInput,
        });
      }
    } else {
      console.info('Unissued facility %s', acbsFacilityMasterInput.facilityIdentifier);
    }

    return {
      facilityId: facility._id,
      facilityStage: helpers.getFacilityStageCode(facility.facilitySnapshot, deal.dealSnapshot.dealType),
      facilityMaster,
      facilityInvestor,
      facilityCovenant,
      ...facilityTypeSpecific,
      codeValueTransaction,
      facilityLoan,
      facilityFee,
    };
  } catch (error) {
    console.error('Error creating facility records %o', error);
    throw new Error(`Error creating facility record ${error}`);
  }
});
