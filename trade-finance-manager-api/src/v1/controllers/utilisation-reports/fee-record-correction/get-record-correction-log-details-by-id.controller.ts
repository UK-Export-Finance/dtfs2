import { Request } from 'express';
import { HttpStatusCode, isAxiosError } from 'axios';
import { GetRecordCorrectionLogDetailsResponse } from '@ukef/dtfs2-common';
import api from '../../../api';

/**
 * Get record correction log details by id
 * @param req - the request
 * @param res - the response
 */
export const getRecordCorrectionLogDetailsById = async (req: Request, res: GetRecordCorrectionLogDetailsResponse) => {
  try {
    const { correctionId } = req.params;

    const utilisationReportReconciliationDetails = await api.getRecordCorrectionLogDetailsById(correctionId);

    return res.status(HttpStatusCode.Ok).send(utilisationReportReconciliationDetails);
  } catch (error) {
    const errorMessage = 'Failed to get record correction log details';
    const errorStatus = (isAxiosError(error) && error.response?.status) || HttpStatusCode.InternalServerError;

    console.error('%s %o', errorMessage, error);

    return res.status(errorStatus).send(errorMessage);
  }
};
