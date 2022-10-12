const db = require('../../../database/mongo-client');

exports.deleteAllDurableFunctions = async (req, res) => {
  try {
    const collection = await db.getCollection('durable-functions-log');
    await collection.deleteMany({});

    return res.status(200).send();
  } catch (error) {
    return res.status(500).send(error);
  }
};
