import dealHasIssuedFacilitiesToSubmit from './dealHasIssuedFacilitiesToSubmit';

describe('dealHasIssuedFacilitiesToSubmit', () => {
  describe('when any single bond has issueFacilityDetailsProvided and NOT issueFacilityDetailsSubmitted', () => {
    it('should return true', () => {
      const mockDeal = {
        bondTransactions: {
          items: [
            {
              issueFacilityDetailsProvided: true,
              issueFacilityDetailsSubmitted: false,
            },
          ],
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
          items: [
            {
              issueFacilityDetailsProvided: true,
              issueFacilityDetailsSubmitted: false,
            },
          ],
        },
      };
      expect(dealHasIssuedFacilitiesToSubmit(mockDeal)).toEqual(true);
    });
  });

  describe("when a bond has been submitted and has `Maker's input required` status", () => {
    it('should return true', () => {
      const mockDeal = {
        bondTransactions: {
          items: [{ status: "Maker's input required", issueFacilityDetailsSubmitted: true }],
        },
        loanTransactions: {
          items: [],
        },
      };
      expect(dealHasIssuedFacilitiesToSubmit(mockDeal)).toEqual(true);
    });
  });

  describe("when a loan has been submitted and has `Maker's input required` status", () => {
    it('should return true', () => {
      const mockDeal = {
        bondTransactions: {
          items: [],
        },
        loanTransactions: {
          items: [{ status: "Maker's input required", issueFacilityDetailsSubmitted: true }],
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

  describe('when bonds or loans have `Ready for Check` or Submitted status', () => {
    it('should return false', () => {
      const mockDeal = {
        bondTransactions: {
          items: [{ status: 'Ready for Check' }],
        },
        loanTransactions: {
          items: [{ status: 'Submitted' }],
        },
      };
      expect(dealHasIssuedFacilitiesToSubmit(mockDeal)).toEqual(false);
    });
  });
});
