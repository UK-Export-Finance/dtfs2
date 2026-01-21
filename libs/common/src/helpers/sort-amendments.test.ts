import { sortAmendmentsByReferenceNumber } from './sort-amendments';

type TestAmendment = {
  referenceNumber?: string | null;
  version?: number | null;
};

describe('sortAmendmentsByReferenceNumber', () => {
  describe('sorting by reference number', () => {
    it('should sort amendments by referenceNumber in descending order', () => {
      const amendments: TestAmendment[] = [{ referenceNumber: '001' }, { referenceNumber: '010' }, { referenceNumber: '002' }];

      const result = sortAmendmentsByReferenceNumber(amendments);

      expect(result).toEqual([{ referenceNumber: '010' }, { referenceNumber: '002' }, { referenceNumber: '001' }]);
    });

    it('should place amendments without referenceNumber after those with referenceNumber', () => {
      const amendments: TestAmendment[] = [{ referenceNumber: null }, { referenceNumber: '002' }, {}, { referenceNumber: '003' }];

      const result = sortAmendmentsByReferenceNumber(amendments);

      expect(result.map((a) => a.referenceNumber)).toEqual(['003', '002', null, undefined]);
    });
  });

  describe('sorting by version when no reference number', () => {
    it('should leave relative order unchanged when sortByVersionWhenNoReferenceNumber is false', () => {
      const amendments: TestAmendment[] = [
        { referenceNumber: null, version: 1 },
        { referenceNumber: null, version: 3 },
        { referenceNumber: null, version: 2 },
      ];

      const result = sortAmendmentsByReferenceNumber(amendments, {
        sortByVersionWhenNoReferenceNumber: false,
      });

      expect(result).toEqual([
        { referenceNumber: null, version: 1 },
        { referenceNumber: null, version: 3 },
        { referenceNumber: null, version: 2 },
      ]);
    });

    it('should sort by version descending when sortByVersionWhenNoReferenceNumber is true and no referenceNumber present', () => {
      const amendments: TestAmendment[] = [
        { referenceNumber: null, version: 1 },
        { referenceNumber: null, version: 3 },
        { referenceNumber: null, version: 2 },
        { referenceNumber: null },
      ];

      const result = sortAmendmentsByReferenceNumber(amendments, {
        sortByVersionWhenNoReferenceNumber: true,
      });

      expect(result.map((a) => a.version)).toEqual([3, 2, 1, undefined]);
    });

    it('should only apply version ordering to amendments without referenceNumber', () => {
      const amendments: TestAmendment[] = [
        { referenceNumber: '001', version: 1 },
        { referenceNumber: null, version: 1 },
        { referenceNumber: '003', version: 2 },
        { referenceNumber: null, version: 3 },
      ];

      const result = sortAmendmentsByReferenceNumber(amendments, {
        sortByVersionWhenNoReferenceNumber: true,
      });

      // First, ordered by referenceNumber descending
      expect(result.map((a) => a.referenceNumber)).toEqual(['003', '001', null, null]);
      // Then, items without referenceNumber ordered by version descending
      expect(result[2]).toEqual({ referenceNumber: null, version: 3 });
      expect(result[3]).toEqual({ referenceNumber: null, version: 1 });
    });
  });
});
