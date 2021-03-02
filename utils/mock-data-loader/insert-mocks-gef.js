/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */

const api = require('./gef/api');
const MOCKS = require('./mocks/gef');

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
  MOCKS.MANDATORY_CRITERIA_VERSIONED.forEach(async (item) => {
    await api.createMandatoryCriteriaVersioned(item, token);
  });

  console.log('inserting application');
  for (data of MOCKS.APPLICATION) {
    await api.createApplication(data, token);
  }

  const application = await api.listApplication(token);

  console.log('update exporter information');
  MOCKS.EXPORTER.forEach(async (item, index) => {
    await api.updateExporter(application[index].exporterId, item, token);
  });

  console.log('inserting and updating facilities information');
  await MOCKS.FACILITIES.forEach(async (item) => {
    await item.forEach(async (subitem, index) => {
      // eslint-disable-next-line no-param-reassign
      subitem.applicationId = application[index]._id;
      const facilty = await api.createFacilities(subitem, token);
      await api.updateFacilities(facilty, subitem, token);
    });
  });

  // console.log('facilitiesfacilities', facilities);

  // console.log('updating facilities information');
  // await MOCKS.FACILITIES.forEach(async (item) => {
  //   await item.forEach(async (subitem, index) => {
  //     await api.updateFacilities(facilities[index], subitem, token);
  //   });
  // });
};

module.exports = insertMocks;
