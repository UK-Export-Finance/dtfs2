import { getFormattedDateStringInTimeZone, getFormattedUTCDateString } from '@ukef/dtfs2-common';
import { TfmFacilityAmendmentData } from '../../types';
import { getAmendmentFields } from '.';

const mockBaseAmendment: TfmFacilityAmendmentData = {
  currentValue: 100,
  value: 130,
  effectiveDate: 1704067200,
  tfm: {},
};

describe('getAmendmentFields', () => {
  const londonTimeZone = 'Europe/London';

  it('should extract and format amendment fields from TFM amendment data', () => {
    // Arrange
    const amendment: TfmFacilityAmendmentData = {
      ...mockBaseAmendment,
      tfm: {
        coverEndDate: 1706745600000,
      },
    };

    // Act
    const result = getAmendmentFields(amendment);

    // Assert
    const expected = {
      newAmount: amendment.value,
      previousAmount: amendment.currentValue,
      coverEndDate: getFormattedDateStringInTimeZone(Number(amendment?.tfm?.coverEndDate), londonTimeZone),
      effectiveDate: getFormattedUTCDateString(Number(amendment.effectiveDate)),
    };

    expect(result).toEqual(expected);
  });

  it('should not shift coverEndDate by one day when timestamp is UK midnight during BST', () => {
    // Arrange
    const amendment: TfmFacilityAmendmentData = {
      ...mockBaseAmendment,
      tfm: {
        coverEndDate: new Date('2028-06-21T00:00:00+01:00').getTime(),
      },
    };

    // Act
    const result = getAmendmentFields(amendment);

    // Assert
    const expected = '2028-06-21';

    expect(result.coverEndDate).toEqual(expected);
  });

  describe('when tfm.coverEndDate is not provided', () => {
    it('should return coverEndDate as an empty string', () => {
      // Arrange
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        tfm: {},
      };

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
      const amendment: TfmFacilityAmendmentData = {
        ...mockBaseAmendment,
        effectiveDate: null as unknown as number,
      };

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
        tfm: {
          coverEndDate: null as unknown as number,
        },
      };

      // Act
      const result = getAmendmentFields(amendment);

      // Assert
      expect(result.coverEndDate).toEqual('');
    });
  });
});
