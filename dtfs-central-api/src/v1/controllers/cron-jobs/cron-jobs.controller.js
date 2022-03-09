const db = require('../../../drivers/db-client');

exports.deleteAllEstoreLogs = async (req, res) => {
  try {
    const collection = await db.getCollection('cron-job-logs');
    // delete all documents from `cron-job-logs` collection
    await collection.deleteMany({});

    return res.status(200).send();
  } catch (error) {
    return res.status(500).send(error);
  }
};
