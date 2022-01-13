const {
  loanStatus,
  loanHasIncompleteIssueFacilityDetails,
  addAccurateStatusesToLoans,
} = require('../../../src/v1/section-status/loans');

describe('section-status - loan', () => {
  describe('loanStatus', () => {
    describe('when loan.status exists', () => {
      it('should return loan.status', () => {
        const mockLoan = {
          status: 'Test',
        };

        const result = loanStatus(mockLoan);
        expect(result).toEqual(mockLoan.status);
      });
    });

    describe('when loan has no errors', () => {
      it('should return `Completed` status', () => {
        const result = loanStatus({});
        expect(result).toEqual('Completed');
      });
    });

    it('should return `Incomplete` status by default', () => {
      const mockErrors = {
        count: 1,
        errorList: [{}],
      };

      const result = loanStatus({}, mockErrors);
      expect(result).toEqual('Incomplete');
    });
  });

  describe('loanHasIncompleteIssueFacilityDetails', () => {
    const validMockLoan = {
      facilityStage: 'Conditional',
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
        const result = loanHasIncompleteIssueFacilityDetails(deal.status, deal.previousStatus, validMockLoan);
        expect(result).toEqual(true);
      });
    });

    it('should return false when previous deal status is `Draft`', () => {
      const mockDeal = {
        status: 'Acknowledged by UKEF',
        previousStatus: 'Draft',
      };

      const result = loanHasIncompleteIssueFacilityDetails(mockDeal.status, mockDeal.previousStatus, validMockLoan);
      expect(result).toEqual(false);
    });

    it('should return false when deal status is not allowed', () => {
      const mockDeal = {
        status: 'Draft',
      };

      const result = loanHasIncompleteIssueFacilityDetails(mockDeal.status, mockDeal.previousStatus, validMockLoan);
      expect(result).toEqual(false);
    });

    it('should return false when facility stage is not allowed', () => {
      const mockLoan = {
        facilityStage: 'Unconditional',
        hasBeenIssued: true,
      };

      const result = loanHasIncompleteIssueFacilityDetails(validMockDeal.status, validMockDeal.previousStatus, mockLoan);
      expect(result).toEqual(false);
    });

    it('should return false when issueFacilityDetailsSubmitted is true', () => {
      const mockLoan = {
        ...validMockLoan,
        issueFacilityDetailsSubmitted: true,
      };

      const result = loanHasIncompleteIssueFacilityDetails(validMockDeal.status, validMockDeal.previousStatus, mockLoan);
      expect(result).toEqual(false);
    });
  });

  describe('addAccurateStatusesToLoans', () => {
    describe('when a loan in a deal has issueFacilityDetailsStarted', () => {
      it('should update loan.status from loanStatus function', () => {
        const mockLoans = [
          {
            facilityStage: 'Conditional',
            hasBeenIssued: false,
            issueFacilityDetailsStarted: false,
          },
          {
            facilityStage: 'Conditional',
            hasBeenIssued: false,
            issueFacilityDetailsStarted: true,
          },
        ];

        const mockDeal = (submissionType) => ({
          status: 'Further Maker\'s input required',
          submissionType,
          loanTransactions: {
            items: mockLoans,
          },
        });

        const mockDeals = [
          { ...mockDeal('Manual Inclusion Application') },
          { ...mockDeal('Manual Inclusion Notice') },
          { ...mockDeal('Automatic Inclusion Notice') },
        ];

        mockDeals.forEach((deal) => {
          const result = addAccurateStatusesToLoans(deal);

          const expected = loanStatus(mockLoans[1]);
          expect(result.items[1].status).toEqual(expected);
        });
      });
    });
  });
});
