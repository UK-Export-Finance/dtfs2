import { Response } from 'supertest';
import * as z from 'zod';
import { PORTAL_FACILITY_AMENDMENT_USER_VALUES } from '@ukef/dtfs2-common/schemas';
import { PortalFacilityAmendmentWithUkefId } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { testApi } from '../test-api';

interface FacilityAmendmentResponse extends Response {
  body: PortalFacilityAmendmentWithUkefId;
}

/**
 * Creates a portal facility amendment by calling the test api
 * @param params
 * @param params.facilityId - The facility ID
 * @param params.dealId - The deal ID
 * @param params.amendment - The amendment details
 * @param params.userId - The user ID
 * @returns the created amendment
 */
export const createPortalFacilityAmendment = async ({
  facilityId,
  dealId,
  amendment = {},
  userId,
}: {
  facilityId: string;
  dealId: string;
  amendment?: Partial<z.infer<typeof PORTAL_FACILITY_AMENDMENT_USER_VALUES>>;
  userId: string;
}) => {
  const { body } = (await testApi
    .put({ dealId, amendment, auditDetails: generatePortalAuditDetails(userId) })
    .to(`/v1/portal/facilities/${facilityId}/amendments/`)) as FacilityAmendmentResponse;

  // Eligibility Criteria is overwritten in the PUT request
  if (amendment.eligibilityCriteria) {
    await testApi
      .patch({ update: { eligibilityCriteria: amendment.eligibilityCriteria }, auditDetails: generatePortalAuditDetails(userId) })
      .to(`/v1/portal/facilities/${facilityId}/amendments/${body.amendmentId}`);
  }

  return body;
};
