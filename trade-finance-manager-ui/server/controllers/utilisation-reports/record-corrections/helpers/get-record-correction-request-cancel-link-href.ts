/**
 * Generates the URL for canceling a record correction request
 * for the fee record of a utilisation report
 * @param reportId - The ID of the report
 * @param feeRecordId - The ID of the fee record
 * @returns The URL path for canceling the correction request
 */
export const getRecordCorrectionRequestCancelLinkHref = (reportId: string, feeRecordId: string) =>
  `/utilisation-reports/${reportId}/create-record-correction-request/${feeRecordId}/cancel`;
