import { Collection, DeleteResult, UpdateResult, WithoutId } from 'mongodb';
import { ReportFilter, ReportFilterWithBankId, ReportFilterWithReportId, UpdateUtilisationReportStatusInstructions } from '../../../types/utilisation-reports';
import { UploadedByUserDetails, UtilisationReport } from '../../../types/db-models/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../constants';
import { DB_COLLECTIONS } from '../../../constants/db-collections';
import db from '../../../drivers/db-client';
import { getBankNameById } from '../banks-repo';

type PlaceholderUtilisationReport = Omit<UtilisationReport, '_id' | 'status'>;

const setReportAsCompleted = (utilisationReportsCollection: Collection<WithoutId<UtilisationReport>>, filter: ReportFilterWithReportId) =>
  utilisationReportsCollection.updateOne(filter, {
    $set: {
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
    },
  });

const createReportAndSetAsCompleted = async (
  utilisationReportsCollection: Collection<WithoutId<UtilisationReport>>,
  filter: ReportFilterWithBankId,
  uploadedByUserDetails: UploadedByUserDetails,
) => {
  const { month, year, 'bank.id': bankId } = filter;

  const bankName = await getBankNameById(bankId);
  if (!bankName) {
    throw new Error(`Bank with id ${bankId} does not exist`);
  }

  const statusToSet = UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED;
  const placeholderUtilisationReport: PlaceholderUtilisationReport = {
    month,
    year,
    bank: {
      id: bankId,
      name: bankName,
    },
    azureFileInfo: null,
    uploadedBy: uploadedByUserDetails,
    dateUploaded: new Date(),
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

const setToPendingReconciliationOrDeleteReport = async (
  utilisationReportsCollection: Collection<WithoutId<UtilisationReport>>,
  filter: ReportFilter,
): Promise<UpdateResult | DeleteResult> => {
  const report = await utilisationReportsCollection.findOne(filter);
  if (!report) {
    throw new Error(
      `Cannot set report to '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}': report does not exist`,
    );
  }

  if (!report.azureFileInfo) {
    return utilisationReportsCollection.deleteOne(filter);
  }

  return utilisationReportsCollection.updateOne(filter, {
    $set: {
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
    },
  });
};

export const updateManyUtilisationReportStatuses = async (
  updateInstructions: UpdateUtilisationReportStatusInstructions[],
  uploadedByUserDetails: UploadedByUserDetails,
) => {
  const utilisationReportsCollection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);

  const statusUpdates: Promise<UpdateResult | DeleteResult>[] = updateInstructions.map((updateInstruction) => {
    const { status, filter } = updateInstruction;
    switch (status) {
      case UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED:
        if ('_id' in filter) {
          return setReportAsCompleted(utilisationReportsCollection, filter);
        }
        return createReportAndSetAsCompleted(utilisationReportsCollection, filter, uploadedByUserDetails);
      case UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION:
        return setToPendingReconciliationOrDeleteReport(utilisationReportsCollection, filter);
      default:
        throw new Error('Request body supplied does not match required format');
    }
  });

  await Promise.all(statusUpdates);
};
