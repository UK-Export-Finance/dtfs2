/**
 * Extracts and parses selected fee record IDs from a comma-separated query string.
 * @param selectedFeeRecordIdsQueryString - A comma-separated string of fee record IDs.
 * @returns A set of parsed integer IDs. Returns an empty set if the input is undefined.
 */
export const getSelectedFeeRecordIdsFromQuery = (selectedFeeRecordIdsQueryString: string | undefined) => {
  return (
    selectedFeeRecordIdsQueryString?.split(',').reduce((ids, id) => {
      const parsedId = parseInt(id, 10);

      if (!Number.isNaN(parsedId)) {
        ids.add(parsedId);
      }

      return ids;
    }, new Set<number>()) ?? new Set<number>()
  );
};
