export const getAmendmentUrl = ({ facilityId, amendmentId }: { facilityId: string; amendmentId: string }) =>
  `/v1/gef/facilities/${facilityId}/amendments/${amendmentId}`;

export const putAmendmentUrl = ({ facilityId }: { facilityId: string }) => `/v1/gef/facilities/${facilityId}/amendments`;
