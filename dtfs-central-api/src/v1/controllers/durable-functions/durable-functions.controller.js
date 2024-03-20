const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const db = require('../../../drivers/db-client').default;

exports.deleteAllDurableFunctions = async (req, res) => {
  try {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.DURABLE_FUNCTIONS_LOG);
    // delete all documents from `durable-functions-log` collection
    await collection.deleteMany({});

    return res.status(200).send();
  } catch (error) {
    console.error('ACBS DOF error %s', error);

    return res.status(500).send({
      error: 'An exception has occurred',
    });
  }
};
