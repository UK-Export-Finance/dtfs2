// "Recommended Security and Performance Max: 2048 CHARACTERS" - https://stackoverflow.com/a/48230425
const MAX_URL_CHARACTERS = 2048;
const BASE_URL_CHARACTER_ALLOWANCE = 100;

export const getBackLinkUrl = (reportId: string, feeRecordIds: number[]): string => {
  const urlWithoutParams = `/utilisation-reports/${reportId}`;

  if (feeRecordIds.length === 0) {
    return urlWithoutParams;
  }

  const commaSeparatedFeeRecordIds = feeRecordIds.join(',');

  const feeRecordIdsURLParams = new URLSearchParams({
    selectedFeeRecordIds: commaSeparatedFeeRecordIds,
  }).toString();

  const urlWithParams = `${urlWithoutParams}?${feeRecordIdsURLParams}`;

  const urlWithParamsMaxLength = MAX_URL_CHARACTERS - BASE_URL_CHARACTER_ALLOWANCE;
  if (urlWithParams.length > urlWithParamsMaxLength) {
    console.error(
      `Back link URL with params exceeds maximum length (${urlWithParams.length} > ${urlWithParamsMaxLength}). Falling back to URL without params.`,
    );
    return urlWithoutParams;
  }

  return urlWithParams;
};
