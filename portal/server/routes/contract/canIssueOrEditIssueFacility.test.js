import canIssueOrEditIssueFacility from './canIssueOrEditIssueFacility';

describe('canIssueOrEditIssueFacility', () => {
  const mockUserRoles = ['maker'];

  const mockLoanThatCanBeIssued = {
    facilityStage: 'Conditional',
    hasBeenIssued: false,
  };

  describe('when a deal status is `Acknowledged by UKEF`, AIN submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Automatic Inclusion Notice',
        status: 'Acknowledged by UKEF',
        details: {
          submissionDate: 12345678910,
        },
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when a deal status is `Acknowledged by UKEF`, MIN submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Manual Inclusion Notice',
        status: 'Acknowledged by UKEF',
        details: {
          submissionDate: 12345678910,
        },
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when a deal status is `Accepted by UKEF (with conditions)`, MIA submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Manual Inclusion Application',
        status: 'Accepted by UKEF (with conditions)',
        details: {
          submissionDate: 12345678910,
        },
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when a deal status is `Accepted by UKEF (without conditions)`, MIA submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Manual Inclusion Application',
        status: 'Accepted by UKEF (without conditions)',
        details: {
          submissionDate: 12345678910,
        },
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when a deal status is `Further Maker\'s input required`, MIA submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Manual Inclusion Application',
        status: 'Further Maker\'s input required',
        details: {
          submissionDate: 12345678910,
        },
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when a deal status is `Acknowledged by UKEF`, AIN submissionType and a Conditional loan that has NOT been submitted with `Not started` status', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Automatic Inclusion Notice',
        status: 'Acknowledged by UKEF',
        details: {
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Conditional',
        hasBeenIssued: false,
        status: 'Not started',
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
    });
  });

  describe('when a deal status is `Further Maker\'s input required`, AIN submissionType and a Conditional loan that has NOT been submitted with `Not started` status', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Automatic Inclusion Notice',
        status: 'Further Maker\'s input required',
        details: {
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Conditional',
        hasBeenIssued: false,
        status: 'Not started',
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
    });
  });

  describe('when a deal status is `Accepted by UKEF (with conditions)`, AIN submissionType and a Conditional loan that has NOT been submitted', () => {
    const mockDeal = {
      submissionType: 'Automatic Inclusion Notice',
      status: 'Accepted by UKEF (with conditions)',
      details: {
        submissionDate: 12345678910,
      },
    };

    const mockLoan = {
      facilityStage: 'Conditional',
      hasBeenIssued: false,
    };

    describe('when the facility has `Maker\'s input required` status', () => {
      it('should return true', () => {
        mockLoan.status = 'Maker\'s input required';
        expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
      });
    });

    describe('when the facility has `Not started` status', () => {
      it('should return true', () => {
        mockLoan.status = 'Not started';
        expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
      });
    });
  });

  describe('when a deal status is `Accepted by UKEF (without conditions)`, AIN submissionType and a Conditional loan that has NOT been submitted', () => {
    const mockDeal = {
      submissionType: 'Automatic Inclusion Notice',
      status: 'Accepted by UKEF (without conditions)',
      details: {
        submissionDate: 12345678910,
      },
    };

    const mockLoan = {
      facilityStage: 'Conditional',
      hasBeenIssued: false,
    };

    describe('when the facility has `Maker\'s input required` status', () => {
      it('should return true', () => {
        mockLoan.status = 'Maker\'s input required';
        expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
      });
    });

    describe('when the facility has `Not started` status', () => {
      it('should return true', () => {
        mockLoan.status = 'Not started';
        expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
      });
    });
  });

  describe('when deal is AIN with facility.facilityStage is `Issued` with false issueFacilityDetailsSubmitted', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Automatic Inclusion Notice',
        status: 'Acknowledged by UKEF',
        details: {
          submissionDate: 12345678910,
        },
      };

      const mockBond = {
        facilityStage: 'Issued',
        hasBeenIssued: true,
        issueFacilityDetailsSubmitted: false,
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockBond)).toEqual(true);
    });
  });

  describe('when deal is AIN with facility.facilityStage is `Unissued` with false issueFacilityDetailsSubmitted', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Automatic Inclusion Notice',
        status: 'Acknowledged by UKEF',
        details: {
          submissionDate: 12345678910,
        },
      };

      const mockBond = {
        facilityStage: 'Unissued',
        hasBeenIssued: true,
        issueFacilityDetailsSubmitted: false,
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockBond)).toEqual(true);
    });
  });

  describe('when deal is AIN with facility.facilityStage is `Conditional` with false issueFacilityDetailsSubmitted', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Automatic Inclusion Notice',
        status: 'Acknowledged by UKEF',
        details: {
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Conditional',
        hasBeenIssued: false,
        issueFacilityDetailsSubmitted: false,
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
    });
  });

  describe('when deal is AIN with facility.facilityStage is `Conditional` with false issueFacilityDetailsSubmitted', () => {
    it('should return true', () => {
      const mockDeal = {
        submissionType: 'Automatic Inclusion Notice',
        status: 'Acknowledged by UKEF',
        details: {
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Conditional',
        hasBeenIssued: false,
        issueFacilityDetailsSubmitted: false,
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
    });
  });

  describe('when user is NOT a maker', () => {
    it('should return false', () => {
      const checkerUserRole = ['checker'];
      const mockDeal = {
        submissionType: 'Manual Inclusion Notice',
        status: 'Further Maker\'s input required',
        details: {
          submissionDate: 12345678910,
        },
      };

      expect(canIssueOrEditIssueFacility(checkerUserRole, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when deal status is invalid', () => {
    it('should return false', () => {
      const mockDeal = {
        submissionType: 'Manual Inclusion Notice',
        status: 'Some other status',
        details: {
          submissionDate: 12345678910,
        },
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when deal submissionType is NOT `Automatic Inclusion Notice` or `Manual Inclusion Notice`', () => {
    it('should return false', () => {
      const mockDeal = {
        submissionType: 'Some other submission type',
        status: 'Acknowledged by UKEF',
        details: {
          submissionDate: 12345678910,
        },
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when facility.facilityStage is `Unconditional`', () => {
    it('should return false', () => {
      const mockDeal = {
        submissionType: 'Manual Inclusion Notice',
        status: 'Acknowledged by UKEF',
        details: {
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Unconditional',
        hasBeenIssued: true,
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(false);
    });
  });

  describe('when facility.facilityStage is `Issued`', () => {
    it('should return false', () => {
      const mockDeal = {
        submissionType: 'Manual Inclusion Notice',
        status: 'Acknowledged by UKEF',
        details: {},
      };

      const mockBond = {
        facilityStage: 'Issued',
        hasBeenIssued: true,
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockBond)).toEqual(false);
    });
  });

  describe('when deal status is Ready for Checker\'s approval', () => {
    it('should return false', () => {
      const mockDeal = {
        submissionType: 'Automatic Inclusion Notice',
        status: 'Ready for Checker\'s approval',
        details: {
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Unconditional',
        hasBeenIssued: true,
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(false);
    });
  });

  describe('when facility status does not allow user to issue/edit issue facility', () => {
    it('should return false', () => {
      const mockDeal = {
        submissionType: 'Automatic Inclusion Notice',
        status: 'Ready for Checker\'s approval',
        details: {
          submissionDate: 12345678910,
        },
      };

      const mockBonds = [
        { facilityStage: 'Unconditional', hasBeenIssued: true, status: 'Ready for check' },
        { facilityStage: 'Unconditional', hasBeenIssued: true, status: 'Submitted' },
        { facilityStage: 'Unconditional', hasBeenIssued: true, status: 'Acknowledged' },
      ];

      mockBonds.forEach((bond) => {
        expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, bond)).toEqual(false);
      });
    });
  });

  describe('when deal.details.submissionDate does not exist', () => {
    it('should return false', () => {
      const mockDeal = {
        submissionType: 'Manual Inclusion Notice',
        status: 'Acknowledged by UKEF',
        details: {},
      };

      const mockLoan = {
        facilityStage: 'Conditional',
        hasBeenIssued: false,
      };

      expect(canIssueOrEditIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(false);
    });
  });
});
