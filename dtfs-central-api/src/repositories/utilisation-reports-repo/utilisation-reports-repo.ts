import { Filter, InsertOneResult, ObjectId, OptionalId } from 'mongodb';
import sortBy from 'lodash/sortBy';
import {
  AzureFileInfo,
  UtilisationReport,
  MONGO_DB_COLLECTIONS,
  ReportPeriod,
} from '@ukef/dtfs2-common';
import db from '../../drivers/db-client';
import { PortalSessionUser } from '../../types/portal/portal-session-user';
import { UtilisationReportUploadDetails } from '../../types/utilisation-reports';
import { SessionBank } from '../../types/session-bank';

export const updateUtilisationReportDetailsWithUploadDetails = async (
  existingReport: UtilisationReport,
  azureFileInfo: AzureFileInfo,
  uploadedByUser: PortalSessionUser,
): Promise<{ reportId: string; dateUploaded: Date }> => {
  const utilisationReportInfo: UtilisationReportUploadDetails = {
    dateUploaded: new Date(),
    azureFileInfo,
    status: 'PENDING_RECONCILIATION',
    uploadedBy: {
      id: uploadedByUser._id.toString(),
      firstname: uploadedByUser.firstname,
      surname: uploadedByUser.surname,
    },
  };

  const utilisationReportDetailsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.UTILISATION_REPORTS);
  await utilisationReportDetailsCollection.updateOne(
    {
      _id: { $eq: existingReport._id },
    },
    { $set: utilisationReportInfo },
  );

  return { reportId: existingReport._id.toString(), dateUploaded: utilisationReportInfo.dateUploaded };
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

  const utilisationReportsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.UTILISATION_REPORTS);
  return await utilisationReportsCollection.insertOne(utilisationReportInfo);
};

export type GetUtilisationReportDetailsOptions = {
  reportPeriod?: UtilisationReport['reportPeriod'];
  excludeNotUploaded?: boolean;
};

/**
 * Gets the utilisation report collection filter from the passed in options
 * @param options - The options
 * @returns The utilisation report collection filter
 */
const getUtilisationReportDetailsFilterFromOptions = (options?: GetUtilisationReportDetailsOptions | undefined): Filter<UtilisationReport> => {
  if (!options) {
    return {};
  }

  const utilisationReportDetailsFilter: Filter<UtilisationReport> = {};
  if (options.reportPeriod) {
    utilisationReportDetailsFilter.reportPeriod = { $eq: options.reportPeriod };
  }
  if (options.excludeNotUploaded) {
    utilisationReportDetailsFilter.status = { $not: { $in: ['REPORT_NOT_RECEIVED'] } };
    utilisationReportDetailsFilter.azureFileInfo = { $not: { $eq: null } };
  }
  return utilisationReportDetailsFilter;
};

/**
 * Gets a utilisation report by bank id
 * @param bankId - The bank id
 * @param options - Extra options to filter reports by
 * @returns The found bank reports (`null` if not found)
 */
export const getOneUtilisationReportDetailsByBankId = async (
  bankId: string,
  options?: GetUtilisationReportDetailsOptions,
): Promise<UtilisationReport | null> => {
  const utilisationReportsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.UTILISATION_REPORTS);
  const utilisationReportDetailsFilter: Filter<UtilisationReport> = {
    'bank.id': { $eq: bankId },
    ...getUtilisationReportDetailsFilterFromOptions(options),
  };
  return await utilisationReportsCollection.findOne(utilisationReportDetailsFilter);
};

/**
 * Gets utilisation reports by bank id
 * @param bankId - The bank id
 * @returns The found bank reports (`[]` if none found)
 */
export const getManyUtilisationReportDetailsByBankId = async (bankId: string, options?: GetUtilisationReportDetailsOptions): Promise<UtilisationReport[]> => {
  const utilisationReportsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.UTILISATION_REPORTS);
  const utilisationReportDetailsFilter: Filter<UtilisationReport> = {
    'bank.id': { $eq: bankId },
    ...getUtilisationReportDetailsFilterFromOptions(options),
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
  const collection = await db.getCollection(MONGO_DB_COLLECTIONS.UTILISATION_REPORTS);
  return await collection.findOne({ _id: { $eq: new ObjectId(_id) } });
};
