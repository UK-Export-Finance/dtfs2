const {
  bondStatus,
  bondHasIncompleteIssueFacilityDetails,
  addAccurateStatusesToBonds,
} = require('../../../src/v1/section-status/bonds');

describe('section-status - bond', () => {
  describe('bondStatus', () => {
    describe('when bond.status exists', () => {
      it('should return bond.status', () => {
        const mockBond = {
          status: 'Test',
        };

        const result = bondStatus(mockBond);
        expect(result).toEqual(mockBond.status);
      });
    });

    describe('when bond has no errors', () => {
      it('should return `Completed` status', () => {
        const result = bondStatus({});
        expect(result).toEqual('Completed');
      });
    });

    it('should return `Incomplete` status by default', () => {
      const mockErrors = {
        count: 1,
        errorList: [{}],
      };

      const result = bondStatus({}, mockErrors);
      expect(result).toEqual('Incomplete');
    });
  });

  describe('bondHasIncompleteIssueFacilityDetails', () => {
    const validMockBond = {
      facilityStage: 'Unissued',
      hasBeenIssued: false,
      issueFacilityDetailsSubmitted: false,
    };

    const validMockDeal = {
      status: 'Acknowledged by UKEF',
      previousStatus: 'Test',
    };

    it('should return true when deal status is allowed and issueFacilityDetailsSubmitted is false', () => {
      const mockDeals = [
        { status: 'Acknowledged by UKEF', previousStatus: 'Test' },
        { status: 'Accepted by UKEF (with conditions)', previousStatus: 'Test' },
        { status: 'Accepted by UKEF (without conditions)', previousStatus: 'Test' },
        { status: 'Ready for Checker\'s approval', previousStatus: 'Test' },
        { status: 'Submitted', previousStatus: 'Test' },
      ];

      mockDeals.forEach((deal) => {
        const result = bondHasIncompleteIssueFacilityDetails(deal.status, deal.previousStatus, validMockBond);
        expect(result).toEqual(true);
      });
    });

    it('should return false when previous deal status is `Draft`', () => {
      const mockDeal = {
        status: 'Acknowledged by UKEF',
        previousStatus: 'Draft',
      };

      const result = bondHasIncompleteIssueFacilityDetails(mockDeal.status, mockDeal.previousStatus, validMockBond);
      expect(result).toEqual(false);
    });

    it('should return false when deal status is not allowed', () => {
      const mockDeal = {
        status: 'Draft',
      };

      const result = bondHasIncompleteIssueFacilityDetails(mockDeal.status, mockDeal.previousStatus, validMockBond);
      expect(result).toEqual(false);
    });

    it('should return false when facility stage is not allowed', () => {
      const mockBond = {
        facilityStage: 'Issued',
        hasBeenIssued: true,
      };

      const result = bondHasIncompleteIssueFacilityDetails(validMockDeal.status, validMockDeal.previousStatus, mockBond);
      expect(result).toEqual(false);
    });

    it('should return false when issueFacilityDetailsSubmitted is true', () => {
      const mockBond = {
        ...validMockBond,
        issueFacilityDetailsSubmitted: true,
      };

      const result = bondHasIncompleteIssueFacilityDetails(validMockDeal.status, validMockDeal.previousStatus, mockBond);
      expect(result).toEqual(false);
    });
  });

  describe('addAccurateStatusesToBonds', () => {
    describe('when a bond in a deal has issueFacilityDetailsStarted', () => {
      it('should update bond.status from bondStatus function', () => {
        const mockBonds = [
          {
            facilityStage: 'Unissued',
            hasBeenIssued: false,
            issueFacilityDetailsStarted: false,
          },
          {
            facilityStage: 'Unissued',
            hasBeenIssued: false,
            issueFacilityDetailsStarted: true,
          },
        ];

        const mockDeal = (submissionType) => ({
          status: 'Further Maker\'s input required',
          submissionType,
          bondTransactions: {
            items: mockBonds,
          },
        });

        const mockDeals = [
          { ...mockDeal('Manual Inclusion Application') },
          { ...mockDeal('Manual Inclusion Notice') },
          { ...mockDeal('Automatic Inclusion Notice') },
        ];

        mockDeals.forEach((deal) => {
          const result = addAccurateStatusesToBonds(deal);

          const expected = bondStatus(mockBonds[1]);
          expect(result.items[1].status).toEqual(expected);
        });
      });
    });
  });
});
