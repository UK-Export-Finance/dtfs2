import { DEAL_TYPE, TfmFacility } from '@ukef/dtfs2-common';
import { getMonthsOfCover } from '.';

const mockFacilitySnapshot = {
  monthsOfCover: 12,
} as unknown as TfmFacility['facilitySnapshot'];

describe('getMonthsOfCover', () => {
  describe(`when deal is ${DEAL_TYPE.GEF}`, () => {
    it('should return monthsOfCover from the facility snapshot', () => {
      // Arrange
      const facilitySnapshot = {
        ...mockFacilitySnapshot,
        monthsOfCover: 18,
      } as unknown as TfmFacility['facilitySnapshot'];

      // Act
      const result = getMonthsOfCover({
        facilitySnapshot,
        isBssEwcsDeal: false,
        isGefDeal: true,
      });

      // Assert
      expect(result).toEqual(18);
    });

    it('should return null when monthsOfCover is missing', () => {
      // Arrange
      const facilitySnapshot = {
        ...mockFacilitySnapshot,
        monthsOfCover: null,
      } as unknown as TfmFacility['facilitySnapshot'];

      // Act
      const result = getMonthsOfCover({
        facilitySnapshot,
        isBssEwcsDeal: false,
        isGefDeal: true,
      });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe(`when deal is ${DEAL_TYPE.BSS_EWCS}`, () => {
    it('should return total months using requestedCoverStartDate and coverEndDate', () => {
      // Arrange
      const facilitySnapshot = {
        requestedCoverStartDate: '2024-01-15T00:00:00.000Z',
        coverEndDate: '2024-03-16T00:00:00.000Z',
      } as unknown as TfmFacility['facilitySnapshot'];

      // Act
      const result = getMonthsOfCover({
        facilitySnapshot,
        isBssEwcsDeal: true,
        isGefDeal: false,
      });

      // Assert
      expect(result).toEqual(3);
    });

    it('should support legacy coverEndDate day/month/year fields', () => {
      // Arrange
      const facilitySnapshot = {
        requestedCoverStartDate: '2024-01-15T00:00:00.000Z',
        'coverEndDate-day': '14',
        'coverEndDate-month': '03',
        'coverEndDate-year': '2024',
      } as unknown as TfmFacility['facilitySnapshot'];

      // Act
      const result = getMonthsOfCover({
        facilitySnapshot,
        isBssEwcsDeal: true,
        isGefDeal: false,
      });

      // Assert
      expect(result).toEqual(2);
    });

    it('should return null when requestedCoverStartDate is missing', () => {
      // Arrange
      const facilitySnapshot = {
        coverEndDate: '2024-03-16T00:00:00.000Z',
      } as unknown as TfmFacility['facilitySnapshot'];

      // Act
      const result = getMonthsOfCover({
        facilitySnapshot,
        isBssEwcsDeal: true,
        isGefDeal: false,
      });

      // Assert
      expect(result).toBeNull();
    });
  });
});
