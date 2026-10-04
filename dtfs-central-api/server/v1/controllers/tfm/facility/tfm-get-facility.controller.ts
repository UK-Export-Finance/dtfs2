import { Response } from 'express';
import { HttpStatusCode } from 'axios';
import { CustomExpressRequest, TfmFacility } from '@ukef/dtfs2-common';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import { ApiError, NotFoundError } from '../../../../errors';

type FindOneFacilityRequest = CustomExpressRequest<{ params: { id: string } }>;

export const findOneFacilityGet = async (req: FindOneFacilityRequest, res: Response<TfmFacility | { status: number; message: string }>) => {
  const { id } = req.params;

  try {
    const facility = await TfmFacilitiesRepo.findOneById(id);
    if (!facility) {
      throw new NotFoundError('Facility not found');
    }
    return res.status(HttpStatusCode.Ok).send(facility);
  } catch (error) {
    console.error('Error finding facility by id:', error);
    if (error instanceof ApiError) {
      return res.status(error.status).send({ status: error.status, message: error.message });
    }
    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'An unknown error occurred when getting facility by id',
    });
  }
};
