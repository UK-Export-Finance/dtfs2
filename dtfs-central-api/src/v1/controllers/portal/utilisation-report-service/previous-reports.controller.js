const db = require('../../../../drivers/db-client');

const getUtilisationReports = async (req, res) => {
  try {
    const { bankId } = req.params;
    console.info(bankId);
    const utilisationReportsCollection = await db.getCollection('utilisation-reports');
    const filteredAndSortedUtilisationReports = await utilisationReportsCollection
      .find({ bankId: { $eq: bankId } })
      .sort({ year: 1, month: 1 })
      .toArray();
    console.info(filteredAndSortedUtilisationReports);
    res.status(200).send(filteredAndSortedUtilisationReports);
  } catch (error) {
    console.error('Unable to get utilisation reports %s', error);
    res.status(500).send({ status: 500, message: 'Failed to get utilisation reports' });
  }
};

module.exports = {
  getUtilisationReports,
};
