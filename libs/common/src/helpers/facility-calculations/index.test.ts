import { ObjectId } from 'mongodb';
import {
  calculateDrawnAmount,
  calculateFixedPercentage,
  calculateInitialUtilisation,
  calculateDaysOfCover,
  calculateFeeAmount,
  calculateGefFacilityFeeRecord,
} from '.';
import { GefFacilityType } from '../../types';
import { GEF_FACILITY_TYPE, FACILITY_UTILISATION_PERCENTAGE, CURRENCY, FACILITY_TYPE } from '../../constants';

describe('GEF drawn amount', () => {
  describe('calculateDrawnAmount', () => {
    it('should return drawn amount for cash facility type', () => {
      // Arrange
      const facilityValue = 1000;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 680;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount for contingent facility type', () => {
      // Arrange
      const facilityValue = 1000;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 560;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount with decimal points for cash facility type', () => {
      // Arrange
      const facilityValue = 100.23;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 68.1564;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount for contingent with decimal points facility type', () => {
      // Arrange
      const facilityValue = 100.23;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 56.128800000000005;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount with decimal points with a large value for cash facility type', () => {
      // Arrange
      const facilityValue = 1000000000.23;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 680000000.1564001;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount for contingent with decimal points with a large value facility type', () => {
      // Arrange
      const facilityValue = 1000000000.23;
      const coverPercentage = 80;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 560000000.1288;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return £0 as the drawn amount for cash facility type', () => {
      // Arrange
      const facilityValue = 0;
      const coverPercentage = 10;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 0;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return £0 as the drawn amount for contingent facility type', () => {
      // Arrange
      const facilityValue = 0;
      const coverPercentage = 10;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 0;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return drawn amount for other facility type', () => {
      // Arrange
      const facilityValue = 1000;
      const coverPercentage = 80;
      // @ts-ignore
      const type: GefFacilityType = 'invalid';
      const expected = 80;

      // Act
      const response = calculateDrawnAmount(facilityValue, coverPercentage, type);

      // Assert
      expect(response).toEqual(expected);
    });
  });

  describe('calculateInitialUtilisation', () => {
    it('should return initial utilisation for cash facility type', () => {
      // Arrange
      const facilityValue = 1000;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 850;

      // Act
      const response = calculateInitialUtilisation(facilityValue, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return £0 as the initial utilisation for cash facility type', () => {
      // Arrange
      const facilityValue = 0;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;
      const expected = 0;

      // Act
      const response = calculateInitialUtilisation(facilityValue, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return initial utilisation for contingent facility type', () => {
      // Arrange
      const facilityValue = 1000;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 700;

      // Act
      const response = calculateInitialUtilisation(facilityValue, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return £0 as the initial utilisation for contingent facility type', () => {
      // Arrange
      const facilityValue = 0;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;
      const expected = 0;

      // Act
      const response = calculateInitialUtilisation(facilityValue, type);

      // Assert
      expect(response).toEqual(expected);
    });

    it('should return initial utilisation for other facility type', () => {
      // Arrange
      const facilityValue = 1000;
      // @ts-ignore
      const type: GefFacilityType = 'invalid';
      const expected = 100;

      // Act
      const response = calculateInitialUtilisation(facilityValue, type);

      // Assert
      expect(response).toEqual(expected);
    });
  });

  describe('calculateFixedPercentage', () => {
    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.CASH} for facility type cash`, () => {
      // Arrange
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.CASH);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.CONTINGENT} for facility type contingent`, () => {
      // Arrange
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.CONTINGENT);
    });

    it(`should return ${FACILITY_UTILISATION_PERCENTAGE.DEFAULT} for unknown facility type`, () => {
      // Arrange
      // @ts-ignore
      const type: GefFacilityType = 'invalid';

      // Act
      const response = calculateFixedPercentage(type);

      // Assert
      expect(response).toEqual(FACILITY_UTILISATION_PERCENTAGE.DEFAULT);
    });
  });

  describe('calculateDaysOfCover', () => {
    it('should return 0 for a cash facility, when there is no difference in days', () => {
      // Arrange
      const coverStartDate = '0';
      const coverEndDate = '0';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(0);
    });

    it('should return 1 for a contingent facility, when there is no difference in days', () => {
      // Arrange
      const coverStartDate = '0';
      const coverEndDate = '0';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(1);
    });

    it('should return 0 as the difference in days is only one day for a cash facility', () => {
      // Arrange
      const coverStartDate = '0';
      const coverEndDate = '1';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(0);
    });

    it('should return 1 as the difference in days is only one day for a contingent facility', () => {
      // Arrange
      const coverStartDate = '0';
      const coverEndDate = '1';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(1);
    });

    it('should return difference in cover start and end date in days for a cash facility', () => {
      // Arrange
      const coverStartDate = '1735689600000';
      const coverEndDate = '1738195200000';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(29);
    });

    it('should return difference in cover start and end date in days for a contingent facility', () => {
      // Arrange
      const coverStartDate = '1735689600000';
      const coverEndDate = '1738195200000';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(30);
    });

    it('should return difference in cover start and end date in days when cover start date is in string format for a cash facility', () => {
      // Arrange
      const coverStartDate = '2025-01-01T00:00:00.000Z';
      const coverEndDate = '1738195200000';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(29);
    });

    it('should return difference in cover start and end date in days when cover start date is in string format for a contingent facility', () => {
      // Arrange
      const coverStartDate = '2025-01-01T00:00:00.000Z';
      const coverEndDate = '1738195200000';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(30);
    });

    it('should return difference in cover start and end date in days when cover end date is in string format for a cash facility', () => {
      // Arrange
      const coverStartDate = '1735689600000';
      const coverEndDate = '2025-01-30T00:00:00.000Z';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(29);
    });

    it('should return difference in cover start and end date in days when cover end date is in string format for a contingent facility', () => {
      // Arrange
      const coverStartDate = '1735689600000';
      const coverEndDate = '2025-01-30T00:00:00.000Z';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(30);
    });

    it('should return difference in cover start and end date in days when both dates string format for a contingent facility', () => {
      // Arrange
      const coverStartDate = '2025-01-01T00:00:00.000Z';
      const coverEndDate = '2025-01-30T00:00:00.000Z';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(30);
    });

    it('should return difference in cover start and end date in days when both dates string format for a cash facility', () => {
      // Arrange
      const coverStartDate = '2025-01-01T00:00:00.000Z';
      const coverEndDate = '2025-01-30T00:00:00.000Z';
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(29);
    });

    it('should return 0 when both cover start and end dates are null', () => {
      // Arrange
      const coverStartDate = null;
      const coverEndDate = null;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CASH;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(0);
    });

    it('should return 1 when both cover start and end dates are null for contingent', () => {
      // Arrange
      const coverStartDate = null;
      const coverEndDate = null;
      const type: GefFacilityType = GEF_FACILITY_TYPE.CONTINGENT;

      // Act
      const response = calculateDaysOfCover(type, coverStartDate, coverEndDate);

      // Assert
      expect(response).toBe(1);
    });
  });

  describe('calculateFeeAmount', () => {
    it('should calculate fee amount for 30 days of cover', () => {
      // Arrange
      const drawnAmount = 100;
      const daysOfCover = 30;
      const dayCountBasis = 365;
      const guaranteeFee = 1;

      // Act
      const response = calculateFeeAmount(drawnAmount, daysOfCover, dayCountBasis, guaranteeFee);

      // Assert
      expect(response).toBe(0.0821917808219178);
    });

    it('should calculate fee amount for 365 days cover', () => {
      // Arrange
      const drawnAmount = 1000000;
      const daysOfCover = 365;
      const dayCountBasis = 365;
      const guaranteeFee = 4;

      // Act
      const response = calculateFeeAmount(drawnAmount, daysOfCover, dayCountBasis, guaranteeFee);

      // Assert
      expect(response).toBe(40000);
    });

    it('should calculate fee amount for 365 days cover with 0 drawn amount', () => {
      // Arrange
      const drawnAmount = 0;
      const daysOfCover = 365;
      const dayCountBasis = 365;
      const guaranteeFee = 2.3;

      // Act
      const response = calculateFeeAmount(drawnAmount, daysOfCover, dayCountBasis, guaranteeFee);

      // Assert
      expect(response).toBe(0);
    });
  });

  describe('calculateGefFacilityFeeRecord', () => {
    const facility = {
      _id: new ObjectId(),
      dealId: new ObjectId(),
      type: FACILITY_TYPE.CASH,
      hasBeenIssued: true,
      name: 'facilityName',
      shouldCoverStartOnSubmission: true,
      coverStartDate: '1636379303330',
      coverEndDate: '1701388800000',
      issueDate: null,
      monthsOfCover: 12,
      details: [],
      detailsOther: '',
      currency: {
        id: CURRENCY.GBP,
      },
      value: 100000,
      coverPercentage: 80,
      guaranteeFee: 4.5,
      paymentType: 'cash',
      createdAt: new Date().getTime(),
      updatedAt: new Date().getTime(),
      ukefExposure: 80000,
      interestPercentage: 9,
      submittedAsIssuedDate: null,
      ukefFacilityId: '12345678',
      feeType: 'cash',
      feeFrequency: 'Monthly',
      dayCountBasis: 365,
      coverDateConfirmed: null,
      hasBeenIssuedAndAcknowledged: null,
      canResubmitIssuedFacilities: null,
      unissuedToIssuedByMaker: {},
    };

    it('should not calculate GEF facility fixed fee for an un-issued facility', () => {
      // Arrange
      const mockFacility = {
        ...facility,
        hasBeenIssued: false,
      };

      // Act
      const response = calculateGefFacilityFeeRecord(mockFacility);

      // Assert
      expect(response).toBe(null);
    });

    it('should calculate GEF facility fixed fee with all valid properties', () => {
      // Act
      const response = calculateGefFacilityFeeRecord(facility);

      // Assert
      expect(response).toBe(6304.438356164384);
    });

    it('should calculate GEF facility fixed fee with only 1 day difference', () => {
      // Arrange
      const mockFacility = {
        ...facility,
        coverStartDate: '0',
        coverEndDate: '1',
      };

      // Act
      const response = calculateGefFacilityFeeRecord(mockFacility);

      // Assert
      expect(response).toBe(0);
    });

    it('should calculate GEF facility fixed fee with £1.00 as a facility value', () => {
      // Arrange
      const mockFacility = {
        ...facility,
        value: 1,
        ukefExposure: 0.8,
      };

      // Act
      const response = calculateGefFacilityFeeRecord(mockFacility);

      // Assert
      expect(response).toBe(0.06304438356164384);
    });
  });
});
