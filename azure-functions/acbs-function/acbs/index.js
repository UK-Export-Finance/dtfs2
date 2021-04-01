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

module.exports = df.orchestrator(function* acbsDeal(context) {
  const firstRetryIntervalInMilliseconds = 5000;
  const maxNumberOfAttempts = 3;

  const retryOptions = new df.RetryOptions(firstRetryIntervalInMilliseconds, maxNumberOfAttempts);

  const { deal, bank } = context.df.getInput();

  // Get ACBS industry code
  const industryCode = deal.dealSnapshot.submissionDetails['industry-class']
                        && deal.dealSnapshot.submissionDetails['industry-class'].code;
  const acbsReference = {
    supplierAcbsIndustryCode: yield context.df.callActivity('activity-get-acbs-industry-sector', { industryCode }, retryOptions),
  };

  // Create Parties
  const exporterTask = context.df.callActivity('activity-create-party', { party: mappings.party.exporter({ deal, acbsReference }) }, retryOptions);
  const buyerTask = context.df.callActivity('activity-create-party', { party: mappings.party.buyer({ deal }) }, retryOptions);
  const agentTask = context.df.callActivity('activity-create-party', { party: mappings.party.agent({ deal }) }, retryOptions);
  const indemnifierTask = context.df.callActivity('activity-create-party', { party: mappings.party.indemnifier({ deal }) }, retryOptions);
  const bankTask = context.df.callActivity('activity-create-party', { party: mappings.party.bank({ bank }) }, retryOptions);

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

  const dealRecord = yield context.df.callActivity('activity-create-deal', { deal: acbsDealInput }, retryOptions);

  // Create Deal investor
  const acbsDealInvestorInput = mappings.deal.dealInvestor(deal);

  const dealInvestorRecord = yield context.df.callActivity('activity-create-deal-investor', { investor: acbsDealInvestorInput }, retryOptions);

  // Create Deal Guarantee
  const dealGuaranteeLimitKey = parties.indemnifier.partyIdentifier
                                || parties.exporter.partyIdentifier;

  const acbsDealGuaranteeInput = mappings.deal.dealGuarantee(deal, dealGuaranteeLimitKey);
  const dealGuaranteeRecord = yield context.df.callActivity('activity-create-deal-guarantee', { guarantee: acbsDealGuaranteeInput }, retryOptions);

  const dealAcbsData = {
    parties,
    deal: dealRecord,
    investor: dealInvestorRecord,
    guarantee: dealGuaranteeRecord,
  };

  const facilityTasks = deal.dealSnapshot.facilities.map((facility) => context.df.callSubOrchestrator('acbs-facility', {
    deal, facility, dealAcbsData, acbsReference, bank,
  }));
  yield context.df.Task.all([...facilityTasks]);

  return {
    // eslint-disable-next-line no-underscore-dangle
    portalDealId: deal._id,
    ukefDealId: deal.dealSnapshot.details.ukefDealId,
    deal: dealAcbsData,
    facilities: facilityTasks.map(({ result }) => result),
  };
});
