import { SessionBank, ReportPeriod } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Request, Response } from 'express';
import { ApiError, NotFoundError } from '../../../../errors';
import { FeeRecordRepo } from '../../../../repositories/fee-record-repo';
import { mapFeeRecordEntityToResponse } from './helpers';

/**
 * Response body type for the GET fee record endpoint.
 */
export type GetFeeRecordResponseBody = {
  id: number;
  bank: SessionBank;
  reportPeriod: ReportPeriod;
  facilityId: string;
  exporter: string;
};

type GetFeeRecordResponse = Response<GetFeeRecordResponseBody | string>;

/**
 * Controller for the GET fee record route.
 * @param req - The request object.
 * @param res - The response object.
 * @returns A promise that resolves to the response containing the fee record response.
 * @throws {NotFoundError} When either the fee record is not found for the given IDs or the
 * bank on the report is not found.
 */
export const getFeeRecord = async (req: Request, res: GetFeeRecordResponse) => {
  const { reportId, feeRecordId } = req.params;

  try {
    const feeRecordEntity = await FeeRecordRepo.findOneByIdAndReportIdWithReport(Number(feeRecordId), Number(reportId));

    if (!feeRecordEntity) {
      throw new NotFoundError(`Failed to find a fee record with id '${feeRecordId}' attached to report with id '${reportId}'`);
    }

    const feeRecord = await mapFeeRecordEntityToResponse(feeRecordEntity);

    return res.status(HttpStatusCode.Ok).send(feeRecord);
  } catch (error) {
    const errorMessage = `Failed to get fee record`;
    console.error(errorMessage, error);
    if (error instanceof ApiError) {
      return res.status(error.status).send(`${errorMessage}: ${error.message}`);
    }
    return res.status(HttpStatusCode.InternalServerError).send(errorMessage);
  }
};
