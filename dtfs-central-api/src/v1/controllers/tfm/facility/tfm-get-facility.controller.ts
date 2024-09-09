import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

export const findOneFacility = async (_id: string | ObjectId, callback?: (facility: object | null) => unknown) => {
  if (!ObjectId.isValid(_id)) {
    return { status: 400, message: 'Invalid Facility Id' };
  }

  const facility = await TfmFacilitiesRepo.findOneById(_id);

  if (callback) {
    callback(facility);
  }

  return facility;
};

export const findOneFacilityGet = async (req: Request, res: Response) => {
  if (ObjectId.isValid(req.params.id)) {
    const facility = await findOneFacility(req.params.id);

    if (facility) {
      return res.status(200).send(facility);
    }

    return res.status(404).send({ status: 404, message: 'Facility not found' });
  }

  return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
};
