import {
  Collection,
  DeleteResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';
import {
  ReportDetails,
  ReportFilter,
  ReportStatus,
  UtilisationReport,
} from '../../types/utilisation-report-status';
import { TFMUser } from '../../types/users';

const REPORT_STATUS: Record<ReportStatus, ReportStatus> = {
  RECONCILIATION_COMPLETED: 'RECONCILIATION_COMPLETED',
  REPORT_NOT_RECEIVED: 'REPORT_NOT_RECEIVED',
};

const logWarningMessage = (status: ReportStatus) => console.error(`The status '${status}' is not supported by '/v1/utilisation-reports/set-status'`);

const setReportStatusByReportId = (id: string, status: ReportStatus, collection: Collection): Promise<UpdateResult | void> => {
  const filter = { _id: new ObjectId(id) };
  switch (status) {
    case REPORT_STATUS.RECONCILIATION_COMPLETED: {
      return collection.updateOne(filter, {
        $set: {
          status: REPORT_STATUS.RECONCILIATION_COMPLETED,
        },
      });
    }
    case REPORT_STATUS.REPORT_NOT_RECEIVED: {
      return collection.updateOne(filter, {
        $set: {
          status: REPORT_STATUS.REPORT_NOT_RECEIVED,
        },
      });
    }
    default: {
      return new Promise((resolve) => {
        logWarningMessage(status);
        resolve();
      });
    }
  }
};

const createOrSetReportAsReceived = (reportDetails: ReportDetails, user: TFMUser, filter: ReportFilter, collection: Collection): Promise<UpdateResult> => {
  const placeholderUtilisationReport: UtilisationReport = {
    month: reportDetails.month,
    year: reportDetails.year,
    bank: {
      id: reportDetails.bankId,
    },
    azureFileInfo: null,
    uploadedBy: user,
    dateUploaded: new Date(),
  };
  return collection.updateOne(
    filter,
    {
      $set: {
        status: REPORT_STATUS.RECONCILIATION_COMPLETED,
      },
      $setOnInsert: placeholderUtilisationReport,
    },
    { upsert: true },
  );
};

const setToNotReceivedOrDeleteReport = async (filter: ReportFilter, collection: Collection): Promise<UpdateResult | DeleteResult | void> => {
  const report = await collection.findOne(filter);
  if (!report) {
    return new Promise((resolve) => {
      console.error('Report matching supplied filter does not exist');
      resolve();
    });
  }

  if (!report.azureFileInfo) {
    return collection.deleteOne(filter);
  }

  return collection.updateOne(filter, {
    $set: {
      status: REPORT_STATUS.REPORT_NOT_RECEIVED,
    },
  });
};

const setReportStatusByReportDetails = (
  reportDetails: ReportDetails,
  user: TFMUser,
  status: ReportStatus,
  collection: Collection,
): Promise<UpdateResult | DeleteResult | void> => {
  const filter: ReportFilter = {
    month: reportDetails.month,
    year: reportDetails.year,
    'bank.id': reportDetails.bankId,
  };
  switch (status) {
    case REPORT_STATUS.RECONCILIATION_COMPLETED:
      return createOrSetReportAsReceived(reportDetails, user, filter, collection);
    case REPORT_STATUS.REPORT_NOT_RECEIVED:
      return setToNotReceivedOrDeleteReport(filter, collection);
    default:
      return new Promise((resolve) => {
        logWarningMessage(status);
        resolve();
      });
  }
};

export {
  setReportStatusByReportId,
  createOrSetReportAsReceived,
  setToNotReceivedOrDeleteReport,
  setReportStatusByReportDetails,
};
