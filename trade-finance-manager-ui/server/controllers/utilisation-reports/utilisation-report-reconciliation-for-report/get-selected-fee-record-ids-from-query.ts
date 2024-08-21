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
