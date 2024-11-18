import { FACILITY_STATUS } from '@ukef/dtfs2-common';
import { facilityItems } from './display-items';
import { MOCK_FACILITY as MOCK_FACILITIES } from './mocks/mock-facilities';
import { STAGE } from '../constants';

const MOCK_FACILITY_ONE = MOCK_FACILITIES.items[0].details;

describe('facilityItems', () => {
  describe('when the deal version is undefined', () => {
    it('should hide all the facility end date rows', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE };

      // Act
      const result = facilityItems('testUrl', facility, undefined);

      // Assert
      expect(result.find((item) => item.id === 'isUsingFacilityEndDate').isHidden).toEqual(true);
      expect(result.find((item) => item.id === 'facilityEndDate').isHidden).toEqual(true);
      expect(result.find((item) => item.id === 'bankReviewDate').isHidden).toEqual(true);
    });
  });

  describe('when the deal version is <1', () => {
    it('should hide all the facility end date rows', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE };

      // Act
      const result = facilityItems('testUrl', facility, 0);

      // Assert
      expect(result.find((item) => item.id === 'isUsingFacilityEndDate').isHidden).toEqual(true);
      expect(result.find((item) => item.id === 'facilityEndDate').isHidden).toEqual(true);
      expect(result.find((item) => item.id === 'bankReviewDate').isHidden).toEqual(true);
    });
  });

  describe('when the deal version is >=1', () => {
    it('should show the "Has a facility end date" field when isUsingFacilityEndDate is null', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, isUsingFacilityEndDate: null };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'isUsingFacilityEndDate').isHidden).toEqual(false);
    });

    it('should hide the facility end date and bank review date row when the isUsingFacilityEndDate is null', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, isUsingFacilityEndDate: null };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'facilityEndDate').isHidden).toEqual(true);
      expect(result.find((item) => item.id === 'bankReviewDate').isHidden).toEqual(true);
    });

    it('should show "Has a facility end date" and facility end date row when when isUsingFacilityEndDate is true', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, isUsingFacilityEndDate: true };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'isUsingFacilityEndDate').isHidden).toEqual(false);
      expect(result.find((item) => item.id === 'facilityEndDate').isHidden).toEqual(false);
    });

    it('should hide the bank review date row when isUsingFacilityEndDate is true', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, isUsingFacilityEndDate: true };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'bankReviewDate').isHidden).toEqual(true);
    });

    it('should show "Has a facility end date" and bank review date row when isUsingFacilityEndDate is false', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, isUsingFacilityEndDate: false };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'isUsingFacilityEndDate').isHidden).toEqual(false);
      expect(result.find((item) => item.id === 'bankReviewDate').isHidden).toEqual(false);
    });

    it('should hide facility end date row when isUsingFacilityEndDate is false', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, isUsingFacilityEndDate: false };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'facilityEndDate').isHidden).toEqual(true);
    });

    it('should format facility end date correctly', () => {
      // Arrange
      const testFacilityEndDate = '2025-09-12T00:00:00.000Z';
      const expectedFormat = '12 September 2025';
      const facility = { ...MOCK_FACILITY_ONE, facilityEndDate: testFacilityEndDate };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'facilityEndDate').method(testFacilityEndDate)).toEqual(expectedFormat);
    });

    it('should format bank review date correctly', () => {
      // Arrange
      const testBankReviewDate = '2026-08-04T00:00:00.000Z';
      const expectedFormat = '4 August 2026';
      const facility = { ...MOCK_FACILITY_ONE, bankReviewDate: testBankReviewDate };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'bankReviewDate').method(testBankReviewDate)).toEqual(expectedFormat);
    });

    it('should provide the correct URL for the "Has a facility end date" row', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, isUsingFacilityEndDate: true };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'isUsingFacilityEndDate').href).toEqual('testUrl/about-facility?status=change');
    });

    it('should provide the correct URL for the "Facility end date" row', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, isUsingFacilityEndDate: true, facilityEndDate: '2026-08-04T00:00:00.000Z' };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'facilityEndDate').href).toEqual('testUrl/facility-end-date?status=change');
    });

    it('should provide the correct URL for the "Bank review date" row', () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, isUsingFacilityEndDate: false, bankReviewDate: '2026-08-04T00:00:00.000Z' };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.id === 'bankReviewDate').href).toEqual('testUrl/bank-review-date?status=change');
    });
  });

  describe(`when the facility has status ${FACILITY_STATUS.RISK_EXPIRED}`, () => {
    it(`should show the stage as ${FACILITY_STATUS.RISK_EXPIRED}`, () => {
      // Arrange
      const status = FACILITY_STATUS.RISK_EXPIRED;
      const facility = { ...MOCK_FACILITY_ONE, status };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.label === 'Stage').method(facility.hasBeenIssued)).toEqual(status);
    });
  });

  describe(`when the facility does not have a status`, () => {
    it(`should show the stage as ${STAGE.ISSUED} if hasBeenIssued is 'true'`, () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, hasBeenIssued: 'true' };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.label === 'Stage').method(facility.hasBeenIssued)).toEqual(STAGE.ISSUED);
    });

    it(`should show the stage as ${STAGE.UNISSUED} if hasBeenIssued is 'false'`, () => {
      // Arrange
      const facility = { ...MOCK_FACILITY_ONE, hasBeenIssued: 'false' };

      // Act
      const result = facilityItems('testUrl', facility, 1);

      // Assert
      expect(result.find((item) => item.label === 'Stage').method(facility.hasBeenIssued)).toEqual(STAGE.UNISSUED);
    });
  });
});
