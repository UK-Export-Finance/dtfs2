const db = require('../../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../../constants/dbCollections')

const getUtilisationReports = async (req, res) => {
  const { bankId } = req.params;
  try {
    const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
    const filteredAndSortedUtilisationReports = await utilisationReportsCollection.aggregate([
      {
        $match: {
          'bank.id': bankId,
        },
      },
      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]).toArray();
    res.status(200).send(filteredAndSortedUtilisationReports);
  } catch (error) {
    console.error('Unable to get utilisation reports %s', error);
    res.status(500).send({ status: 500, message: 'Failed to get utilisation reports' });
  }
};

module.exports = {
  getUtilisationReports,
};
