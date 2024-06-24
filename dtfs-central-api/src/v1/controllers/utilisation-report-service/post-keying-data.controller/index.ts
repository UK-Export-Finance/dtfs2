import { Request, Response } from 'express';
import { HttpStatusCode } from 'axios';
import { ApiError } from '@ukef/dtfs2-common';
import { UtilisationReportRepo } from '../../../../repositories/utilisation-reports-repo';
import { NoMatchingFeeRecordsError, NotFoundError } from '../../../../errors';

export const postKeyingData = async (req: Request, res: Response) => {
  const { reportId } = req.params;

  try {
    const utilisationReport = await UtilisationReportRepo.findOneByIdWithFeeRecordsFilteredByStatus(Number(reportId), ['MATCH']);

    if (!utilisationReport) {
      throw new NotFoundError(`Failed to find a report with id '${reportId}'`);
    }

    const { feeRecords: matchingFeeRecords } = utilisationReport;
    if (matchingFeeRecords.length === 0) {
      throw new NoMatchingFeeRecordsError();
    }

    return res.sendStatus(HttpStatusCode.Ok);
  } catch (error) {
    const errorMessage = 'Failed to generate keying data';
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
