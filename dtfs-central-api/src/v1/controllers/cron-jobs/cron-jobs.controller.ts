import { Response } from 'express';
import { AuditDetails, MONGO_DB_COLLECTIONS, InvalidAuditDetailsError, DocumentNotDeletedError } from '@ukef/dtfs2-common';
import { deleteMany, validateAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { mongoDbClient } from '../../../drivers/db-client';

export const deleteAllEstoreLogs = async (req: CustomExpressRequest<{ reqBody: { auditDetails: AuditDetails } }>, res: Response) => {
  const { auditDetails } = req.body;

  try {
    validateAuditDetails(auditDetails);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: `Invalid auditDetails, ${error.message}`,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  try {
    await deleteMany({
      filter: {},
      collectionName: MONGO_DB_COLLECTIONS.CRON_JOB_LOGS,
      db: mongoDbClient,
      auditDetails,
    });

    return res.status(200).send();
  } catch (error) {
    if (error instanceof DocumentNotDeletedError) {
      return res.sendStatus(404);
    }

    console.error('CRON job error %o', error);

    return res.status(500).send({
      error: 'An exception has occurred',
    });
  }
};
