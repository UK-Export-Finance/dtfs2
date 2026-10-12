import { getFormattedDateStringInTimeZone, TIMEZONE } from '@ukef/dtfs2-common';
import { TfmFacilityAmendmentData } from '../../types';
import { getAmendmentFields } from '.';

const mockBaseAmendment: TfmFacilityAmendmentData = {
  currentValue: 100,
  value: 130,
  effectiveDate: 1704067200,
  tfm: {},
};

describe('getAmendmentFields', () => {
  it('should extract and format amendment fields from TFM amendment data', () => {
    // Arrange
    const amendment: TfmFacilityAmendmentData = {
      ...mockBaseAmendment,
      coverEndDate: 1706745600000,
    };

    // Act
    const result = getAmendmentFields(amendment);

    // Assert
    const expected = {
      newAmount: amendment.value,
      previousAmount: amendment.currentValue,
      coverEndDate: getFormattedDateStringInTimeZone(Number(amendment.coverEndDate), TIMEZONE.DEFAULT),
      effectiveDate: getFormattedDateStringInTimeZone(Number(amendment.effectiveDate), TIMEZONE.DEFAULT),
      coveredPercentage: null,
    };

    expect(result).toEqual(expected);
  });

  it('should not shift coverEndDate by one day when timestamp is UK midnight during BST', () => {
    // Arrange
    const amendment: TfmFacilityAmendmentData = {
      ...mockBaseAmendment,
      coverEndDate: new Date('2028-06-21T00:00:00+01:00').getTime(),
    };

    // Act
    const result = getAmendmentFields(amendment);

    // Assert
    const expected = '2028-06-21';

    expect(result.coverEndDate).toEqual(expected);
  });

  describe('when the timestamp is UK midnight during BST', () => {
    it('should not shift effectiveDate by one day', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        effectiveDate: new Date('2026-08-11T00:00:00+01:00').getTime() / 1000,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      const expected = '2026-08-11';

      expect(result.effectiveDate).toEqual(expected);
    });
  });

  describe('when coverEndDate is not provided', () => {
    it('should return coverEndDate as an empty string', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = mockBaseAmendment;

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.coverEndDate).toEqual('');
    });
  });

  describe('when value is not a number', () => {
    it('should return newAmount as NaN when value is undefined', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        value: undefined,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.newAmount).toBeNaN();
    });

    it('should return newAmount as NaN when value is null', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        value: null,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.newAmount).toBeNaN();
    });
  });

  describe('when currentValue is not a number', () => {
    it('should return previousAmount as NaN when currentValue is undefined', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        currentValue: undefined,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.previousAmount).toBeNaN();
    });

    it('should return previousAmount as NaN when currentValue is null', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        currentValue: null,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.previousAmount).toBeNaN();
    });
  });

  describe('when effectiveDate is not provided', () => {
    it('should return effectiveDate as an empty string', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        effectiveDate: undefined,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.effectiveDate).toEqual('');
    });
  });

  describe('when effectiveDate is null', () => {
    it('should return effectiveDate as an empty string', () => {
      // Arrange
      const amendment = {
        ...mockBaseAmendment,
        effectiveDate: null,
      } as unknown as TfmFacilityAmendmentData;

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.effectiveDate).toEqual('');
    });
  });

  describe('when tfm.coverEndDate is null', () => {
    it('should return coverEndDate as an empty string', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        coverEndDate: null,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.coverEndDate).toEqual('');
    });
  });

  describe('when coveredPercentage is provided', () => {
    it('should return coveredPercentage as a number', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        coveredPercentage: 80,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.coveredPercentage).toEqual(80);
    });
  });

  describe('when coveredPercentage is not a number', () => {
    it('should return coveredPercentage as null when undefined', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        coveredPercentage: undefined,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.coveredPercentage).toBeNull();
    });

    it('should return coveredPercentage as null when null', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        coveredPercentage: null,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.coveredPercentage).toBeNull();
    });

    it('should return coveredPercentage as null when a string', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        coveredPercentage: '80' as unknown as number,
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.coveredPercentage).toBeNull();
    });
  });
});
