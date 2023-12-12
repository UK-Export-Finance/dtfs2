import { Collection, DeleteResult, UpdateResult } from 'mongodb';
import {
  ReportFilter,
  ReportFilterWithBankId,
  ReportFilterWithReportId,
  UpdateUtilisationReportStatusInstructions,
} from '../../../types/utilisation-reports';
import { UploadedByUserDetails, UtilisationReport } from '../../../types/db-models/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../constants';
import { DB_COLLECTIONS } from '../../../constants/dbCollections';
import db from '../../../drivers/db-client';
import { getBankNameById } from '../banks-repo';

const setReportAsCompleted = (utilisationReportsCollection: Collection, filter: ReportFilterWithReportId) =>
  utilisationReportsCollection.updateOne(filter, {
    $set: {
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
    },
  });

const createReportAndSetAsCompleted = async (
  utilisationReportsCollection: Collection,
  filter: ReportFilterWithBankId,
  uploadedByUserDetails: UploadedByUserDetails,
) => {
  const { month, year, 'bank.id': bankId } = filter;

  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new Error(`Bank with id ${bankId} does not exist`);
  }

  const statusToSet = UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED;
  const placeholderUtilisationReport: Omit<UtilisationReport, '_id'> = {
    month,
    year,
    bank: {
      id: bankId,
      name: bankName,
    },
    azureFileInfo: null,
    uploadedBy: uploadedByUserDetails,
    dateUploaded: new Date(),
    status: statusToSet,
  };

  return utilisationReportsCollection.updateOne(
    filter,
    {
      $set: {
        status: statusToSet,
      },
      $setOnInsert: placeholderUtilisationReport,
    },
    { upsert: true },
  );
};

const setToNotReceivedOrDeleteReport = async (utilisationReportsCollection: Collection, filter: ReportFilter): Promise<UpdateResult | DeleteResult> => {
  const report = await utilisationReportsCollection.findOne(filter);
  if (!report) {
    throw new Error("Cannot set report to 'NOT_RECEIVED': report does not exist");
  }

  if (!report.azureFileInfo) {
    return utilisationReportsCollection.deleteOne(filter);
  }

  return utilisationReportsCollection.updateOne(filter, {
    $set: {
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
    },
  });
};

export const updateManyUtilisationReportStatuses = async (
  updateInstructions: UpdateUtilisationReportStatusInstructions[],
  uploadedByUserDetails: UploadedByUserDetails,
) => {
  const utilisationReportsCollection: Collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);

  const statusUpdates: Promise<UpdateResult | DeleteResult>[] = updateInstructions.map((updateInstruction) => {
    const { status, filter } = updateInstruction;
    switch (status) {
      case UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED:
        if ('_id' in filter) {
          return setReportAsCompleted(utilisationReportsCollection, filter);
        }
        return createReportAndSetAsCompleted(utilisationReportsCollection, filter, uploadedByUserDetails);
      case UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED:
        return setToNotReceivedOrDeleteReport(utilisationReportsCollection, filter);
      default:
        throw new Error('Request body supplied does not match required format');
    }
  });

  await Promise.all(statusUpdates);
};
