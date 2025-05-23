import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

type GetAcknowledgedAmendmentsByFacilityIdRequestParams = { facilityId: string };
export type GetAcknowledgedAmendmentsByFacilityIdRequest = CustomExpressRequest<{ params: GetAcknowledgedAmendmentsByFacilityIdRequestParams }>;

/**
 * get acknowledged amendments by facilityId
 * @param req - request
 * @param res - response
 */
export const getAcknowledgedAmendmentsByFacilityId = async (req: GetAcknowledgedAmendmentsByFacilityIdRequest, res: Response) => {
  const { facilityId } = req.params;

  try {
    const amendments = await TfmFacilitiesRepo.findAcknowledgedPortalAmendmentsByFacilityId(facilityId);

    return res.status(HttpStatusCode.Ok).send(amendments);
  } catch (error) {
    console.error(`Error getting acknowledged amendments by facilityId %o`, error);

    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting acknowledged amendments by facilityId',
    });
  }
};
