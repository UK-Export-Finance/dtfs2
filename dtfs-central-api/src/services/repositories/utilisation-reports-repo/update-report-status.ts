import { Collection, DeleteResult, UpdateResult, WithoutId } from 'mongodb';
import { UpdateUtilisationReportStatusInstructions } from '../../../types/utilisation-reports';
import { UploadedByUserDetails, UtilisationReport } from '../../../types/db-models/utilisation-reports';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../constants';
import { DB_COLLECTIONS } from '../../../constants/db-collections';
import db from '../../../drivers/db-client';

type ReportFilter = UpdateUtilisationReportStatusInstructions['filter'];

const setReportAsCompleted = (
  utilisationReportsCollection: Collection<WithoutId<UtilisationReport>>,
  filter: ReportFilter,
  uploadedByUserDetails: UploadedByUserDetails,
) =>
  utilisationReportsCollection.updateOne(filter, {
    $set: {
      status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
      uploadedBy: uploadedByUserDetails,
    },
  });

const setToPendingReconciliationOrReportNotReceived = async (
  utilisationReportsCollection: Collection<WithoutId<UtilisationReport>>,
  filter: ReportFilter,
): Promise<UpdateResult | DeleteResult> => {
  const report = await utilisationReportsCollection.findOne(filter);
  if (!report) {
    throw new Error(`Cannot set report to '${UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION}': report does not exist`);
  }

  if (!report.azureFileInfo) {
    return utilisationReportsCollection.updateOne(filter, {
      $set: {
        status: 'REPORT_NOT_RECEIVED',
      },
    });
  }

  return utilisationReportsCollection.updateOne(filter, {
    $set: {
      status: 'PENDING_RECONCILIATION',
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
        return setReportAsCompleted(utilisationReportsCollection, filter, uploadedByUserDetails);
      case UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION:
        return setToPendingReconciliationOrReportNotReceived(utilisationReportsCollection, filter);
      default:
        throw new Error('Request body supplied does not match required format');
    }
  });

  await Promise.all(statusUpdates);
};
