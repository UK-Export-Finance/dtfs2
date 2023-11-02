const db = require('../../../../drivers/db-client');

const getUtilisationReports = async (req, res) => {
  const { bankId } = req.params;
  try {
    const utilisationReportsCollection = await db.getCollection('utilisation-reports');
    const filteredUtilisationReports = await utilisationReportsCollection
      .find({ bankId: { $eq: bankId } })
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
