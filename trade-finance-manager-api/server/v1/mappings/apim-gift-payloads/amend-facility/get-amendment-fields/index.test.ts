import { getFormattedUTCDateString } from '@ukef/dtfs2-common';
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
      coverEndDate: getFormattedUTCDateString(Number(amendment?.tfm?.coverEndDate)),
      effectiveDate: getFormattedUTCDateString(Number(amendment.effectiveDate)),
    };

    expect(result).toEqual(expected);
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
