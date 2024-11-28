/**
 * Converts an array of checkbox IDs to a record object.
 * @param checkedCheckboxIds - An array of checkbox IDs.
 * @returns A record object with checkbox IDs as keys and true as values.
 */
export const mapCheckedCheckboxesToRecord = (checkedCheckboxIds: string[]): Record<string, true | undefined> => {
  return checkedCheckboxIds.reduce((obj, checkboxId) => ({ ...obj, [checkboxId]: true }), {});
};
