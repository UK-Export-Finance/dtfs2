import { PortalAmendmentStatus } from '@ukef/dtfs2-common';

export const getAmendmentUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}`;

export const patchAmendmentUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}`;

export const deleteAmendmentUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}`;

export const putAmendmentUrl = ({ facilityId }: { facilityId: string }) => `/v1/gef/facilities/${facilityId}/amendments`;

export const patchAmendmentStatusUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}/status`;

export const getAmendmentsOnDealUrl = ({ dealId, statuses }: { dealId: string; statuses?: PortalAmendmentStatus[] }) => {
  const statusFilterQuery = statuses ? `?statuses=${statuses.map((item) => encodeURI(item)).join(',')}` : '';
  return `/v1/gef/deals/${dealId}/amendments/${statusFilterQuery}`;
};
