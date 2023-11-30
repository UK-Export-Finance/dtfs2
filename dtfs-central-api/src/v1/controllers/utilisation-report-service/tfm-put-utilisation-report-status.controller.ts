import { Request, Response } from 'express';
import {
  Collection,
  DeleteResult,
  ObjectId,
  UpdateResult,
} from 'mongodb';

import {
  PutReportStatusRequestBody,
  ReportDetails,
  ReportFilter,
  ReportStatus,
} from './types';
import * as db from '../../../drivers/db-client';
import { DB_COLLECTIONS } from '../../../constants/dbCollections';

const REPORT_STATUS: Record<ReportStatus, ReportStatus> = {
  PENDING_RECONCILIATION: 'PENDING_RECONCILIATION',
  REPORT_NOT_RECEIVED: 'REPORT_NOT_RECEIVED',
};

const displayWarningMessage = (status: ReportStatus) => console.error(`The status '${status}' is not supported by '/v1/utilisation-reports/set-status'`);

const setReportStatusByReportId = (id: string, status: ReportStatus, collection: Collection) => {
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
      return new Promise<undefined>(() => {
        displayWarningMessage(status);
      });
    }
  }
};

const createOrSetReportAsReceived = (reportDetails: ReportDetails, filter: ReportFilter, collection: Collection) => {
  const placeholderReportInfo = {
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
      $setOnInsert: placeholderReportInfo,
    },
    { upsert: true },
  );
};

const setToNotReceivedOrDeleteReport = async (filter: ReportFilter, collection: Collection) => {
  const report = await collection.findOne(filter);
  if (!report) {
    return new Promise<undefined>(() => {
      console.error(`Report matching filter ${filter} does not exist`);
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

const setReportStatusByReportDetails = (reportDetails: ReportDetails, status: ReportStatus, collection: Collection) => {
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
      return new Promise<undefined>(() => {
        displayWarningMessage(status);
      });
  }
};

const putUtilisationReportStatus = async (req: Request<{}, {}, PutReportStatusRequestBody>, res: Response) => {
  try {
    const { reportsWithStatus } = req.body;

    const collection: Collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);

    const statusUpdates: Promise<UpdateResult | DeleteResult | undefined>[] = reportsWithStatus.map((reportWithStatus) => {
      const { status } = reportWithStatus;
      if ('id' in reportWithStatus.report) {
        const { id } = reportWithStatus.report;
        return setReportStatusByReportId(id, status, collection);
      }
      if ('bankId' in reportWithStatus.report) {
        const reportDetails = reportWithStatus.report;
        return setReportStatusByReportDetails(reportDetails, status, collection);
      }
      throw new Error('Request body supplied does not match required format');
    });

    await Promise.all(statusUpdates);
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error putting utilisation report status:', error);
    return res.status(400).send({ error: 'Put utilisation report status request failed' });
  }
};

export default putUtilisationReportStatus;
