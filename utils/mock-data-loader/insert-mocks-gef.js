const portalApi = require('./api');
const api = require('./gef/api');
const MOCKS = require('./gef');
const { BANK1_MAKER1 } = require('./portal/users');
const { logger } = require('./helpers/logger.helper');

const insertMocks = async (token) => {
  logger.info('inserting GEF mocks');
  logger.info('inserting GEF mandatory-criteria-versioned', { depth: 1 });
  for (const item of MOCKS.MANDATORY_CRITERIA_VERSIONED) {
    await api.createMandatoryCriteriaVersioned(item, token);
  }

  logger.info('inserting GEF eligibility-criteria', { depth: 1 });
  for (const item of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(item, token);
  }

  logger.info('inserting GEF deals', { depth: 1 });

  const allUsers = await portalApi.listUsers(token);
  const makerUserId = allUsers.find((user) => user.username === BANK1_MAKER1.username)._id;
  const latestEligibilityCriteria = await api.latestEligibilityCriteria(token);

  // eslint-disable-next-line no-unused-vars
  for (const [index, item] of MOCKS.APPLICATION.entries()) {
    item.userId = makerUserId;
    const application = await api.createApplication(item, token);

    const applicationUpdate = {
      submissionType: item.submissionType,
    };

    applicationUpdate.eligibility = latestEligibilityCriteria;

    await api.updateApplication(application._id, applicationUpdate, token);
  }

  const gefDeals = await api.listDeals(token);

  logger.info('inserting and updating GEF facilities', { depth: 1 });
  for (const [index, item] of MOCKS.FACILITIES.entries()) {
    // eslint-disable-next-line no-restricted-syntax
    for (const subitem of item) {
      // eslint-disable-next-line no-param-reassign
      subitem.dealId = gefDeals[index]._id;
      const facility = await api.createFacilities(subitem, token);
      // eslint-disable-next-line no-param-reassign
      delete subitem.dealId;
      await api.updateFacilities(facility.details, subitem, token);
    }
  }
};

module.exports = insertMocks;
