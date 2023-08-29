const db = require('../../../drivers/db-client');

exports.deleteAllDurableFunctions = async (req, res) => {
  try {
    const collection = await db.getCollection('durable-functions-log');
    // delete all documents from `durable-functions-log` collection
    await collection.deleteMany({});

    return res.status(200).send();
  } catch (error) {
    console.error('ACBS DOF error %s', error);

    return res.status(500).send({
      error: 'An exception has occured',
    });
  }
};
