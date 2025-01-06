import { AMENDMENT_TYPES, AmendmentNotFoundError, ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

type GetAmendmentRequestParams = { facilityId: string; amendmentId: string };
export type GetAmendmentRequest = CustomExpressRequest<{ params: GetAmendmentRequestParams }>;

/**
 * get portal facility amendment
 * @param req - request
 * @param res - response
 */
export const getAmendment = async (req: GetAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;

  try {
    const amendment = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

    if (amendment?.type !== AMENDMENT_TYPES.PORTAL) {
      throw new AmendmentNotFoundError(amendmentId, facilityId);
    }

    return res.status(HttpStatusCode.Ok).send(amendment);
  } catch (error) {
    console.error(`Error getting amendment with facilityId ${facilityId} and amendment id ${amendmentId}: %o`, error);

    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting amendment',
    });
  }
};
