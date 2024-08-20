export const getSelectedFeeRecordIdsFromQuery = (selectedFeeRecordIdsQueryString: string | undefined) => {
  const feeRecordIds = selectedFeeRecordIdsQueryString?.split(',').map((id) => parseInt(id, 10));
  return new Set(feeRecordIds);
};
