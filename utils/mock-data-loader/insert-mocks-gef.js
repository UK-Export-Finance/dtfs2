/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */

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
  });

  console.log('inserting mandatory-criteria-versioned');
  for (const item of MOCKS.MANDATORY_CRITERIA_VERSIONED) {
    await api.createMandatoryCriteriaVersioned(item, token);
  }

  console.log('inserting eligibility-criteria');
  for (const item of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(item, token);
  }

  console.log('inserting application');
  for (const item of MOCKS.APPLICATION) {
    await api.createApplication(item, token);
  }

  const applications = await api.listApplication(token);

  console.log('update exporter information');

  for (const application of applications) {
    await api.updateExporter(application.exporterId, MOCKS.EXPORTER[0], token);
  }

  console.log('inserting and updating facilities information');
  for (const [index, item] of MOCKS.FACILITIES.entries()) {
    // eslint-disable-next-line no-restricted-syntax
    for (const subitem of item) {
      // eslint-disable-next-line no-param-reassign
      subitem.applicationId = applications[index]._id;
      const facilty = await api.createFacilities(subitem, token);
      // eslint-disable-next-line no-param-reassign
      delete subitem.applicationId;
      await api.updateFacilities(facilty.details, subitem, token);
    }
  }

  console.log('updating cover terms information');
  for (const [index, item] of MOCKS.COVER_TERMS.entries()) {
    if (index > 0) {
      await api.updateCoverTerms(applications[index].coverTermsId, item, token);
    }
  }
};

module.exports = insertMocks;
