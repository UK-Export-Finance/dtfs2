import { Request, Response } from 'express';
import { Collection, DeleteResult, UpdateResult } from 'mongodb';

import * as db from '../../../drivers/db-client';
import { DB_COLLECTIONS } from '../../../constants/dbCollections';
import { PutReportStatusRequestBody } from '../../../types/utilisation-report-status';
import { setReportStatusByReportId, setReportStatusByReportDetails } from '../../../services/repositories/utilisation-report-status-repo';

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

export default { putUtilisationReportStatus };
