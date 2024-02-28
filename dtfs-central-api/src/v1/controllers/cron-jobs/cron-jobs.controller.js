const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const db = require('../../../drivers/db-client').default;

exports.deleteAllEstoreLogs = async (req, res) => {
  try {
    const collection = await db.getCollection(MONGO_DB_COLLECTIONS.CRON_JOB_LOGS);
    // delete all documents from `cron-job-logs` collection
    await collection.deleteMany({});

    return res.status(200).send();
  } catch (error) {
    console.error('CRON job error %s', error);

    return res.status(500).send({
      error: 'An exception has occurred',
    });
  }
};
