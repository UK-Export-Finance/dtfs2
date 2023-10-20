const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants/db_collections');

const saveUtilisationReportDetails = async (bank, month, year, csvFilePath, uploadedUser) => {
  const utilisationReportInfo = {
    bank: {
      id: bank.Id,
      name: bank.name,
    },
    month,
    year,
    dateUploaded: new Date(),
    path: csvFilePath,
    uploadedBy: {
      id: uploadedUser.id,
      name: uploadedUser.name,
    },
  };

  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS)
  return utilisationReportDetailsCollection.insert(utilisationReportInfo);
};

module.exports = { saveUtilisationReportDetails };
