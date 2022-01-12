const db = require('../../../drivers/db-client');

exports.deleteAllDurableFunctions = async (req, res) => {
  try {
    const collection = await db.getCollection('durable-functions-log');
    await collection.remove();

    res.status(200).send();
  } catch (error) {
    res.status(210).send(error);
  }
};
