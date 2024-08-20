const getMaximumLiability = require('./get-maximum-liability');

describe('getMaximumLiability', () => {
  describe('when formatting the input', () => {
    it('transforms a string into a number', () => {
      const facility = {
        amendment: {
          amount: '789',
        },
      };

      const result = getMaximumLiability(facility);
      expect(result).toEqual(789);
    });
    it('transforms a string with commas into a number', () => {
      const facility = {
        amendment: {
          amount: '78,910',
        },
      };

      const result = getMaximumLiability(facility);
      expect(result).toEqual(78910);
    });
  });

  describe('if the value is the overall amount being loaned by the bank', () => {
    describe('when the facility snapshot is present', () => {
      const facility = {
        facilitySnapshot: {
          value: 123,
          ukefExposure: 456,
        },
        amendment: {
          amount: 789,
        },
      };

      it('returns the snapshot value', () => {
        const result = getMaximumLiability(facility, true);
        expect(result).toEqual(123);
      });
    });

    describe('when the facility snapshot is not present', () => {
      describe('if the facility has an amendment', () => {
        const facility = {
          amendment: {
            amount: 789,
          },
        };
        it('returns the amendment amount', () => {
          const result = getMaximumLiability(facility, true);
          expect(result).toEqual(789);
        });
      });

      describe('if the facility does not have an amendment', () => {
        const facility = {};
        it('returns 0', () => {
          const result = getMaximumLiability(facility, true);
          expect(result).toEqual(0);
        });
      });
    });
  });

  describe('if the value is not the overall amount being loaned by the bank', () => {
    describe('when the facility snapshot is present', () => {
      const facility = {
        facilitySnapshot: {
          value: 123,
          ukefExposure: 456,
        },
        amendment: {
          amount: 789,
        },
      };

      it('returns the snapshot ukef exposure', () => {
        const result = getMaximumLiability(facility, false);
        expect(result).toEqual(456);
      });
    });

    describe('when the facility snapshot is not present', () => {
      describe('if the facility has an amendment', () => {
        const facility = {
          amendment: {
            amount: 789,
          },
        };
        it('returns the amendment amount', () => {
          const result = getMaximumLiability(facility, false);
          expect(result).toEqual(789);
        });
      });

      describe('if the facility does not have an amendment', () => {
        const facility = {};
        it('returns 0', () => {
          const result = getMaximumLiability(facility, false);
          expect(result).toEqual(0);
        });
      });
    });
  });
});
