import dealHasIssuedFacilitiesToSubmit from './dealHasIssuedFacilitiesToSubmit';

describe('dealHasIssuedFacilitiesToSubmit', () => {
  describe('when any facility has issueFacilityDetailsProvided and NOT issueFacilityDetailsSubmitted', () => {
    it('should return true', () => {
      const mockDeal = {
        facilities: [{
          issueFacilityDetailsProvided: true,
          issueFacilityDetailsSubmitted: false,
        }],
      };
      expect(dealHasIssuedFacilitiesToSubmit(mockDeal)).toEqual(true);
    });
  });

  describe('when a facility has been submitted and has `Maker\'s input required` status', () => {
    it('should return true', () => {
      const mockDeal = {
        facilities: [
          { status: 'Maker\'s input required', issueFacilityDetailsSubmitted: true },
        ],
      };
      expect(dealHasIssuedFacilitiesToSubmit(mockDeal)).toEqual(true);
    });
  });

  describe('when no facility has facility.issueFacilityDetailsProvided', () => {
    it('should return false', () => {
      const mockDeal = {
        facilities: [{}, {}],
      };
      expect(dealHasIssuedFacilitiesToSubmit(mockDeal)).toEqual(false);
    });
  });

  describe('when facilities have `Ready for Check` or Submitted status', () => {
    it('should return false', () => {
      const mockDeal = {
        facilities: [
          { status: 'Ready for Check' },
          { status: 'Submitted' },
        ],
      };
      expect(dealHasIssuedFacilitiesToSubmit(mockDeal)).toEqual(false);
    });
  });
});
