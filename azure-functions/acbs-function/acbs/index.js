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
const retryOptions = require('../helpers/retryOptions');

module.exports = df.orchestrator(function* acbsDeal(context) {
  const { deal, bank } = context.df.getInput();

  // Get ACBS industry code
  const industryCode = deal.dealSnapshot.submissionDetails['industry-class']
                        && deal.dealSnapshot.submissionDetails['industry-class'].code;
  const acbsReference = {
    supplierAcbsIndustryCode: yield context.df.callActivityWithRetry('activity-get-acbs-industry-sector', retryOptions, { industryCode }),
  };

  // Create Parties
  const exporterTask = context.df.callActivityWithRetry('activity-create-party', retryOptions, { party: mappings.party.exporter({ deal, acbsReference }) });
  const buyerTask = context.df.callActivityWithRetry('activity-create-party', retryOptions, { party: mappings.party.buyer({ deal }) });
  const agentTask = context.df.callActivityWithRetry('activity-create-party', retryOptions, { party: mappings.party.agent({ deal }) });
  const indemnifierTask = context.df.callActivityWithRetry('activity-create-party', retryOptions, { party: mappings.party.indemnifier({ deal }) });
  const bankTask = context.df.callActivityWithRetry('activity-create-party', retryOptions, { party: mappings.party.bank({ bank }) });

  // Party tasks are run in parallel so wait for them all to be finished.
  yield context.df.Task.all([exporterTask, buyerTask, agentTask, indemnifierTask, bankTask]);

  const parties = {
    exporter: exporterTask.result,
    buyer: buyerTask.result,
    agent: agentTask.result,
    indemnifier: indemnifierTask.result,
    bank: bankTask.result,

  };

  // Create Deal
  const acbsDealInput = mappings.deal.deal(
    deal, parties.exporter.partyIdentifier, acbsReference,
  );

  const dealRecord = yield context.df.callActivityWithRetry('activity-create-deal', retryOptions, { deal: acbsDealInput });

  // Create Deal investor
  const acbsDealInvestorInput = mappings.deal.dealInvestor(deal);

  const dealInvestorRecord = yield context.df.callActivityWithRetry('activity-create-deal-investor', retryOptions, { investor: acbsDealInvestorInput });

  // Create Deal Guarantee
  const dealGuaranteeLimitKey = parties.indemnifier.partyIdentifier
                                || parties.exporter.partyIdentifier;

  const acbsDealGuaranteeInput = mappings.deal.dealGuarantee(deal, dealGuaranteeLimitKey);
  const dealGuaranteeRecord = yield context.df.callActivityWithRetry('activity-create-deal-guarantee', retryOptions, { guarantee: acbsDealGuaranteeInput });

  const dealAcbsData = {
    parties,
    deal: dealRecord,
    investor: dealInvestorRecord,
    guarantee: dealGuaranteeRecord,
  };

  const facilityTasks = deal.dealSnapshot.facilities.map((facility) => context.df.callSubOrchestrator(
    'acbs-facility',
    {
      deal, facility, dealAcbsData, acbsReference, bank,
    },
  ));

  yield context.df.Task.all([...facilityTasks]);

  return {
    // eslint-disable-next-line no-underscore-dangle
    portalDealId: deal._id,
    ukefDealId: deal.dealSnapshot.details.ukefDealId,
    deal: dealAcbsData,
    facilities: facilityTasks.map(({ result }) => result),
  };
});
