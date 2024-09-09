import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { flatten } from 'mongo-dot-notation';
import { AuditDetails, CustomExpressRequest, InvalidAuditDetailsError } from '@ukef/dtfs2-common';
import { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';

const updateFacility = async ({ facilityId, tfmUpdate, auditDetails }: { facilityId: string | ObjectId; tfmUpdate: object; auditDetails: AuditDetails }) => {
  const update = {
    tfm: {
      ...tfmUpdate,
    },
    auditRecord: generateAuditDatabaseRecordFromAuditDetails(auditDetails),
  };

  const updatedFacility = await TfmFacilitiesRepo.findOneByIdAndUpdate(facilityId, flatten(update), {
    returnDocument: 'after',
    upsert: true,
  });

  return updatedFacility;
};

type UpdateFacilityPutRequest = CustomExpressRequest<{
  reqBody: {
    tfmUpdate: object;
    auditDetails: AuditDetails;
  };
}>;

export const updateFacilityPut = async (req: UpdateFacilityPutRequest, res: Response) => {
  const facilityId = req.params.id;
  if (!ObjectId.isValid(facilityId)) {
    return res.status(400).send({ status: 400, message: 'Invalid Facility Id' });
  }

  const facility = await TfmFacilitiesRepo.findOneById(facilityId);

  if (!facility) {
    return res.status(404).send({ status: 404, message: 'Facility not found' });
  }

  const { tfmUpdate, auditDetails } = req.body;

  try {
    validateAuditDetails(auditDetails);
  } catch (error) {
    if (error instanceof InvalidAuditDetailsError) {
      return res.status(error.status).send({
        status: error.status,
        message: `Invalid auditDetails, ${error.message}`,
      });
    }
    return res.status(500).send({ status: 500, error });
  }

  const updatedFacility = await updateFacility({
    facilityId,
    tfmUpdate,
    auditDetails,
  });

  return res.status(200).json(updatedFacility);
};
