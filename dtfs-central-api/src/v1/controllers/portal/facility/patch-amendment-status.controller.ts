import { ApiError, AUDIT_USER_TYPES, CustomExpressRequest, InvalidPayloadError, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { PatchPortalFacilityAmendmentStatusPayload } from '../../../routes/middleware/payload-validation/validate-patch-portal-facility-amendment-status-payload';
import EMAIL_TEMPLATE_IDS from '../../../../constants/email-template-ids';
import externalApi from '../../../../external-api/api';

type PatchSubmitAmendmentToCheckerRequestParams = {
  facilityId: string;
  amendmentId: string;
};

export type PatchSubmitAmendmentToCheckerRequest = CustomExpressRequest<{
  params: PatchSubmitAmendmentToCheckerRequestParams;
  reqBody: PatchPortalFacilityAmendmentStatusPayload;
}>;

/**
 * patch portal facility amendment status
 * if newStatus is PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL, submit the amendment to checker
 * and send an email with the details of the amendment
 * @param req - request
 * @param res - response
 */
export const patchAmendmentStatus = async (req: PatchSubmitAmendmentToCheckerRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { auditDetails, newStatus, makersEmail, checkersEmail, emailVariables } = req.body;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.PORTAL);

    switch (newStatus) {
      case PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL: {
        const updatedAmendment = await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToChecker({ facilityId, amendmentId, auditDetails });

        // sends email to maker with the details of the amendment
        await externalApi.sendEmail(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_SUBMITTED_TO_CHECKER_MAKER_EMAIL, makersEmail, emailVariables);
        // sends email to checker with the details of the amendment
        await externalApi.sendEmail(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_SUBMITTED_TO_CHECKER_CHECKER_EMAIL, checkersEmail, emailVariables);

        return res.status(HttpStatusCode.Ok).send(updatedAmendment);
      }
      case PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED: {
        const updatedAmendment = await PortalFacilityAmendmentService.returnPortalFacilityAmendmentToMaker({ facilityId, amendmentId, auditDetails });

        // sends email to maker with the details of the amendment
        await externalApi.sendEmail(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_RETURN_TO_MAKER_MAKER_EMAIL, makersEmail, emailVariables);
        // sends email to checker with the details of the amendment
        await externalApi.sendEmail(EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_RETURN_TO_MAKER_CHECKER_EMAIL, checkersEmail, emailVariables);

        return res.status(HttpStatusCode.Ok).send(updatedAmendment);
      }
      default: {
        // This error should never be thrown since the payload is validated by Zod middleware
        throw new InvalidPayloadError(`Invalid requested status update: ${newStatus}`);
      }
    }
  } catch (error) {
    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    console.error(`Error updating portal amendment status: %o`, error);

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when updating portal amendment status',
    });
  }
};
