const sortBy = require('lodash/sortBy');
const { ObjectId } = require('mongodb');
const db = require('../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../constants/dbCollections');

/**
 * @typedef {object} AzureFileInfo
 * @property {string} folder - folder description
 * @property {string} filename - name of the file
 * @property {string} fullPath - full path of the file in Azure File Storage
 * @property {string} url - URL string pointing to Azure Storage file
 * @property {string} mimetype - the nature and format of the file
 */

/**
 * Saves the utilisation report details but not data to the database.
 * @param {number} month - Month of utilisation report, integer between 1 and 12.
 * @param {number} year - Year of utilisation report, integer greater than 2020.
 * @param {AzureFileInfo} azureFileInfo - Azure storage details for csv file.
 * @param {object} uploadedByUser - Object representing the user who uploaded the report.
 * @returns {Promise<{ reportId: string, dateUploaded: Date }>}
 */
const saveUtilisationReportDetails = async (month, year, azureFileInfo, uploadedByUser) => {
  const utilisationReportInfo = {
    bank: {
      id: uploadedByUser.bank?.id,
      name: uploadedByUser.bank?.name,
    },
    month: Number(month),
    year: Number(year),
    dateUploaded: new Date(),
    azureFileInfo,
    uploadedBy: {
      id: uploadedByUser._id,
      firstname: uploadedByUser.firstname,
      surname: uploadedByUser.surname,
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
const getUtilisationReportDetailsByBankId = async (bankId) => {
  const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const filteredUtilisationReports = await utilisationReportsCollection.find({ 'bank.id': { $eq: bankId } }).toArray();

  return sortBy(filteredUtilisationReports, ['year', 'month']);
};

/**
 * Gets the utilisation report details for the specific MongoDB ID
 * @param {string} _id - The Mongo ID of the required report
 * @returns {object | null} - Utilisation report details with the specified ID or null if it doesn't exist.
 */
const getUtilisationReportDetailsById = async (_id) => {
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return collection.findOne({ _id: ObjectId(_id) });
};

module.exports = {
  saveUtilisationReportDetails,
  getUtilisationReportDetailsForMonthAndYear,
  getUtilisationReportDetailsByBankId,
  getUtilisationReportDetailsById,
};
