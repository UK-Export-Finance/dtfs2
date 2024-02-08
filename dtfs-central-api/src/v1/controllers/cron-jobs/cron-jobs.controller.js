const db = require('../../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../../constants');

exports.deleteAllEstoreLogs = async (req, res) => {
  try {
    const collection = await db.getCollection(DB_COLLECTIONS.CRON_JOB_LOGS);
    // delete all documents from `cron-job-logs` collection
    await collection.deleteMany({});

    return res.status(200).send();
  } catch (error) {
    console.error('CRON job error %o', error);

    return res.status(500).send({
      error: 'An exception has occurred',
    });
  }
};
