import { Response } from 'express';
import { AuditDetails, MONGO_DB_COLLECTIONS, DocumentNotFoundError, ApiErrorResponseBody, ApiError } from '@ukef/dtfs2-common';
import { deleteMany, validateAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { mongoDbClient } from '../../../drivers/db-client';

export const deleteAllEstoreLogs = async (
  req: CustomExpressRequest<{ reqBody: { auditDetails: AuditDetails } }>,
  res: Response<void | ApiErrorResponseBody>,
) => {
  const { auditDetails } = req.body;

  try {
    validateAuditDetails(auditDetails);

    await deleteMany({
      filter: {},
      collectionName: MONGO_DB_COLLECTIONS.CRON_JOB_LOGS,
      db: mongoDbClient,
      auditDetails,
    });

    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    if (error instanceof DocumentNotFoundError) {
      return res.sendStatus(200);
    }

    console.error('CRON job error %o', error);

    return res.status(500).send({
      message: 'An exception has occurred',
    });
  }
};
