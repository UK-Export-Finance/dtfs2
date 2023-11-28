import { Request, Response } from 'express';
import { PutReportStatusRequestBody, ReportDetails, ReportFilter, ReportStatus } from './interfaces';
import { Collection, DeleteResult, ObjectId, UpdateResult } from 'mongodb';

import * as db from '../../../drivers/db-client';
import { DB_COLLECTIONS } from '../../../../src/constants/dbCollections';

const setReportStatusByReportId = (id: string, status: ReportStatus, collection: Collection) => {
  const filter = { _id: new ObjectId(id) };
  switch (status) {
    case ReportStatus.PENDING_RECONCILIATION: {
      return collection.updateOne(filter,
        {
          $set: {
            status: ReportStatus.PENDING_RECONCILIATION,
          },
        },
      );
    }
    case ReportStatus.REPORT_NOT_RECEIVED: {
      return collection.updateOne(filter,
        {
          $set: {
            status: ReportStatus.REPORT_NOT_RECEIVED,
          },
        },
      );
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
  return collection.updateOne(filter,
    {
      $set: {
        status: ReportStatus.PENDING_RECONCILIATION,
      },
      $setOnInsert: placeholderReportInfo,
    },
    { upsert: true },
  );
};

const setToNotReceivedOrDeleteReport = async (filter: ReportFilter, collection: Collection) => {
  const report = await collection.findOne(filter);
  if (!report) {
    return;
  }

  if (!report.azureFileInfo) {
    return collection.deleteOne(filter);
  }

  return collection.updateOne(filter,
    {
      $set: {
        status: ReportStatus.REPORT_NOT_RECEIVED,
      },
    },
  );
};

const setReportStatusByReportDetails = (reportDetails: ReportDetails, status: ReportStatus, collection: Collection) => {
  const filter: ReportFilter = {
    month: reportDetails.month,
    year: reportDetails.year,
    'bank.id': reportDetails.bankId,
  };
  switch (status) {
    case ReportStatus.PENDING_RECONCILIATION:
      return createOrSetReportAsReceived(reportDetails, filter, collection);
    case ReportStatus.REPORT_NOT_RECEIVED:
      return setToNotReceivedOrDeleteReport(filter, collection);
  }
};

export const putUtilisationReportStatus = async (req: Request<{}, {}, PutReportStatusRequestBody>, res: Response) => {
  try {
    const { reportsWithStatus } = req.body;

    const collection: Collection = await db.getCollection(DB_COLLECTIONS.UTILISATION_REPORTS);

    const statusUpdates: Promise<UpdateResult | DeleteResult | undefined>[] = reportsWithStatus.map((reportWithStatus) => {
      const { status } = reportWithStatus;
      if ('id' in reportWithStatus.report) {
        const { id } = reportWithStatus.report;
        return setReportStatusByReportId(id, status, collection);
      } else if ('bankId' in reportWithStatus.report) {
        const reportDetails = reportWithStatus.report;
        return setReportStatusByReportDetails(reportDetails, status, collection);
      } else {
        throw new Error('Request body supplied does not match required format');
      }
    });

    await Promise.all(statusUpdates);
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error putting utilisation report status:', error);
    return res.status(400).send({ error: 'Put utilisation report status request failed' });
  }
};
