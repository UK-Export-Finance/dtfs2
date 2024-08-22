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

  // "Recommended Security and Performance Max: 2048 CHARACTERS" - https://stackoverflow.com/a/48230425
  const maxUrlCharacters = 2048;
  const baseUrlCharacterAllowance = 150;
  const urlWithParamsMaxLength = maxUrlCharacters - baseUrlCharacterAllowance;
  if (urlWithParams.length > urlWithParamsMaxLength) {
    // Passing the IDs as query params should handle up to ~189 seven digit IDs before we reach this limit.
    // (2048 - 150) = 1898 chars, 1898 / (7 digits per ID + 3 chars for percent-encoded comma) = ~189 seven digit IDs.
    console.error(
      `Back link URL with params exceeds maximum length (${urlWithParams.length} > ${urlWithParamsMaxLength}). Falling back to URL without params.`,
    );
    return urlWithoutParams;
  }

  return urlWithParams;
};
