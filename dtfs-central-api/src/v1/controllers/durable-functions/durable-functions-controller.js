const db = require('../../../drivers/db-client');

exports.deleteAllDurableFunctions = async (req, res) => {
  try {
    const collection = await db.getCollection('durable-functions-log');
    await collection.drop();

    return res.status(200).send();
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
};
