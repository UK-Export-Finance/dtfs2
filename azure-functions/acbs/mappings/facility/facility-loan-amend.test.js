const CONSTANTS = require('../../constants');
const facilityLoanAmend = require('./facility-loan-amend');

const { FACILITY } = CONSTANTS;

const facilityMasterRecord = { maximumLiability: 200000 };

const amountAmendment = { amount: 250000, effectiveDate: 1898252717000 };
const coverEndDateAmendment = { coverEndDate: 1898252717000 };
const fullAmendment = { ...amountAmendment, ...coverEndDateAmendment };

const facility = {
  facilitySnapshot: {
    type: FACILITY.FACILITY_TYPE.LOAN,
    feeType: FACILITY.FEE_TYPE.IN_ADVANCE,
  },
};

const facilityAtMaturity = {
  facilitySnapshot: {
    ...facility.facilitySnapshot,
    feeType: FACILITY.FEE_TYPE.AT_MATURITY,
  },
};

const facilityWithEmptySnapshot = { facilitySnapshot: {} };
const facilityWithoutSnapshot = {};

describe('facilityLoanAmend', () => {
  describe('when the facility amount is being amended', () => {
    it('should return the difference between the amended amount and maximum liability', () => {
      // Act
      const result = facilityLoanAmend(amountAmendment, facility, facilityMasterRecord);

      // Assert
      const expected = {
        effectiveDate: '2030-02-25',
        amountAmendment: 50000,
      };

      expect(result).toEqual(expected);
    });

    it('should return zero amount amendment when the facility master record is missing', () => {
      // Act
      const result = facilityLoanAmend(amountAmendment, facility);

      // Assert
      const expected = {
        effectiveDate: '2030-02-25',
        amountAmendment: 0,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the facility cover end date is being amended', () => {
    it('should return the expiry date without changing the next due date for fees in advance', () => {
      // Act
      const result = facilityLoanAmend(coverEndDateAmendment, facility, facilityMasterRecord);

      // Assert
      const expected = { expiryDate: '2030-02-25' };

      expect(result).toEqual(expected);
    });

    it('should update the next due date when fees are payable at maturity', () => {
      // Act
      const result = facilityLoanAmend(coverEndDateAmendment, facilityAtMaturity, facilityMasterRecord);

      // Assert
      const expected = {
        expiryDate: '2030-02-25',
        nextDueDate: '2030-02-25',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when the facility amount and cover end date are being amended', () => {
    it('should return the amount difference and updated expiry and next due dates', () => {
      // Act
      const result = facilityLoanAmend(fullAmendment, facilityAtMaturity, facilityMasterRecord);

      // Assert
      const expected = {
        effectiveDate: '2030-02-25',
        amountAmendment: 50000,
        expiryDate: '2030-02-25',
        nextDueDate: '2030-02-25',
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when no amendment fields are supplied', () => {
    it('should return an empty object for an empty amendment', () => {
      // Arrange
      const noAmendment = {};

      // Act
      const result = facilityLoanAmend(noAmendment, facilityWithEmptySnapshot, facilityMasterRecord);

      // Assert
      const expected = {};

      expect(result).toEqual(expected);
    });

    it('should return an empty object when the amendment is null', () => {
      // Act
      const result = facilityLoanAmend(null, facilityWithEmptySnapshot, facilityMasterRecord);

      // Assert
      const expected = {};

      expect(result).toEqual(expected);
    });

    it('should return an empty object when the facility snapshot is missing', () => {
      // Act
      const result = facilityLoanAmend(amountAmendment, facilityWithoutSnapshot, facilityMasterRecord);

      // Assert
      const expected = {};

      expect(result).toEqual(expected);
    });
  });
});
