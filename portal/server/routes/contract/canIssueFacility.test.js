import canIssueFacility from './canIssueFacility';

describe('canIssueFacility', () => {
  const mockUserRoles = ['maker'];

  const mockLoanThatCanBeIssued = {
    facilityStage: 'Conditional',
    // status: 'Not started',
  };

  describe('when a deal status is `Acknowledged by UKEF`, AIN submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Automatic Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when a deal status is `Acknowledged by UKEF`, MIN submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Manual Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when a deal status is `Accepted by UKEF (with conditions)`, MIA submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Accepted by UKEF (with conditions)',
          submissionType: 'Manual Inclusion Application',
          submissionDate: 12345678910,
        },
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when a deal status is `Accepted by UKEF (without conditions)`, MIA submissionType and a Conditional loan that has NOT been submitted', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Accepted by UKEF (without conditions)',
          submissionType: 'Manual Inclusion Application',
          submissionDate: 12345678910,
        },
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(true);
    });
  });

  describe('when a deal status is `Acknowledged by UKEF`, AIN submissionType and a Conditional loan that has NOT been submitted with `Not started` status', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Automatic Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Conditional',
        status: 'Not started',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
    });
  });

  describe('when a deal status is `Further Maker\'s input required`, AIN submissionType and a Conditional loan that has NOT been submitted with `Not started` status', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Further Maker\'s input required',
          submissionType: 'Automatic Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Conditional',
        status: 'Not started',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
    });
  });

  describe('when a deal status is `Accepted by UKEF (with conditions)`, AIN submissionType and a Conditional loan that has NOT been submitted', () => {
    const mockDeal = {
      details: {
        status: 'Accepted by UKEF (with conditions)',
        submissionType: 'Automatic Inclusion Notice',
        submissionDate: 12345678910,
      },
    };

    const mockLoan = {
      facilityStage: 'Conditional',
    };

    describe('when the facility has `Maker\'s input required` status', () => {
      it('should return true', () => {
        mockLoan.status = 'Maker\'s input required';
        expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
      });
    });

    describe('when the facility has `Not started` status', () => {
      it('should return true', () => {
        mockLoan.status = 'Not started';
        expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
      });
    });
  });

  describe('when a deal status is `Accepted by UKEF (without conditions)`, AIN submissionType and a Conditional loan that has NOT been submitted', () => {
    const mockDeal = {
      details: {
        status: 'Accepted by UKEF (without conditions)',
        submissionType: 'Automatic Inclusion Notice',
        submissionDate: 12345678910,
      },
    };

    const mockLoan = {
      facilityStage: 'Conditional',
    };

    describe('when the facility has `Maker\'s input required` status', () => {
      it('should return true', () => {
        mockLoan.status = 'Maker\'s input required';
        expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
      });
    });

    describe('when the facility has `Not started` status', () => {
      it('should return true', () => {
        mockLoan.status = 'Not started';
        expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
      });
    });
  });

  describe('when deal is AIN with facility.bondStage is `Issued` with `Unissued` previousFacilityStage', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Automatic Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      const mockBond = {
        bondStage: 'Issued',
        previousFacilityStage: 'Unissued',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockBond)).toEqual(true);
    });
  });

  describe('when deal is AIN with facility.bondStage is `Issued` with `Issued` previousFacilityStage', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Automatic Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      const mockBond = {
        bondStage: 'Issued',
        previousFacilityStage: 'Issued',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockBond)).toEqual(true);
    });
  });

  describe('when deal is AIN with facility.facilityStage is `Conditional` with `Unconditional` previousFacilityStage', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Automatic Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Conditional',
        previousFacilityStage: 'Unconditional',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
    });
  });

  describe('when deal is AIN with facility.facilityStage is `Conditional` with `Conditional` previousFacilityStage', () => {
    it('should return true', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Automatic Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Conditional',
        previousFacilityStage: 'Conditional',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(true);
    });
  });

  describe('when user is NOT a maker', () => {
    it('should return false', () => {
      const checkerUserRole = ['checker'];
      const mockDeal = {
        details: {
          status: 'Further Maker\'s input required',
          submissionType: 'Manual Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      expect(canIssueFacility(checkerUserRole, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when deal status is invalid', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Some other status',
          submissionType: 'Manual Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when deal submissionType is NOT `Automatic Inclusion Notice` or `Manual Inclusion Notice`', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Some other submission type',
          submissionDate: 12345678910,
        },
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoanThatCanBeIssued)).toEqual(false);
    });
  });

  describe('when facility.facilityStage is `Unconditional`', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Manual Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Unconditional',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(false);
    });
  });

  describe('when facility.facilityStage is `Issued`', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      const mockBond = {
        facilityStage: 'Issued',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockBond)).toEqual(false);
    });
  });

  describe('when deal status is Ready for Checker\'s approval', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Ready for Checker\'s approval',
          submissionType: 'Automatic Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      const mockLoan = {
        facilityStage: 'Unconditional',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(false);
    });
  });

  describe('when facility status does not allow user to issue/edit issue facility', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Ready for Checker\'s approval',
          submissionType: 'Automatic Inclusion Notice',
          submissionDate: 12345678910,
        },
      };

      const mockBonds = [
        { facilityStage: 'Unconditional', status: 'Ready for check' },
        { facilityStage: 'Unconditional', status: 'Submitted' },
        { facilityStage: 'Unconditional', status: 'Acknowledged' },
      ];

      mockBonds.forEach((bond) => {
        expect(canIssueFacility(mockUserRoles, mockDeal, bond)).toEqual(false);
      });
    });
  });

  describe('when deal.details.submissionDate does not exist', () => {
    it('should return false', () => {
      const mockDeal = {
        details: {
          status: 'Acknowledged by UKEF',
          submissionType: 'Manual Inclusion Notice',
        },
      };

      const mockLoan = {
        facilityStage: 'Conditional',
      };

      expect(canIssueFacility(mockUserRoles, mockDeal, mockLoan)).toEqual(false);
    });
  });
});
