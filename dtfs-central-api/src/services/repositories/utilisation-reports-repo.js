const sortBy = require('lodash/sortBy');
const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants/dbCollections');

/**
 * Saves the utilisation report details but not data to the database.
 * @param {number} month - Month of utilisation report, integer between 1 and 12.
 * @param {number} year - Year of utilisation report, integer greater than 2020.
 * @param {String} csvFilePath - Path to the csv file.
 * @param {Object} uploadedByUser - Object representing the user who uploaded the report.
 * @returns {Object} - Object containing reportId and dateUploaded.
 */
const saveUtilisationReportDetails = async (month, year, csvFilePath, uploadedByUser) => {
  const utilisationReportInfo = {
    bank: {
      id: uploadedByUser.bank?.id,
      name: uploadedByUser.bank?.name,
    },
    month: Number(month),
    year: Number(year),
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

/**
 * Saves the utilisation report details but not data to the database.
 * @param {string} bankId - Id of the bank.
 * @param {number} month - Month of utilisation report.
 * @param {number} year - Year of utilisation report.
 * @returns {Object | null} - Utilisation report details matching the bank/month/year combo or null if it doesn't exist.
 */
const getUtilisationReportDetailsForMonthAndYear = async (bankId, month, year) => {
  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const matchingReportDetails = await utilisationReportDetailsCollection.findOne({ 'bank.id': bankId, month, year });
  return matchingReportDetails;
};

/**
 * Gets the utilisation reports (not data) by bank ID from the database
 * @param {string} bankId - ID of bank from user
 * @returns {Promise<Object[]>} - list of reports from the database, filtered by bank ID and sorted by
 * ascending year and month.
 */
const getUtilisationReportDetails = async (bankId) => {
  const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const filteredUtilisationReports = await utilisationReportsCollection.find({ 'bank.id': { $eq: bankId } }).toArray();

  return sortBy(filteredUtilisationReports, ['year', 'month']);
};

module.exports = {
  saveUtilisationReportDetails,
  getUtilisationReportDetails,
  getUtilisationReportDetailsForMonthAndYear,
};
