const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants/db_collections');

const saveUtilisationReportDetails = async (bank, month, year, csvFilePath, uploadedUser) => {
  const utilisationReportInfo = {
    bank: {
      id: bank.id,
      name: bank.name,
    },
    month,
    year,
    dateUploaded: new Date(),
    path: csvFilePath,
    uploadedBy: {
      id: uploadedUser._id,
      name: `${uploadedUser.firstname} ${uploadedUser.surname}`,
    },
  };

  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS)
  const savedDetails = await utilisationReportDetailsCollection.insertOne(utilisationReportInfo);
  return { reportId: savedDetails?.insertedId?.toString(), dateUploaded: utilisationReportInfo.dateUploaded}
};

module.exports = { saveUtilisationReportDetails };
