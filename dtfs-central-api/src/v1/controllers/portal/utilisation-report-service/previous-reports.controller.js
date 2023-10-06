const db = require('../../../../drivers/db-client');

const getUtilisationReports = async (req, res) => {
  const { bankId } = req.params;
  
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
  if (filteredAndSortedUtilisationReports) {
    return res.status(200).send(filteredAndSortedUtilisationReports);
  } 
  return res.status(404).send({ status: 404, message: 'No utilisation reports found' });
};

module.exports = {
  getUtilisationReports,
}