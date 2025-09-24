const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { BANK1_MAKER1 } = require('@ukef/dtfs2-common/test-helpers');
const portalApi = require('./api');
const api = require('./gef/api');
const MOCKS = require('./gef');
const { mongoDbClient } = require('../drivers/db-client');

const insertMocks = async (token) => {
  console.info('GEF MCs');
  for (const item of MOCKS.MANDATORY_CRITERIA_VERSIONED) {
    await api.createMandatoryCriteriaVersioned(item, token);
  }

  console.info('GEF ECs');
  for (const item of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(item, token);
  }

  /**
   * Inserts mock entries into the eligibilityCriteriaAmendments collection
   */
  console.info('GEF amendments ECs');
  const eligibilityCriteriaAmendmentsCollection = await mongoDbClient.getCollection(MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA_AMENDMENTS);
  await eligibilityCriteriaAmendmentsCollection.insertMany(MOCKS.ELIGIBILITY_CRITERIA_AMENDMENTS);

  console.info('GEF deals');

  const allUsers = await portalApi.listUsers(token);
  const makerUserId = allUsers.find((user) => user.username === BANK1_MAKER1.username)._id;
  const latestEligibilityCriteria = await api.latestEligibilityCriteria(token);

  const makerToken = await portalApi.loginViaPortal(BANK1_MAKER1);

  for (const deal of MOCKS.APPLICATION) {
    deal.userId = makerUserId;
    const application = await api.createApplication(deal, makerToken);

    const applicationUpdate = {
      submissionType: deal.submissionType,
    };

    applicationUpdate.eligibility = latestEligibilityCriteria;

    await api.updateApplication(application._id, applicationUpdate, makerToken);
  }

  const gefDeals = await api.listDeals(token);

  console.info('GEF facilities');
  for (const [index, item] of MOCKS.FACILITIES.entries()) {
    for (const subitem of item) {
      subitem.dealId = gefDeals[index]._id;
      const facility = await api.createFacilities(subitem, makerToken);
      delete subitem.dealId;
      await api.updateFacilities(facility.details, subitem, makerToken);
    }
  }
};

module.exports = insertMocks;
