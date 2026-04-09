type SortableAmendment = {
  referenceNumber?: string | null;
  version?: number | null | undefined;
};

type SortAmendmentsOptions = {
  /**
   * When true, amendments without a `referenceNumber` are ordered by their
   * `version` property in descending numerical order. When false, the
   * relative ordering of amendments without a `referenceNumber` is left
   * unchanged.
   */
  sortByVersionWhenNoReferenceNumber?: boolean;
};

/**
 * Sorts amendments in place by `referenceNumber` in descending
 * lexicographical order, with optional tie‑breaking on `version`.
 *
 * Sorting behaviour:
 * - Amendments with a defined `referenceNumber` are ordered before those
 *   without one.
 * - When both amendments have a `referenceNumber`, they are compared using
 *   `localeCompare`, placing higher / later reference numbers first.
 * - When neither amendment has a `referenceNumber`:
 *   - if `sortByVersionWhenNoReferenceNumber` is true, they are ordered by
 *     `version` in descending numerical order (missing versions are treated
 *     as 0);
 *   - otherwise, their relative order is left unchanged (stable sort).
 *
 * @param amendments - The array of amendments to sort in place.
 * @param options - Optional sorting configuration, including whether to sort
 *   by `version` when no `referenceNumber` is present.
 * @returns The same `amendments` array, sorted according to the rules above.
 */
export const sortAmendmentsByReferenceNumber = <T extends SortableAmendment>(amendments: T[], options: SortAmendmentsOptions = {}): T[] => {
  const { sortByVersionWhenNoReferenceNumber = false } = options;

  return amendments.sort((a, b) => {
    if (a.referenceNumber && b.referenceNumber) {
      return b.referenceNumber.localeCompare(a.referenceNumber);
    }
    if (a.referenceNumber && !b.referenceNumber) {
      return -1;
    }
    if (!a.referenceNumber && b.referenceNumber) {
      return 1;
    }

    if (!sortByVersionWhenNoReferenceNumber) {
      return 0;
    }

    const aVersion = typeof a.version === 'number' ? a.version : 0;
    const bVersion = typeof b.version === 'number' ? b.version : 0;

    return bVersion - aVersion;
  });
};
