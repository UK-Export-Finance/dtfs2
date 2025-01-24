/**
 * Generates the URL for canceling a record correction
 * @param correctionId - The ID of the correction to cancel
 * @returns The URL path for canceling the specified correction
 */
export const getRecordCorrectionCancelLinkHref = (correctionId: string) => `/utilisation-reports/cancel-correction/${correctionId}`;
