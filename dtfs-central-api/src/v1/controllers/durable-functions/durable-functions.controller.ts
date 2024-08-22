import { ApiError, ApiErrorResponseBody, AuditDetails, DocumentNotFoundError } from '@ukef/dtfs2-common';
import { Response } from 'express';
import { validateAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { CustomExpressRequest } from '../../../types/custom-express-request';
import { deleteAllDurableFunctionLogs } from '../../../repositories/durable-functions-repo';

export const deleteAllDurableFunctions = async (
  req: CustomExpressRequest<{ reqBody: { auditDetails: AuditDetails } }>,
  res: Response<ApiErrorResponseBody>,
) => {
  const { auditDetails } = req.body;

  try {
    validateAuditDetails(auditDetails);

    await deleteAllDurableFunctionLogs(auditDetails);
    return res.sendStatus(200);
  } catch (error) {
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    if (error instanceof DocumentNotFoundError) {
      return res.sendStatus(200);
    }
    console.error('ACBS DOF error %o', error);

    return res.status(500).send({
      message: 'An exception has occurred',
    });
  }
};
