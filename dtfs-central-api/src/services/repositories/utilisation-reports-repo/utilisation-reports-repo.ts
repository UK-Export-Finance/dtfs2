import { ObjectId, OptionalId } from 'mongodb';
import sortBy from 'lodash/sortBy';
import db from '../../../drivers/db-client';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, DB_COLLECTIONS } from '../../../constants';
import { AzureFileInfo } from '../../../types/azure-file-info';
import { UtilisationReport } from '../../../types/db-models/utilisation-reports';
import { PortalSessionUser } from '../../../types/portal/portal-session-user';
import { ReportPeriod } from '../../../types/utilisation-reports';
import { MonthAndYear } from '../../../types/date';

export const saveUtilisationReportDetails = async (reportPeriod: ReportPeriod, azureFileInfo: AzureFileInfo, uploadedByUser: PortalSessionUser) => {
  const utilisationReportInfo: OptionalId<UtilisationReport> = {
    bank: {
      id: uploadedByUser.bank.id,
      name: uploadedByUser.bank.name,
    },
    reportPeriod,
    dateUploaded: new Date(),
    azureFileInfo,
    status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
    uploadedBy: {
      id: uploadedByUser._id.toString(),
      firstname: uploadedByUser.firstname,
      surname: uploadedByUser.surname,
    },
  };

  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const savedDetails = await utilisationReportDetailsCollection.insertOne(utilisationReportInfo);
  return { reportId: savedDetails.insertedId.toString(), dateUploaded: utilisationReportInfo.dateUploaded };
};

export const getUtilisationReportDetailsByBankIdMonthAndYear = async (bankId: string, month: number, year: number): Promise<UtilisationReport | null> => {
  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await utilisationReportDetailsCollection.findOne({
    'bank.id': { $eq: bankId },
    'reportPeriod.start.month': { $eq: month },
    'reportPeriod.start.year': { $eq: year },
  });
};

export const getUtilisationReportDetailsByBankId = async (bankId: string): Promise<UtilisationReport[]> => {
  const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const filteredUtilisationReports: UtilisationReport[] = await utilisationReportsCollection.find({ 'bank.id': { $eq: bankId } }).toArray();
  return sortBy(filteredUtilisationReports, ['reportPeriod.start.year', 'reportPeriod.start.month']);
};

export const getUtilisationReportDetailsById = async (_id: string): Promise<UtilisationReport | null> => {
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await collection.findOne({ _id: { $eq: new ObjectId(_id) } });
};

export const getOpenReportsBeforeReportPeriodForBankId = async (reportPeriodStart: MonthAndYear, bankId: string): Promise<UtilisationReport[]> => {
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);

  return await collection
    .find({
      $and: [
        { 'bank.id': { $eq: bankId } },
        { status: { $ne: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED } },
        {
          $or: [
            { year: { $lt: reportPeriodStart.year } },
            {
              $and: [
                { year: { $eq: reportPeriodStart.year } },
                { month: { $lt: reportPeriodStart.month } }
              ],
            },
          ],
        },
      ],
    })
    .toArray();
};
