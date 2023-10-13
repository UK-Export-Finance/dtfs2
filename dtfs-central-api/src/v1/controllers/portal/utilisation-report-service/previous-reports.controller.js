const db = require('../../../../drivers/db-client');

const getUtilisationReports = async (req, res) => {
  const { bankId } = req.params;
  try {
    const utilisationReportsCollection = await db.getCollection('utilisation-reports');
    const filteredAndSortedUtilisationReports = await utilisationReportsCollection.aggregate([
      {
        $match: {
          bankId,
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
  }
};

module.exports = {
  getUtilisationReports,
};
