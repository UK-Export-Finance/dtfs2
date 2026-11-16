const CONSTANTS = require('../../constants');
const facilityLoanAmend = require('./facility-loan-amend');

const { FACILITY } = CONSTANTS;

describe('facilityLoanAmend', () => {
  const facilityMasterRecord = { maximumLiability: 200000 };

  describe('when the facility amount is being amended', () => {
    it('should return the difference between the amended amount and maximum liability', () => {
      // Arrange
      const amendment = { amount: 250000, effectiveDate: 1898252717000 };

      const facility = {
        facilitySnapshot: {
          type: FACILITY.FACILITY_TYPE.LOAN,
          feeType: FACILITY.FEE_TYPE.IN_ADVANCE,
        },
      };

      // Act
      const result = facilityLoanAmend(amendment, facility, facilityMasterRecord);

      // Assert
      const expected = {
        effectiveDate: '2030-02-25',
        amountAmendment: 50000,
      };

      expect(result).toEqual(expected);
    });

    it('should return zero amount amendment when the facility master record is missing', () => {
      // Arrange
      const amendment = { amount: 250000, effectiveDate: 1898252717000 };

      const facility = {
        facilitySnapshot: {
          type: FACILITY.FACILITY_TYPE.LOAN,
          feeType: FACILITY.FEE_TYPE.IN_ADVANCE,
        },
      };

      // Act
      const result = facilityLoanAmend(amendment, facility);

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
      // Arrange
      const amendment = { coverEndDate: 1898252717000 };

      const facility = {
        facilitySnapshot: {
          type: FACILITY.FACILITY_TYPE.LOAN,
          feeType: FACILITY.FEE_TYPE.IN_ADVANCE,
        },
      };

      // Act
      const result = facilityLoanAmend(amendment, facility, facilityMasterRecord);

      // Assert
      const expected = { expiryDate: '2030-02-25' };

      expect(result).toEqual(expected);
    });

    it('should update the next due date when fees are payable at maturity', () => {
      // Arrange
      const amendment = { coverEndDate: 1898252717000 };

      const facility = {
        facilitySnapshot: {
          type: FACILITY.FACILITY_TYPE.LOAN,
          feeType: FACILITY.FEE_TYPE.AT_MATURITY,
        },
      };

      // Act
      const result = facilityLoanAmend(amendment, facility, facilityMasterRecord);

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
      // Arrange
      const amendment = {
        amount: 250000,
        coverEndDate: 1898252717000,
        effectiveDate: 1898252717000,
      };

      const facility = {
        facilitySnapshot: {
          type: FACILITY.FACILITY_TYPE.LOAN,
          feeType: FACILITY.FEE_TYPE.AT_MATURITY,
        },
      };

      // Act
      const result = facilityLoanAmend(amendment, facility, facilityMasterRecord);

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
      const amendment = {};

      const facility = { facilitySnapshot: {} };

      // Act
      const result = facilityLoanAmend(amendment, facility, facilityMasterRecord);

      // Assert
      expect(result).toEqual({});
    });

    it('should return an empty object when the amendment is null', () => {
      // Arrange
      const facility = { facilitySnapshot: {} };

      // Act
      const result = facilityLoanAmend(null, facility, facilityMasterRecord);

      // Assert
      expect(result).toEqual({});
    });

    it('should return an empty object when the facility snapshot is missing', () => {
      // Arrange
      const amendment = { amount: 250000, coverEndDate: 1898252717000 };
      const facility = {};

      // Act
      const result = facilityLoanAmend(amendment, facility, facilityMasterRecord);

      // Assert
      expect(result).toEqual({});
    });
  });
});
