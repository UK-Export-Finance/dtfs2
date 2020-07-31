import dealHasIssuedFacilitiesToSubmit from './dealHasIssuedFacilitiesToSubmit';

describe('dealHasIssuedFacilitiesToSubmit', () => {
  describe('when any single bond has issueFacilityDetailsProvided and NOT issueFacilityDetailsSubmitted', () => {
    it('should return true', () => {
      const mockDeal = {
        bondTransactions: {
          items: [{
            issueFacilityDetailsProvided: true,
            issueFacilityDetailsSubmitted: false,
          }],
        },
        loanTransactions: {
          items: [],
        },
      };
      expect(dealHasIssuedFacilitiesToSubmit(mockDeal)).toEqual(true);
    });
  });

  describe('when any single loan has issueFacilityDetailsProvided and NOT issueFacilityDetailsSubmitted', () => {
    it('should return true', () => {
      const mockDeal = {
        bondTransactions: {
          items: [],
        },
        loanTransactions: {
          items: [{
            issueFacilityDetailsProvided: true,
            issueFacilityDetailsSubmitted: false,
          }],
        },
      };
      expect(dealHasIssuedFacilitiesToSubmit(mockDeal)).toEqual(true);
    });
  });

  describe('when no bond or loan has facility.issueFacilityDetailsProvided', () => {
    it('should return false', () => {
      const mockDeal = {
        bondTransactions: {
          items: [{}, {}],
        },
        loanTransactions: {
          items: [{}, {}],
        },
      };
      expect(dealHasIssuedFacilitiesToSubmit(mockDeal)).toEqual(false);
    });
  });
});
