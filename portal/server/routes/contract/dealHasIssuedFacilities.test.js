import dealHasIssuedFacilities from './dealHasIssuedFacilities';

describe('dealHasIssuedFacilities', () => {
  describe('when any single bond has bond.facilityIssued as true', () => {
    it('should return true', () => {
      const mockDeal = {
        bondTransactions: {
          items: [{ facilityIssued: true }],
        },
        loanTransactions: {
          items: [],
        },
      };
      expect(dealHasIssuedFacilities(mockDeal)).toEqual(true);
    });
  });

  describe('when any single loan has loan.facilityIssued as true', () => {
    it('should return true', () => {
      const mockDeal = {
        bondTransactions: {
          items: [],
        },
        loanTransactions: {
          items: [{ facilityIssued: true }],
        },
      };
      expect(dealHasIssuedFacilities(mockDeal)).toEqual(true);
    });
  });

  describe('when no bond or loan has facility.facilityIssued as true', () => {
    it('should return false', () => {
      const mockDeal = {
        bondTransactions: {
          items: [{}, {}],
        },
        loanTransactions: {
          items: [{}, {}],
        },
      };
      expect(dealHasIssuedFacilities(mockDeal)).toEqual(false);
    });
  });
});
