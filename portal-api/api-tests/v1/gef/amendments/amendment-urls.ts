import { PortalAmendmentStatus, TfmAmendmentStatus } from '@ukef/dtfs2-common';

/**
 * Constructs the URL to get the amendment.
 * @param {string} facilityId
 * @param {string} amendmentId
 * @returns {string} The constructed URL.
 */
export const getAmendmentUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}`;

export const getLatestAmendmentValueAndCoverEndDateUrl = (facilityId: string) => `/v1/gef/facilities/${facilityId}/amendments/latest-value-and-cover-end-date`;

/**
 * Constructs the URL to update the amendment.
 * @param {string} facilityId
 * @param {string} amendmentId
 * @returns {string} The constructed URL.
 */
export const patchAmendmentUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}`;

/**
 * Constructs the URL to delete the amendment.
 * @param {string} facilityId
 * @param {string} amendmentId
 * @returns {string} The constructed URL.
 */
export const deleteAmendmentUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}`;

/**
 * Constructs the URL to upsert the Portal facility amendment
 * @param {string} facilityId
 * @returns {string} The constructed URL.
 */
export const putAmendmentUrl = ({ facilityId }: { facilityId: string }) => `/v1/gef/facilities/${facilityId}/amendments`;

/**
 * Constructs the URL to update the amendment with the new status.
 * @param {string} facilityId
 * @param {string} amendmentId
 * @returns {string} The constructed URL.
 */
export const patchAmendmentStatusUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}/status`;

/**
 * Constructs the URL to submit the amendment on deal with optional statuses filters.
 * @param {string} facilityId
 * @param {string} amendmentId
 * @returns {string} The constructed URL.
 */
export const patchSubmitAmendmentUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}/submit-amendment`;

/**
 * Constructs the URL to get all portal amendments on deal with optional statuses filters.
 * @param {string} dealId
 * @param {import('@ukef/dtfs2-common').PortalAmendmentStatus[] | undefined} statuses - An optional array of statuses to filter the amendments by
 * @returns {string} The constructed URL with optional statuses filters.
 */
export const getPortalAmendmentsOnDealUrl = ({ dealId, statuses }: { dealId: string; statuses?: PortalAmendmentStatus[] }) => {
  const statusFilterQuery = statuses ? `?statuses=${statuses.map((item) => encodeURI(item)).join(',')}` : '';
  return `/v1/gef/deals/${dealId}/amendments/${statusFilterQuery}`;
};

/**
 * Constructs the URL to get all type amendments on a deal with optional statuses filters.
 * @param {string} dealId
 * @param {(import('@ukef/dtfs2-common').PortalAmendmentStatus | import('@ukef/dtfs2-common').TfmAmendmentStatus)[] | undefined} statuses - An optional array of statuses to filter the amendments by
 * @returns {string} The constructed URL with optional statuses filters.
 */
export const getAmendmentsOnDealUrl = ({ dealId, statuses }: { dealId: string; statuses?: (PortalAmendmentStatus | TfmAmendmentStatus)[] }) => {
  const statusFilterQuery = statuses ? `?statuses=${statuses.map((item) => encodeURI(item)).join(',')}` : '';
  return `/v1/gef/deals/${dealId}/all-types-amendments/${statusFilterQuery}`;
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
