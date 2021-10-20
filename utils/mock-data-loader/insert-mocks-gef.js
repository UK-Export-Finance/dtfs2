/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */

const bssApi = require('./api');
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

  const allUsers = await bssApi.listUsers();
  const makerUserId = allUsers.find((user) => user.username === 'BANK1_MAKER1')._id;

  console.log('inserting mandatory-criteria-versioned');
  for (const item of MOCKS.MANDATORY_CRITERIA_VERSIONED) {
    await api.createMandatoryCriteriaVersioned(item, token);
  }

  console.log('inserting eligibility-criteria');
  for (const item of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(item, token);
  }

  console.log('inserting application');
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

    // if (index === 1 || index === 2) {
    //   applicationUpdate.eligibility = {
    //     criteria: latestEligibilityCriteria.terms,
    //   };
    // }

    await api.updateApplication(
      application._id,
      applicationUpdate,
      token,
    );
  }

  const application = await api.listApplication(token);

  console.log('update exporter information');
  for (const [index, item] of MOCKS.EXPORTER.entries()) {
    if (index > 0) {
      await api.updateExporter(application[index].exporterId, item, token);
    }
  }

  console.log('inserting and updating facilities information');
  for (const [index, item] of MOCKS.FACILITIES.entries()) {
    // eslint-disable-next-line no-restricted-syntax
    for (const subitem of item) {
      // eslint-disable-next-line no-param-reassign
      subitem.applicationId = application[index]._id;
      const facilty = await api.createFacilities(subitem, token);
      // eslint-disable-next-line no-param-reassign
      delete subitem.applicationId;
      await api.updateFacilities(facilty.details, subitem, token);
    }
  }
};

module.exports = insertMocks;
