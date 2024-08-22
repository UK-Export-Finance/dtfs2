import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { flatten } from 'mongo-dot-notation';
import { ApiError, AuditDetails, CustomExpressRequest } from '@ukef/dtfs2-common';
import { validateAuditDetails, generateAuditDatabaseRecordFromAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { HttpStatusCode } from 'axios';
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
  const { tfmUpdate, auditDetails } = req.body;

  try {
    const facility = await TfmFacilitiesRepo.findOneById(facilityId);

    if (!facility) {
      return res.status(404).send({ status: 404, message: 'Facility not found' });
    }

    validateAuditDetails(auditDetails);

    const updatedFacility = await updateFacility({
      facilityId,
      tfmUpdate,
      auditDetails,
    });

    return res.status(HttpStatusCode.Ok).json(updatedFacility);
  } catch (error) {
    console.error('Error updating facility:', error);
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }
    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'An unknown error occurred while updating a facility',
    });
  }
};
