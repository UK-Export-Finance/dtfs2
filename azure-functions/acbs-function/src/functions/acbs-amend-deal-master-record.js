/**
 * This function is an Azure Durable sub-orchestrator function.
 * This function cannot be invoked directly and is rather executed by an Azure durable orchestrator
 * function.
 *
 * Deal Master Record amendment SOF
 * **********************************
 * This is a sub-orchestrated function invoked from it's master orchestrator.
 * `acbs-amend-deal` is the master orchestrator for this function.
 *
 * Sub-Orchestration Function (SOF)
 * --------------------------------
 * This function cannot be invoked directly and must be invoked by a DOF.
 *
 * Prerequisites
 * -------------
 * 0. 'npm install durable-functions'
 * 1. Durable HTTP trigger function (acbs-http)
 * 2. DOF (acbs-amend-deal)
 * 3. DAF (update-deal-master, get-deal-master)
 *
 * ACBS
 * ----
 * This function is responsible for amending FMR.
 * FMR is a parent record, created for every deal.
 */
const df = require('durable-functions');
const retryOptions = require('../../helpers/retryOptions');
const mappings = require('../../mappings');

df.app.orchestration('acbs-amend-deal-master-record', function* amenddealMaster(context) {
  const payload = context.df.input;

  try {
    if (!payload) {
      throw new Error('Deal Master Record amendment SOF - Invalid payload provided');
    }

    const { dealIdentifier, amendments } = payload;
    const { amendment } = amendments;
    let dealMasterRecordAmendments;

    // 5.1. Deal Master Record (FMR) mapping
    const dmrMapped = mappings.deal.dealMasterAmend(amendments);

    // 2.2.1 - UKEF Exposure
    if (amendment.amount) {
      const amount = yield context.df.callActivityWithRetry('update-deal-master', retryOptions, {
        dealIdentifier,
        acbsDealMasterInput: dmrMapped,
      });

      dealMasterRecordAmendments = {
        amount,
      };
    }

    return dealMasterRecordAmendments;
  } catch (error) {
    console.error('Error amending deal master record %o', error);
    throw new Error(`Error amending deal master record ${error}`);
  }
});
