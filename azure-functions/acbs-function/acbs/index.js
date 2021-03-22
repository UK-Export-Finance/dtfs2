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

module.exports = df.orchestrator(function* (context) {
  const { deal, extraInfo = {} } = context.df.getInput();

  // Create Parties
  const exporterTask = context.df.callActivity('create-party', { party: mappings.party.exporter(deal) });
  const buyerTask = context.df.callActivity('create-party', { party: mappings.party.buyer(deal) });
  const agentTask = context.df.callActivity('create-party', { party: mappings.party.agent(deal) });
  const indemnifierTask = context.df.callActivity('create-party', { party: mappings.party.indemnifier(deal) });

  // Party tasks are run in parallel so wait for them all to be finished.
  yield context.df.Task.all([exporterTask, buyerTask, agentTask, indemnifierTask]);

  const parties = {
    exporter: exporterTask.result,
    buyer: buyerTask.result,
    agent: agentTask.result,
    indemnifier: indemnifierTask.result,
  };

  // Create Deal
  const acbsDealInput = mappings.deal.initialDeal(deal, parties.exporter.partyIdentifier, extraInfo.supplierAcbsIndustryId);
  const dealRecord = yield context.df.callActivity('create-deal', { deal: acbsDealInput });

  return {
    parties,
    dealRecord,
  };
});
