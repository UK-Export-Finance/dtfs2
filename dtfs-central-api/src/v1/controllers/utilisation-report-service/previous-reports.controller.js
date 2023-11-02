const db = require('../../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../../constants/dbCollections');

const getUtilisationReports = async (req, res) => {
  try {
    const { bankId } = req.params;

    const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
    const filteredUtilisationReports = await utilisationReportsCollection
      .find({ 'bank.id': { $eq: bankId } })
      .toArray();

    const filteredAndSortedUtilisationReports = filteredUtilisationReports
      .sort((a, b) => a.year - b.year || a.month - b.month);

    res.status(200).send(filteredAndSortedUtilisationReports);
  } catch (error) {
    console.error('Unable to get utilisation reports %s', error);
    res.status(500).send({ status: 500, message: 'Failed to get utilisation reports' });
  }
};

module.exports = {
  getUtilisationReports,
};
