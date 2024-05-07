import { submittedFiltersArray, submittedFiltersObject, formatFieldValue, filtersToText } from './helpers';

describe('controllers/dashboard/filters - helpers', () => {
  describe('submittedFiltersArray', () => {
    describe('when submittedFilters object has a field with single value', () => {
      it('should return an array of objects with the single value in an array', () => {
        const mockSubmittedFilters = {
          dealType: 'GEF',
        };

        const result = submittedFiltersArray(mockSubmittedFilters);

        const expected = [{ dealType: [mockSubmittedFilters.dealType] }];

        expect(result).toEqual(expected);
      });
    });

    describe('when submittedFilters object has a field value of false', () => {
      it('should return an array of objects with the single value in an array', () => {
        const mockSubmittedFilters = {
          hasBeenIssued: false,
        };

        const result = submittedFiltersArray(mockSubmittedFilters);

        const expected = [{ hasBeenIssued: [false] }];

        expect(result).toEqual(expected);
      });
    });

    describe('when submittedFilters object has a field with multiple values', () => {
      it('should return an array of objects with the values in an array', () => {
        const mockSubmittedFilters = {
          dealType: ['GEF', 'BSS/EWCS'],
        };

        const result = submittedFiltersArray(mockSubmittedFilters);

        const expected = [{ dealType: [...mockSubmittedFilters.dealType] }];

        expect(result).toEqual(expected);
      });
    });

    describe('when submittedFilters object has multiple fields with single and multiple values', () => {
      it('should return an array of objects with all values in an array', () => {
        const mockSubmittedFilters = {
          dealType: ['GEF', 'BSS/EWCS'],
          submissionType: 'Automatic Inclusion Notice',
        };

        const result = submittedFiltersArray(mockSubmittedFilters);

        const expected = [
          { dealType: [...mockSubmittedFilters.dealType] },
          { submissionType: [mockSubmittedFilters.submissionType] },
        ];

        expect(result).toEqual(expected);
      });
    });

    describe('when there are no submitted filters', () => {
      it('should return an empty array', () => {
        const result = submittedFiltersArray({});
        expect(result).toEqual([]);
      });
    });
  });

  describe('submittedFiltersObject', () => {
    it('should return mapped object from provided array', () => {
      const mockFiltersArray = [
        {
          submissionType: ['Manual Inclusion Application', 'Manual Inclusion Notice'],
        },
        {
          dealType: ['GEF'],
        },
      ];

      const result = submittedFiltersObject(mockFiltersArray);

      const expected = {
        submissionType: mockFiltersArray[0].submissionType,
        dealType: mockFiltersArray[1].dealType,
      };

      expect(result).toEqual(expected);
    });

    describe('when filtersArray is empty', () => {
      it('should return empty object', () => {
        const result = submittedFiltersObject([]);

        expect(result).toEqual({});
      });
    });
  });

  describe('formatFieldValue', () => {
    it('replaces white spaces and slashes with a hyphen, and removes single quotes', () => {
      const mockValue = "Ready for Checker's Approval BSS/EWCS";
      const expected = 'Ready-for-Checkers-Approval-BSS-EWCS';
      expect(formatFieldValue(mockValue)).toEqual(expected);
    });

    it('handles boolean values', () => {
      expect(formatFieldValue(true)).toBe('true');
      expect(formatFieldValue(false)).toBe('false');
    });

    it('returns null for null or undefined values', () => {
      expect(formatFieldValue(null)).toBe(null);
      expect(formatFieldValue(undefined)).toBe(null);
    });

    it('returns null for empty string', () => {
      expect(formatFieldValue('')).toBe(null);
    });

    it('returns null for numeric zero', () => {
      expect(formatFieldValue(0)).toBe(null);
    });

    it('handles numeric non-zero values', () => {
      expect(formatFieldValue(123)).toBe('123');
    });

    it('handles NaN values', () => {
      expect(formatFieldValue(NaN)).toBe(null);
    });
  });

  describe('filtersToText()', () => {
    it('returns aria label with none if empty filters array passed', () => {
      const result = filtersToText([]);

      const expected = 'Filters selected: none';

      expect(result).toEqual(expected);
    });

    it('returns aria label with filters selected if user adds filters on dashboard', () => {
      const filters = [
        {
          heading: { text: 'Product' },
          items: [
            {
              text: 'BSS/EWCS',
              href: 'filters/remove/dealType/BSS-EWCS',
              formattedValue: 'BSS-EWCS',
            },
          ],
        },
        {
          heading: { text: 'Notice Type' },
          items: [
            {
              text: 'Automatic Inclusion Notice',
              href: 'filters/remove/dealType/BSS-EWCS',
              formattedValue: 'BSS-EWCS',
            },
          ],
        },
        {
          heading: { text: 'Status' },
          items: [
            {
              text: 'Draft',
              href: 'filters/remove/status/Draft',
              formattedValue: 'Draft',
            },
          ],
        },
      ];
      const result = filtersToText(filters);

      const expected =
        'Filters selected: , Product: , BSS/EWCS, Notice Type: , Automatic Inclusion Notice, Status: , Draft';

      expect(result).toEqual(expected);
    });
  });
});
