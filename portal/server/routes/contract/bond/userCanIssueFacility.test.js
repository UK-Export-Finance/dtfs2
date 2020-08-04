import userCanIssueFacility from './userCanIssueFacility';

describe('userCanIssueFacility', () => {
  const mockUser = { roles: ['maker'] };

  const mockBondThatCanBeIssued = {
    bondStage: 'Unissued',
    issueFacilityDetailsSubmitted: false,
  };

  describe('when user is a maker, deal has status `Acknowledged by UKEF`, AIN submissionType and an Unissued bond that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Automatic Inclusion Notice',
        },
      };

      expect(userCanIssueFacility(mockUser, mockDeal, mockBondThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when user is a maker, deal has status `Ready for Checker\'s approval`, MIN submissionType and a Unissued bond that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Ready for Checker\'s approval',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      expect(userCanIssueFacility(mockUser, mockDeal, mockBondThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when user is NOT a maker', () => {
    it('should return false', () => {
      const checkerUser = { roles: ['checker'] };
      const mockDeal = {
        details: {
          status: 'Ready for Checker\'s approval',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      expect(userCanIssueFacility(checkerUser, mockDeal, mockBondThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when deal status is NOT `Acknowledged by UKEF` or `Ready for Checker\'s approval`', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Some other status',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      expect(userCanIssueFacility(mockUser, mockDeal, mockBondThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when deal submissionType is NOT `Automatic Inclusion Notice` or `Manual Inclusion Notice`', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Some other submission type',
        },
      };

      expect(userCanIssueFacility(mockUser, mockDeal, mockBondThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when bond.bondStage is NOT `Unissued`', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      const mockBond = {
        bondStage: 'Issued',
        issueFacilityDetailsSubmitted: false,
      };

      expect(userCanIssueFacility(mockUser, mockDeal, mockBond)).toEqual(false);
    });
  });

  describe('when bond.issueFacilityDetailsSubmitted is true', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      const mockBond = {
        bondStage: 'Unissued',
        issueFacilityDetailsSubmitted: true,
      };

      expect(userCanIssueFacility(mockUser, mockDeal, mockBond)).toEqual(false);
    });
  });
});
