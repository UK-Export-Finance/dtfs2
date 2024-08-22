// "Recommended Security and Performance Max: 2048 CHARACTERS" - https://stackoverflow.com/a/48230425
const MAX_URL_CHARACTERS = 2048;
const BASE_URL_CHARACTER_ALLOWANCE = 150;

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

  const urlWithParamsMaxLength = MAX_URL_CHARACTERS - BASE_URL_CHARACTER_ALLOWANCE;
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
