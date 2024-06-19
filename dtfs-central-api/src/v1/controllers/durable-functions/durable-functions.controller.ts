import { AuditDetails, DocumentNotFoundError, InvalidAuditDetailsError } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { validateAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { deleteAllDurableFunctionLogs } from '../../../repositories/durable-functions-repo';

export const deleteAllDurableFunctions = async (req: CustomExpressRequest<{ reqBody: { auditDetails: AuditDetails } }>, res: Response) => {
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
    await deleteAllDurableFunctionLogs(auditDetails);
    return res.status(200).send();
  } catch (error) {
    if (error instanceof DocumentNotFoundError) {
      return res.sendStatus(200);
    }
    console.error('ACBS DOF error %o', error);

    return res.status(500).send({
      error: 'An exception has occurred',
    });
  }
};
