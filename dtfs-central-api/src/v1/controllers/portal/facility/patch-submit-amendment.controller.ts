import { ApiError, AUDIT_USER_TYPES, CustomExpressRequest, InvalidPayloadError, PORTAL_AMENDMENT_STATUS, DEAL_TYPE } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Response } from 'express';
import { validateAuditDetailsAndUserType } from '@ukef/dtfs2-common/change-stream';
import { PortalFacilityAmendmentService } from '../../../../services/portal/facility-amendment.service';
import { PortalDealService } from '../../../../services/portal/deal.service';
import { PatchPortalFacilitySubmitAmendmentPayload } from '../../../routes/middleware/payload-validation/validate-patch-portal-facility-submit-amendment-payload';
import EMAIL_TEMPLATE_IDS from '../../../../constants/email-template-ids';
import externalApi from '../../../../external-api/api';

type PatchSubmitAmendmentToUkefRequestParams = {
  facilityId: string;
  amendmentId: string;
};

export type PatchSubmitAmendmentToUkefRequest = CustomExpressRequest<{
  params: PatchSubmitAmendmentToUkefRequestParams;
  reqBody: PatchPortalFacilitySubmitAmendmentPayload;
}>;

/**
 * patch portal facility amendment
 * if newStatus is PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED, submit the amendment to ukef
 * and send emails with the details of the amendment
 * @param req - request
 * @param res - response
 */
export const patchSubmitAmendment = async (req: PatchSubmitAmendmentToUkefRequest, res: Response) => {
  const { facilityId, amendmentId } = req.params;
  const { auditDetails, newStatus, referenceNumber, makersEmail, checkersEmail, pimEmail, emailVariables } = req.body;

  try {
    validateAuditDetailsAndUserType(auditDetails, AUDIT_USER_TYPES.PORTAL);

    switch (newStatus) {
      case PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED: {
        const updatedSubmitAmendment = await PortalFacilityAmendmentService.submitPortalFacilityAmendmentToUkef({
          facilityId,
          amendmentId,
          newStatus,
          referenceNumber,
          auditDetails,
        });

        const dealId = updatedSubmitAmendment.dealId.toString();
        const dealUpdate = {};

        await PortalDealService.updateDeal({
          dealId,
          dealUpdate,
          auditDetails,
          dealType: DEAL_TYPE.GEF,
        });

        const emails = [makersEmail, checkersEmail, pimEmail];

        // sends email to maker, checker and pim with the details of the amendment
        const templateIds = [
          EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_SUBMITTED_TO_UKEF_MAKER_EMAIL,
          EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_SUBMITTED_TO_UKEF_CHECKER_EMAIL,
          EMAIL_TEMPLATE_IDS.PORTAL_AMENDMENT_SUBMITTED_TO_UKEF_PIM_EMAIL,
        ];

        for (const [index, email] of emails.entries()) {
          const templateId = templateIds[index];
          await externalApi.sendEmail(templateId, email, emailVariables);
        }

        return res.status(HttpStatusCode.Ok).send(updatedSubmitAmendment);
      }
      default: {
        // This error should never be thrown since the payload is validated by Zod middleware
        throw new InvalidPayloadError(`Invalid requested status update: ${newStatus}`);
      }
    }
  } catch (error) {
    const errorMessage = 'Error updating portal amendment on submit';
    console.error('%s %o', errorMessage, error);

    if (error instanceof ApiError) {
      const { status, message, code } = error;
      return res.status(status).send({ status, message, code });
    }

    return res.status(HttpStatusCode.InternalServerError).send({
      status: HttpStatusCode.InternalServerError,
      message: 'Unknown error occurred when updating portal amendment status',
    });
  }
};
