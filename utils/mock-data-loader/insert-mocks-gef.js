
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
  for (data of MOCKS.MANDATORY_CRITERIA_VERSIONED) {
    await api.createMandatoryCriteriaVersioned(data, token);
  }

  console.log('inserting application');
  for (data of MOCKS.APPLICATION) {
    await api.createApplication(data, token);
  }

  console.log('update exporter information');
  const application = await api.listApplication(token);
  MOCKS.EXPORTER.forEach(async (item, index) => {
    await api.updateExporter(application[index].exporterId, item, token);
  });
};

module.exports = insertMocks;
