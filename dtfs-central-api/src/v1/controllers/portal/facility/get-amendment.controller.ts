import { AMENDMENT_TYPES, CustomExpressRequest } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

type GetAmendmentRequestParams = { facilityId: string; amendmentId: string };
type GetAmendmentRequest = CustomExpressRequest<{ params: GetAmendmentRequestParams }>;

export const getAmendment = async (req: GetAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;

  try {
    const amendment = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityId, amendmentId);

    if (!amendment || amendment.type !== AMENDMENT_TYPES.PORTAL) {
      return res.sendStatus(HttpStatusCode.NotFound);
    }

    return res.status(HttpStatusCode.Ok).send(amendment);
  } catch (error) {
    console.error(`Error getting amendment with facilityId ${facilityId} and amendment id ${amendmentId}: %o`, error);

    return res.sendStatus(HttpStatusCode.InternalServerError);
  }
};
