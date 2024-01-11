const axios = require('axios');
const db = require('./drivers/db-client');

const setupChangeStream = async () => {
  console.log('Setting up change stream');
  const database = await db.get();
  console.log('connected to DB');
  const changeStream = database.watch([], { fullDocument: 'updateLookup' });
  console.log('initiliasing changestream');
  changeStream.on('change', async (next) => {
    console.log('a document as been updated');
    console.log(next);
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://uk1-apigw.dm-uk.informaticacloud.com/t/deviics.ukexportfinance.gov.uk/dtfsAuditHub',
        headers: {
          integrationHubItemId: next.documentKey._id,
          integrationHubCollectionName: next.ns.coll,
          integrationHubProcess: 'dtfs',
          'Content-Type': 'application/json',
          Authorization: 'Bearer XXX'
        },
        data: next.fullDocument,
      });
      console.log(response.status);
    } catch (e) {
      console.log('Error sending change stream update to API', e?.response?.status);
    }
  });
  console.log('Change stream setup');
  return 'x';
};

module.exports = {
  setupChangeStream,
};
