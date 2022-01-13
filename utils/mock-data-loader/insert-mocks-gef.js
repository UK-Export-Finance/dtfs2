/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */

const portalApi = require('./api');
const api = require('./gef/api');
const MOCKS = require('./gef');

const tokenFor = require('./temporary-token-handler');

const insertMocks = async () => {
  const token = await tokenFor({
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['maker', 'editor', 'checker', 'data-admin'],
    email: 'maker1@ukexportfinance.gov.uk',
  });

  const allUsers = await portalApi.listUsers();
  const makerUserId = allUsers.find((user) => user.username === 'BANK1_MAKER1')._id;

  console.log('inserting GEF mandatory-criteria-versioned');
  for (const item of MOCKS.MANDATORY_CRITERIA_VERSIONED) {
    await api.createMandatoryCriteriaVersioned(item, token);
  }

  console.log('inserting GEF eligibility-criteria');
  for (const item of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(item, token);
  }

  console.log('inserting GEF deals');
  const latestEligibilityCriteria = MOCKS.ELIGIBILITY_CRITERIA.find((criteria) => criteria.version === 1.5);

  for (const [index, item] of MOCKS.APPLICATION.entries()) {
    item.userId = makerUserId;
    const application = await api.createApplication(item, token);

    const applicationUpdate = {
      submissionType: item.submissionType,
    };

    applicationUpdate.eligibility = {
      criteria: latestEligibilityCriteria.terms,
    };

    await api.updateApplication(
      application._id,
      applicationUpdate,
      token,
    );
  }

  const gefDeals = await api.listDeals(token);

  console.log('inserting and updating GEF facilities');
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
