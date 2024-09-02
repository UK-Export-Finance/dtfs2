/**
 * Creates a function to check if all of the provided fee record IDs are present in the set of checked fee records.
 * @param checkedFeeRecordIds - A Set containing the IDs of checked fee records.
 * @returns A function that takes an array of fee record IDs and returns true if all IDs are in the checked set, false otherwise.
 */
export const getIsCheckboxChecked = (checkedFeeRecordIds: Set<number>): ((feeRecordIds: number[]) => boolean) => {
  return (feeRecordIds: number[]): boolean => {
    return feeRecordIds.every((feeRecordId) => checkedFeeRecordIds.has(feeRecordId));
  };
};
