import { Response } from 'express';
import { AuditDetails, MONGO_DB_COLLECTIONS } from '@ukef/dtfs2-common';
import { deleteMany, validateAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { InvalidAuditDetailsError } from '@ukef/dtfs2-common/errors';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import db from '../../../drivers/db-client';

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
      db,
      auditDetails,
    });

    return res.status(200).send();
  } catch (error) {
    console.error('CRON job error %o', error);

    return res.status(500).send({
      error: 'An exception has occurred',
    });
  }
};
