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
  PlaceholderUtilisationReport,
} from '../../types/utilisation-report-status';

const REPORT_STATUS: Record<ReportStatus, ReportStatus> = {
  PENDING_RECONCILIATION: 'PENDING_RECONCILIATION',
  REPORT_NOT_RECEIVED: 'REPORT_NOT_RECEIVED',
};

const logWarningMessage = (status: ReportStatus) => console.error(`The status '${status}' is not supported by '/v1/utilisation-reports/set-status'`);

const setReportStatusByReportId = (id: string, status: ReportStatus, collection: Collection): Promise<UpdateResult | undefined> => {
  const filter = { _id: new ObjectId(id) };
  switch (status) {
    case REPORT_STATUS.PENDING_RECONCILIATION: {
      return collection.updateOne(filter, {
        $set: {
          status: REPORT_STATUS.PENDING_RECONCILIATION,
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
      return new Promise<undefined>((resolve) => {
        logWarningMessage(status);
        resolve(undefined);
      });
    }
  }
};

const createOrSetReportAsReceived = (reportDetails: ReportDetails, filter: ReportFilter, collection: Collection): Promise<UpdateResult> => {
  const placeholderUtilisationReport: PlaceholderUtilisationReport = {
    month: reportDetails.month,
    year: reportDetails.year,
    bank: {
      id: reportDetails.bankId,
    },
    azureFileInfo: undefined,
  };
  return collection.updateOne(
    filter,
    {
      $set: {
        status: REPORT_STATUS.PENDING_RECONCILIATION,
      },
      $setOnInsert: placeholderUtilisationReport,
    },
    { upsert: true },
  );
};

const setToNotReceivedOrDeleteReport = async (filter: ReportFilter, collection: Collection): Promise<UpdateResult | DeleteResult | undefined> => {
  const report = await collection.findOne(filter);
  if (!report) {
    return new Promise<undefined>((resolve) => {
      console.error('Report matching supplied filter does not exist');
      resolve(undefined);
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
  status: ReportStatus,
  collection: Collection,
): Promise<UpdateResult | DeleteResult | undefined> => {
  const filter: ReportFilter = {
    month: reportDetails.month,
    year: reportDetails.year,
    'bank.id': reportDetails.bankId,
  };
  switch (status) {
    case REPORT_STATUS.PENDING_RECONCILIATION:
      return createOrSetReportAsReceived(reportDetails, filter, collection);
    case REPORT_STATUS.REPORT_NOT_RECEIVED:
      return setToNotReceivedOrDeleteReport(filter, collection);
    default:
      return new Promise<undefined>((resolve) => {
        logWarningMessage(status);
        resolve(undefined);
      });
  }
};

export {
  setReportStatusByReportId,
  createOrSetReportAsReceived,
  setToNotReceivedOrDeleteReport,
  setReportStatusByReportDetails,
};
