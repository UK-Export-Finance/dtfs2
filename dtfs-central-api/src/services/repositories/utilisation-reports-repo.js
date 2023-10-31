const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants/db_collections');

/**
 * Saves the utilisation report details but not data to the database.
 * @param {Object} bank - Object representing bank the report belongs to.
 * @param {number} month - Month of utilisation report, integer between 1 and 12.
 * @param {number} year - Year of utilisation report, integer greater than 2020.
 * @param {String} csvFilePath - Path to the csv file.
 * @param {Object} uploadedByUser - Object representing the user who uploaded the report.
 * @returns {Object} - Object containing reportId and dateUploaded.
 */
const saveUtilisationReportDetails = async (bank, month, year, csvFilePath, uploadedByUser) => {
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
      id: uploadedByUser._id,
      name: `${uploadedByUser.firstname} ${uploadedByUser.surname}`,
    },
  };

  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const savedDetails = await utilisationReportDetailsCollection.insertOne(utilisationReportInfo);
  return { reportId: savedDetails?.insertedId?.toString(), dateUploaded: utilisationReportInfo.dateUploaded };
};

module.exports = { saveUtilisationReportDetails };
