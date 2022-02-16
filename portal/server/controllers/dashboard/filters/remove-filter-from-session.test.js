import {
  sanitiseFieldValue,
  removeSessionFilter,
} from './remove-filter-from-session';

describe('controllers/dashboard/filters - remove-filter-from-session', () => {
  describe('sanitiseFieldValue', () => {
    describe('when a string boolean of true is passed', () => {
      it('should return boolean', () => {
        const result = sanitiseFieldValue('true');

        expect(result).toEqual(true);
      });
    });

    describe('when a string boolean of false is passed', () => {
      it('should return boolean', () => {
        const result = sanitiseFieldValue('false');

        expect(result).toEqual(false);
      });
    });
  });

  describe('removeSessionFilter', () => {
    it('should remove a filter from the session', () => {
      const mockReq = {
        session: {
          dashboardFilters: {
            fieldA: 'valueA',
            fieldB: 'valueB',
          },
        },
        params: {
          fieldName: 'fieldA',
          fieldValue: 'valueA',
        },
      };

      const result = removeSessionFilter(mockReq);

      const expected = {
        fieldB: 'valueB',
      };

      expect(result).toEqual(expected);
    });

    describe('when a session filter is an array', () => {
      it('should remove only one filter value from the array', () => {
        const mockReq = {
          session: {
            dashboardFilters: {
              fieldA: ['valueA', 'valueB'],
              fieldC: 'valueC',
            },
          },
          params: {
            fieldName: 'fieldA',
            fieldValue: 'valueB',
          },
        };

        const result = removeSessionFilter(mockReq);

        const expected = {
          fieldA: ['valueA'],
          fieldC: 'valueC',
        };

        expect(result).toEqual(expected);
      });

      describe('when the session filter array has only one value that is being removed', () => {
        it('should remove the filter array entirely', () => {
          const mockReq = {
            session: {
              dashboardFilters: {
                fieldA: ['valueA'],
                fieldB: true,
              },
            },
            params: {
              fieldName: 'fieldA',
              fieldValue: 'valueA',
            },
          };

          const result = removeSessionFilter(mockReq);

          const expected = {
            fieldB: true,
          };

          expect(result).toEqual(expected);
        });
      });
    });

    describe('when a session filter does not exist', () => {
      it('should return session filters without modifications', () => {
        const mockReq = {
          session: {
            dashboardFilters: {
              fieldA: 'valueA',
            },
          },
          params: {
            fieldName: 'fieldX',
            fieldValue: 'valueY',
          },
        };

        const result = removeSessionFilter(mockReq);

        const expected = mockReq.session.dashboardFilters;

        expect(result).toEqual(expected);
      });
    });
  });
});
