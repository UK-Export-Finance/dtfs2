import { Collection, DeleteResult, ObjectId, UpdateResult, WithoutId } from 'mongodb';
import { UTILISATION_REPORT_RECONCILIATION_STATUS, MONGO_DB_COLLECTIONS, UtilisationReport, UploadedByUserDetails } from '@ukef/dtfs2-common';
import { ReportWithStatus } from '../../types/utilisation-reports';
import db from '../../drivers/db-client';

type ReportFilter = {
  _id: {
    $eq: ObjectId;
  };
};

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

export const updateManyUtilisationReportStatuses = async (reportsWithStatus: ReportWithStatus[], uploadedByUserDetails: UploadedByUserDetails) => {
  const utilisationReportsCollection = await db.getCollection(MONGO_DB_COLLECTIONS.UTILISATION_REPORTS);

  const statusUpdates: Promise<UpdateResult | DeleteResult>[] = reportsWithStatus.map((reportWithStatus) => {
    const { status, reportId } = reportWithStatus;
    const filter: ReportFilter = {
      _id: {
        $eq: new ObjectId(reportId),
      },
    };

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
