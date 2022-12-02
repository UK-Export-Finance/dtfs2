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
const CONSTANTS = require('../constants');

module.exports = df.orchestrator(function* HDeal(context) {
  if (context.df.getInput()) {
    const { deal, bank } = context.df.getInput();
    // Get Product Type
    const product = deal.dealSnapshot.dealType;

    // Get ACBS industry ID from UKEF industry ID
    let industry;
    // Get ACBS Country code (3 Letter ISO) from UKEF country name
    let country;

    if (product !== CONSTANTS.PRODUCT.TYPE.GEF) {
      industry = deal.dealSnapshot.submissionDetails['industry-class'] && deal.dealSnapshot.submissionDetails['industry-class'].code;
      country = deal.dealSnapshot.submissionDetails['supplier-address-country'] && deal.dealSnapshot.submissionDetails['supplier-address-country'].code;
    } else {
      industry = deal.dealSnapshot.exporter.industries[0].class.code;
      country = deal.dealSnapshot.exporter.registeredAddress.country;
    }

    const acbsReference = {
      supplierAcbsIndustryCode: yield context.df.callActivityWithRetry(
        'activity-get-acbs-industry-sector',
        retryOptions,
        { industry },
      ),
    };

    /**
     * Check whether the exporter's country is in the UK.
     * If it is set to GBR (Default) and skip ACBS country code Mulesoft call
     */
    if (CONSTANTS.DEAL.UNITED_KINGDOM.includes(country.toLowerCase())) {
      acbsReference.country = {
        supplierAcbsCountryCode: CONSTANTS.DEAL.COUNTRY.DEFAULT,
      };
      country = CONSTANTS.DEAL.COUNTRY.DEFAULT;
    }

    if (product === CONSTANTS.PRODUCT.TYPE.GEF && country !== CONSTANTS.DEAL.COUNTRY.DEFAULT) {
      acbsReference.country = {
        supplierAcbsCountryCode: yield context.df.callActivityWithRetry(
          'activity-get-acbs-country-code',
          retryOptions,
          { country },
        ),
      };
    } else {
      acbsReference.country = country;
    }

    // 1. Create Parties
    const exporterTask = context.df.callActivityWithRetry(
      'activity-create-party',
      retryOptions,
      { party: mappings.party.exporter({ deal, acbsReference }) },
    );

    const bankTask = context.df.callActivityWithRetry(
      'activity-create-party',
      retryOptions,
      { party: mappings.party.bank({ bank }) },
    );

    let buyerTask;

    if (product !== CONSTANTS.PRODUCT.TYPE.GEF) {
      buyerTask = context.df.callActivityWithRetry(
        'activity-create-party',
        retryOptions,
        { party: mappings.party.buyer({ deal }) },
      );

      /*
      Following parties are only created once the
      future tickets have been incorporated.

      let agentTask;
      let indemnifierTask;

      agentTask = context.df.callActivityWithRetry(
        'activity-create-party',
        retryOptions,
        { party: mappings.party.agent({ deal }) },
      );
      indemnifierTask = context.df.callActivityWithRetry(
        'activity-create-party',
        retryOptions,
        { party: mappings.party.indemnifier({ deal }) },
      );
      */
    }

    // 1.1. Party tasks are run in parallel so wait for them all to be finished.
    yield context.df.Task.all(
      product === CONSTANTS.PRODUCT.TYPE.GEF
        ? [exporterTask, bankTask]
        : [exporterTask, bankTask, buyerTask],
    );

    let parties;

    if (product === CONSTANTS.PRODUCT.TYPE.GEF) {
      parties = {
        exporter: exporterTask.result,
        bank: bankTask.result,
      };
    } else {
      parties = {
        exporter: exporterTask.result,
        bank: bankTask.result,
        buyer: buyerTask.result,
      };
    }

    // 2. Create Deal
    const acbsDealInput = mappings.deal.deal(
      deal,
      parties.exporter.partyIdentifier,
      acbsReference,
    );

    const dealRecord = yield context.df.callActivityWithRetry(
      'activity-create-deal',
      retryOptions,
      { deal: acbsDealInput },
    );

    // 3. Create Deal investor
    const acbsDealInvestorInput = mappings.deal.dealInvestor(deal);
    const dealInvestorRecord = yield context.df.callActivityWithRetry(
      'activity-create-deal-investor',
      retryOptions,
      { investor: acbsDealInvestorInput },
    );

    // 4. Create Deal Guarantee
    const acbsDealGuaranteeInput = mappings.deal.dealGuarantee(
      deal,
      parties.indemnifier
        ? parties.indemnifier.partyIdentifier
        : parties.exporter.partyIdentifier,
    );
    const dealGuaranteeRecord = yield context.df.callActivityWithRetry(
      'activity-create-deal-guarantee',
      retryOptions,
      { guarantee: acbsDealGuaranteeInput },
    );

    const dealAcbsData = {
      parties,
      deal: dealRecord,
      investor: dealInvestorRecord,
      guarantee: dealGuaranteeRecord,
    };

    // 5. Facility records
    const facilityTasks = deal.dealSnapshot.facilities.map((facility) =>
      context.df.callSubOrchestrator('acbs-facility', {
        deal,
        facility,
        dealAcbsData,
        acbsReference,
        bank,
      }));

    yield context.df.Task.all([...facilityTasks]);

    return {
      portalDealId: deal._id,
      ukefDealId:
        product === CONSTANTS.PRODUCT.TYPE.GEF
          ? deal.dealSnapshot.ukefDealId
          : deal.dealSnapshot.details.ukefDealId,
      deal: dealAcbsData,
      facilities: facilityTasks.map(({ result }) => result),
    };
  }
  console.error('No input specified');
});
