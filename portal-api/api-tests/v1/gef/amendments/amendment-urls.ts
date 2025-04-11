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

export const patchSubmitAmendmentUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment`;

export const getAmendmentsOnDealUrl = ({ dealId, statuses }: { dealId: string; statuses?: PortalAmendmentStatus[] }) => {
  const statusFilterQuery = statuses ? `?statuses=${statuses.map((item) => encodeURI(item)).join(',')}` : '';
  return `/v1/gef/deals/${dealId}/amendments/${statusFilterQuery}`;
};

/**
 * Constructs the URL to get all amendments with optional statuses filters.
 * @param {import('@ukef/dtfs2-common').PortalAmendmentStatus[] | undefined} statuses - An optional array of statuses to filter the amendments by
 * @returns {string} The constructed URL with optional statuses filters.
 */
export const getAllAmendmentsUrl = ({ statuses }: { statuses?: PortalAmendmentStatus[] }) => {
  const getStatusesParameter = (statusesParam?: PortalAmendmentStatus[]) => statusesParam?.map((item) => encodeURI(item)).join(',');
  const statusFilterQuery = statuses ? `?statuses=${getStatusesParameter(statuses)}` : '';
  return `/v1/gef/facilities/amendments/${statusFilterQuery}`;
};
