import dealHasIssuedFacilities from './dealHasIssuedFacilities';

describe('dealHasIssuedFacilities', () => {
  describe('when any single bond has bond.issueFacilityDetailsProvided as true', () => {
    it('should return true', () => {
      const mockDeal = {
        bondTransactions: {
          items: [{ issueFacilityDetailsProvided: true }],
        },
        loanTransactions: {
          items: [],
        },
      };
      expect(dealHasIssuedFacilities(mockDeal)).toEqual(true);
    });
  });

  describe('when any single loan has loan.issueFacilityDetailsProvided as true', () => {
    it('should return true', () => {
      const mockDeal = {
        bondTransactions: {
          items: [],
        },
        loanTransactions: {
          items: [{ issueFacilityDetailsProvided: true }],
        },
      };
      expect(dealHasIssuedFacilities(mockDeal)).toEqual(true);
    });
  });

  describe('when no bond or loan has facility.issueFacilityDetailsProvided as true', () => {
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
