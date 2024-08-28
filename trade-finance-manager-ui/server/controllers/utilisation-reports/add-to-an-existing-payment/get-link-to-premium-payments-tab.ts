import { URL_WITH_PARAMS_MAX_LENGTH } from '@ukef/dtfs2-common';

/**
 * Generates a link to the Premium Payments tab for a given utilisation report,
 * including selected fee record IDs as query parameters if within URL length limit.
 * @param reportId - The ID of the utilisation report.
 * @param selectedFeeRecordIds - An array of selected fee record IDs to include in the URL.
 * @returns A string representing the URL for the Premium Payments tab.
 */
export const getLinkToPremiumPaymentsTab = (reportId: string, selectedFeeRecordIds: number[]): string => {
  const urlWithoutParams = `/utilisation-reports/${reportId}`;

  if (selectedFeeRecordIds.length === 0) {
    return urlWithoutParams;
  }

  const commaSeparatedFeeRecordIds = selectedFeeRecordIds.join(',');

  const urlParams = new URLSearchParams({
    selectedFeeRecordIds: commaSeparatedFeeRecordIds,
  }).toString();

  const urlWithParams = `${urlWithoutParams}?${urlParams}`;

  if (urlWithParams.length > URL_WITH_PARAMS_MAX_LENGTH) {
    console.error(
      `Back link URL with params exceeds maximum length (${urlWithParams.length} > ${URL_WITH_PARAMS_MAX_LENGTH}). Falling back to URL without params.`,
    );

    return urlWithoutParams;
  }

  return urlWithParams;
};
