import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { ApiError, NotFoundError } from '../../../../errors';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { mapToFeeRecordDetails } from './helpers';

export type GetFeeRecordDetailsResponseBody = {
  id: number;
  facilityId: string;
  exporter: string;
};

type GetFeeRecordDetailsByIdResponse = Response<GetFeeRecordDetailsResponseBody | string>;

export const getFeeRecordDetailsById = async (req: Request, res: GetFeeRecordDetailsByIdResponse) => {
  const { reportId, feeRecordId } = req.params;

  try {
    const feeRecord = await FeeRecordRepo.findOneByIdAndReportId(Number(feeRecordId), Number(reportId));

    if (!feeRecord) {
      throw new NotFoundError(`Failed to find a fee record with id '${feeRecordId}' attached to report with id '${reportId}'`);
    }

    const feeRecordDetails = mapToFeeRecordDetails(feeRecord);

    return res.status(HttpStatusCode.Ok).send(feeRecordDetails);
  } catch (error) {
    const errorMessage = `Failed to get fee record details`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
