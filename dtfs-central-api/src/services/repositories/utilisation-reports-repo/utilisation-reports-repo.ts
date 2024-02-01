import { Filter, InsertOneResult, ObjectId, OptionalId } from 'mongodb';
import sortBy from 'lodash/sortBy';
import db from '../../../drivers/db-client';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, DB_COLLECTIONS } from '../../../constants';
import { AzureFileInfo } from '../../../types/azure-file-info';
import { UtilisationReport } from '../../../types/db-models/utilisation-reports';
import { PortalSessionUser } from '../../../types/portal/portal-session-user';
import { ReportPeriod } from '../../../types/utilisation-reports';
import { MonthAndYear } from '../../../types/date';
import { SessionBank } from '../../../types/session-bank';

export const saveUtilisationReportDetails = async (
  reportId: ObjectId,
  reportPeriod: ReportPeriod,
  azureFileInfo: AzureFileInfo,
  uploadedByUser: PortalSessionUser,
) => {
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

  const utilisationReportDetailsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  await utilisationReportDetailsCollection.updateOne(
    {
      _id: { $eq: reportId },
      reportPeriod: { $eq: reportPeriod },
    },
    { $set: utilisationReportInfo },
  );

  return { reportId, dateUploaded: utilisationReportInfo.dateUploaded };
};

/**
 * Saves the inputted utilisation report with the inputted bank in the not received state
 * @param reportPeriod - The report period
 * @param bank - The bank
 * @returns The result of the document insertion
 */
export const saveNotReceivedUtilisationReport = async (reportPeriod: ReportPeriod, bank: SessionBank): Promise<InsertOneResult<UtilisationReport>> => {
  const utilisationReportInfo: OptionalId<UtilisationReport> = {
    bank,
    reportPeriod,
    azureFileInfo: null,
    status: 'REPORT_NOT_RECEIVED',
  };

  const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  return await utilisationReportsCollection.insertOne(utilisationReportInfo);
};

export type GetUtilisationReportDetailsOptions = {
  reportPeriod?: UtilisationReport['reportPeriod'];
  reportStatuses?: UtilisationReport['status'][];
};

/**
 * Gets the utilisation report collection filter from the passed in options
 * @param opts - The options
 * @returns The utilisation report collection filter
 */
const getUtilisationReportDetailsFilterFromOptions = (opts: GetUtilisationReportDetailsOptions | undefined): Filter<UtilisationReport> => {
  if (!opts) {
    return {};
  }

  const utilisationReportDetailsFilter: Filter<UtilisationReport> = {};
  if (opts.reportPeriod) {
    utilisationReportDetailsFilter.reportPeriod = { $eq: opts.reportPeriod };
  }
  if (opts.reportStatuses) {
    utilisationReportDetailsFilter.status = { $in: opts.reportStatuses };
  }
  return utilisationReportDetailsFilter;
};

/**
 * Gets a utilisation report by bank id
 * @param bankId - The bank id
 * @returns The found bank reports (`null` if not found)
 */
export const getOneUtilisationReportDetailsByBankId = async (bankId: string, opts?: GetUtilisationReportDetailsOptions): Promise<UtilisationReport | null> => {
  const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const utilisationReportDetailsFilter: Filter<UtilisationReport> = {
    'bank.id': { $eq: bankId },
    ...getUtilisationReportDetailsFilterFromOptions(opts),
  };
  return await utilisationReportsCollection.findOne(utilisationReportDetailsFilter);
};

/**
 * Gets utilisation reports by bank id
 * @param bankId - The bank id
 * @returns The found bank reports (`[]` if none found)
 */
export const getManyUtilisationReportDetailsByBankId = async (bankId: string, opts?: GetUtilisationReportDetailsOptions): Promise<UtilisationReport[]> => {
  const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);
  const utilisationReportDetailsFilter: Filter<UtilisationReport> = {
    'bank.id': { $eq: bankId },
    ...getUtilisationReportDetailsFilterFromOptions(opts),
  };
  const filteredUtilisationReports: UtilisationReport[] = await utilisationReportsCollection.find(utilisationReportDetailsFilter).toArray();
  return sortBy(filteredUtilisationReports, ['reportPeriod.start.year', 'reportPeriod.start.month']);
};

/**
 * Gets utilisation reports by utilisation report id
 * @param _id - The utilisation report id
 * @returns The found bank report (`null` if not found)
 */
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
            { 'reportPeriod.start.year': { $lt: reportPeriodStart.year } },
            {
              $and: [{ 'reportPeriod.start.year': { $eq: reportPeriodStart.year } }, { 'reportPeriod.start.month': { $lt: reportPeriodStart.month } }],
            },
          ],
        },
      ],
    })
    .toArray();
};
