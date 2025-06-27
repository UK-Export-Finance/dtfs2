import { ApiError, AUDIT_USER_TYPES, AmendmentNotFoundError, CustomExpressRequest, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { TfmFacilitiesRepo } from '../../../../repositories/tfm-facilities-repo';
import { DeletePortalFacilityAmendmentPayload } from '../../../routes/middleware/payload-validation/validate-delete-portal-facility-amendment-payload';
import EMAIL_TEMPLATE_IDS from '../../../../constants/email-template-ids';
import externalApi from '../../../../external-api/api';

type DeletePortalAmendmentRequestParams = { facilityId: string; amendmentId: string };
export type DeletePortalAmendmentRequest = CustomExpressRequest<{ params: DeletePortalAmendmentRequestParams; reqBody: DeletePortalFacilityAmendmentPayload }>;

/**
 * delete portal facility amendment
 * @param req - request
 * @param res - response
 */
export const deletePortalAmendment = async (req: DeletePortalAmendmentRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { auditDetails, makersEmail, checkersEmail, emailVariables } = req.body;
  const facilityMongoId = new ObjectId(facilityId);
  const amendmentMongoId = new ObjectId(amendmentId);

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.PORTAL);

    const amendment = await TfmFacilitiesRepo.findOneAmendmentByFacilityIdAndAmendmentId(facilityMongoId, amendmentMongoId);

    if (!amendment) {
      console.error('Amendment with facilityId %s and amendmentId %s not found', facilityId, amendmentId);
      throw new AmendmentNotFoundError(amendmentId, facilityId);
    }

    await TfmFacilitiesRepo.deletePortalFacilityAmendment({
      facilityId: facilityMongoId,
      amendmentId: amendmentMongoId,
      auditDetails,
    });

    const { status } = amendment;
    if (status === PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED) {
      // sends email to maker with the details of the amendment
      await externalApi.sendEmail(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_ABANDON_MAKER_EMAIL, makersEmail, emailVariables);
      // sends email to checker with the details of the amendment
      await externalApi.sendEmail(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_ABANDON_CHECKER_EMAIL, checkersEmail, emailVariables);
    }

    return res.sendStatus(HttpStatusCode.NoContent);
  } catch (error) {
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      console.error('Error deleting amendment: %s', message);
      return res.status(status).send({ status, message, code });
    }

    console.error('Error deleting amendment on facilityId %s: %o', facilityId, error);

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when deleting portal amendment',
    });
  }
};
