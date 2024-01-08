const sortBy = require('lodash/sortBy');
const { ObjectId } = require('mongodb');
const db = require('../../../drivers/db-client');
const { DB_COLLECTIONS } = require('../../../constants/db-collections');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');

/**
 * @typedef {import('mongodb').OptionalId} OptionalId
 * @typedef {import('../../../types/db-models/utilisation-reports').UtilisationReport} UtilisationReport
 * @typedef {import('../../../types/azure-file-info').AzureFileInfo} AzureFileInfo
 * @typedef {import('../../../types/utilisation-reports').ReportPeriodStart} ReportPeriodStart
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
  /** @type {OptionalId<UtilisationReport>} */
  const utilisationReportInfo = {
    bank: {
      id: uploadedByUser.bank?.id,
      name: uploadedByUser.bank?.name,
    },
    month: Number(month),
    year: Number(year),
    dateUploaded: new Date(),
    azureFileInfo,
    status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
    uploadedBy: {
      id: uploadedByUser._id,
      firstname: uploadedByUser.firstname,
      surname: uploadedByUser.surname,
    },
  };

  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const savedDetails = await utilisationReportDetailsCollection.insertOne(utilisationReportInfo);
  return { reportId: savedDetails.insertedId.toString(), dateUploaded: utilisationReportInfo.dateUploaded };
};

/**
 * Gets a single utilisation report (not data) by bank ID, month (1-indexed) and year
 * @param {string} bankId - ID of the bank.
 * @param {number} month - Month of utilisation report reporting period
 * @param {number} year - Year of utilisation report reporting period
 * @returns {Promise<UtilisationReport | null>} - Utilisation report details matching the bank/month/year combo or null if it doesn't exist.
 */
const getUtilisationReportDetailsByBankIdMonthAndYear = async (bankId, month, year) => {
  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await utilisationReportDetailsCollection.findOne({ 'bank.id': bankId, month, year });
};

/**
 * Gets the utilisation reports (not data) by bank ID from the database
 * @param {string} bankId - ID of bank from user
 * @returns {Promise<UtilisationReport[]>} - list of reports from the database, filtered by bank ID and sorted by
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
 * @returns {Promise<UtilisationReport | null>} - Utilisation report details with the specified ID or null if it doesn't exist.
 */
const getUtilisationReportDetailsById = async (_id) => {
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await collection.findOne({ _id: new ObjectId(_id) });
};

/**
 * Gets all open utilisation reports (those with a status that is not
 * `RECONCILIATION_COMPLETED`), with a report period before the given
 * `reportPeriod` and for the given `bankId`
 * @param {ReportPeriodStart} reportPeriodStart
 * @param {string} bankId
 * @returns {Promise<UtilisationReport[]>}
 */
const getOpenReportsBeforeReportPeriodForBankId = async (reportPeriodStart, bankId) => {
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);

  return await collection
    .aggregate([
      {
        $match: {
          $and: [
            {
              bankId: { $eq: bankId },
            },
            {
              status: { $ne: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED },
            },
            {
              $or: [
                {
                  year: { $lt: reportPeriodStart.year },
                },
                {
                  $and: [
                    {
                      year: { $eq: reportPeriodStart.year },
                    },
                    {
                      month: { $lt: reportPeriodStart.month },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    ])
    .toArray();
};

module.exports = {
  saveUtilisationReportDetails,
  getUtilisationReportDetailsByBankIdMonthAndYear,
  getUtilisationReportDetailsByBankId,
  getUtilisationReportDetailsById,
  getOpenReportsBeforeReportPeriodForBankId,
};
