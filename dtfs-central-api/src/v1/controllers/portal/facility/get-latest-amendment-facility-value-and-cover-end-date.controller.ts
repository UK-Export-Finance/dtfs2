import { ApiError, CustomExpressRequest } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

type GetLatestAmendmentValueAndCoverEndDateByFacilityIdRequestParams = { facilityId: string };
export type GetLatestAmendmentValueAndCoverEndDateByFacilityIdRequest = CustomExpressRequest<{
  params: GetLatestAmendmentValueAndCoverEndDateByFacilityIdRequestParams;
}>;

/**
 * get latest amendment value and cover end date by facilityId
 * @param req - request
 * @param res - response
 */
export const getLatestAmendmentFacilityValueAndCoverEndDate = async (req: GetLatestAmendmentValueAndCoverEndDateByFacilityIdRequest, res: Response) => {
  const { facilityId } = req.params;

  try {
    const valueAmendment = await TfmFacilitiesRepo.findLatestValueAmendmentByFacilityId(facilityId);
    const coverEndDateAmendment = await TfmFacilitiesRepo.findLatestCoverEndDateAmendmentByFacilityId(facilityId);

    if (!valueAmendment && !coverEndDateAmendment) {
      const values = {
        value: null,
        coverEndDate: null,
      };

      return res.status(HttpStatusCode.Ok).send(values);
    }

    const values = {
      value: valueAmendment?.value || null,
      coverEndDate: coverEndDateAmendment?.coverEndDate || null,
    };

    return res.status(HttpStatusCode.Ok).send(values);
  } catch (error) {
    console.error('Error getting latest value and cover end date amendments by facilityId %o', error);

    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when getting latest value and cover end date amendments by facilityId',
    });
  }
};
