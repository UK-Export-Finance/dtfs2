const db = require('../../../database/mongo-client');

exports.deleteCronJobLogs = async (req, res) => {
  try {
    const collection = await db.getCollection('cron-job-logs');
    await collection.deleteMany({});

    return res.status(200).send();
  } catch (error) {
    return res.status(500).send(error);
  }
};
