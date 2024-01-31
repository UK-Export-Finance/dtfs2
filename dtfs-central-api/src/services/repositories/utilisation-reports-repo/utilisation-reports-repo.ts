import { ObjectId, OptionalId } from 'mongodb';
import sortBy from 'lodash/sortBy';
import db from '../../../drivers/db-client';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, DB_COLLECTIONS } from '../../../constants';
import { AzureFileInfo } from '../../../types/azure-file-info';
import { UtilisationReport } from '../../../types/db-models/utilisation-reports';
import { PortalSessionUser } from '../../../types/portal/portal-session-user';
import { ReportPeriod } from '../../../types/utilisation-reports';
import { MonthAndYear } from '../../../types/date';
import { SessionBank } from '../../../types/session-bank';

export const saveUtilisationReportDetails = async (reportPeriod: ReportPeriod, azureFileInfo: AzureFileInfo, uploadedByUser: PortalSessionUser) => {
  const utilisationReportInfo: OptionalId<UtilisationReport> = {
    bank: {
      id: uploadedByUser.bank.id,
      name: uploadedByUser.bank.name,
    },
    reportPeriod,
    dateUploaded: new Date(),
    azureFileInfo,
    status: 'PENDING_RECONCILIATION',
    uploadedBy: {
      id: uploadedByUser._id.toString(),
      firstname: uploadedByUser.firstname,
      surname: uploadedByUser.surname,
    },
  };

  const filterForReportInReportPeriod = {
    'reportPeriod.start.month': reportPeriod.start.month,
    'reportPeriod.start.year': reportPeriod.start.year,
    'reportPeriod.end.month': reportPeriod.end.month,
    'reportPeriod.end.year': reportPeriod.end.year,
  };

  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const updatedResult = await utilisationReportDetailsCollection.updateOne(filterForReportInReportPeriod, utilisationReportInfo);
  return { reportId: updatedResult.upsertedId.toString(), dateUploaded: utilisationReportInfo.dateUploaded };
};

export const saveNotReceivedUtilisationReport = async (reportPeriod: ReportPeriod, bank: SessionBank) => {
  const utilisationReportInfo: OptionalId<UtilisationReport> = {
    bank,
    reportPeriod,
    azureFileInfo: null,
    status: 'REPORT_NOT_RECEIVED',
  };

  const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await utilisationReportsCollection.insertOne(utilisationReportInfo);
};

export const getUtilisationReportDetailsByBankIdMonthAndYear = async (bankId: string, month: number, year: number): Promise<UtilisationReport | null> => {
  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await utilisationReportDetailsCollection.findOne({ 'bank.id': bankId, 'reportPeriod.start.month': month, 'reportPeriod.start.year': year });
};

export const getUtilisationReportDetailsByBankId = async (bankId: string): Promise<UtilisationReport[]> => {
  const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const filteredUtilisationReports: UtilisationReport[] = await utilisationReportsCollection.find({ 'bank.id': { $eq: bankId } }).toArray();
  return sortBy(filteredUtilisationReports, ['reportPeriod.start.year', 'reportPeriod.start.month']);
};

export const getUtilisationReportDetailsById = async (_id: string): Promise<UtilisationReport | null> => {
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await collection.findOne({ _id: new ObjectId(_id) });
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
              $and: [{ year: { $eq: reportPeriodStart.year } }, { month: { $lt: reportPeriodStart.month } }],
            },
          ],
        },
      ],
    })
    .toArray();
};

export const getUtilisationReportDetailsByBankIdAndReportPeriod = async (bankId: string, reportPeriod: ReportPeriod): Promise<UtilisationReport | null> => {
  const collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await collection.findOne({
    'bank.id': bankId,
    'reportPeriod.start.month': reportPeriod.start.month,
    'reportPeriod.start.year': reportPeriod.start.year,
    'reportPeriod.end.month': reportPeriod.end.month,
    'reportPeriod.end.year': reportPeriod.end.year,
  });
};
