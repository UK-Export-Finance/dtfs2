export const getIsCheckboxChecked = (checkedFeeRecordIds: Set<number>): ((feeRecordIds: number[]) => boolean) => {
  return (feeRecordIds: number[]): boolean => {
    return feeRecordIds.every((feeRecordId) => checkedFeeRecordIds.has(feeRecordId));
  };
};
