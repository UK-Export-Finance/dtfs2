const portalApi = require('./api');
const api = require('./gef/api');
const MOCKS = require('./gef');

const insertMocks = async (token) => {
  console.info('inserting GEF mandatory-criteria-versioned');
  for (const item of MOCKS.MANDATORY_CRITERIA_VERSIONED) {
    await api.createMandatoryCriteriaVersioned(item, token);
  }

  console.info('inserting GEF eligibility-criteria');
  for (const item of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(item, token);
  }

  console.info('inserting GEF deals');

  const allUsers = await portalApi.listUsers(token);
  const makerUserId = allUsers.find((user) => user.username === 'BANK1_MAKER1')._id;
  const latestEligibilityCriteria = await api.latestEligibilityCriteria(token);

  // eslint-disable-next-line no-unused-vars
  for (const [index, item] of MOCKS.APPLICATION.entries()) {
    item.userId = makerUserId;
    const application = await api.createApplication(item, token);

    const applicationUpdate = {
      submissionType: item.submissionType,
    };

    applicationUpdate.eligibility = latestEligibilityCriteria;

    await api.updateApplication(
      application._id,
      applicationUpdate,
      token,
    );
  }

  const gefDeals = await api.listDeals(token);

  console.info('inserting and updating GEF facilities');
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
