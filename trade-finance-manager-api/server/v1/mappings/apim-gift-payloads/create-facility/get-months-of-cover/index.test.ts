import { DEAL_TYPE, TfmFacility } from '@ukef/dtfs2-common';
import { getCoverEndDate, getMonthsOfCover, getRequestedCoverStartDate, getTotalMonths, parseDate } from '.';

describe('parseDate', () => {
  it('should return a date for a valid ISO string', () => {
    // Act
    const result = parseDate('2024-01-15T00:00:00.000Z');

    // Assert
    expect(result).toBeInstanceOf(Date);
    expect(result?.toISOString()).toEqual('2024-01-15T00:00:00.000Z');
  });

  it('should return null for an empty value', () => {
    // Act
    const result = parseDate('');

    // Assert
    expect(result).toBeNull();
  });

  it('should return null for an invalid date value', () => {
    // Act
    const result = parseDate('not-a-date');

    // Assert
    expect(result).toBeNull();
  });
});

describe('getCoverEndDate', () => {
  it('should return coverEndDate when present as a single field', () => {
    // Arrange
    const facilitySnapshot = {
      coverEndDate: '2024-03-16T00:00:00.000Z',
    } as unknown as TfmFacility['facilitySnapshot'];

    // Act
    const result = getCoverEndDate(facilitySnapshot);

    // Assert
    expect(result?.toISOString()).toEqual('2024-03-16T00:00:00.000Z');
  });

  it('should return a date from legacy coverEndDate split fields', () => {
    // Arrange
    const facilitySnapshot = {
      'coverEndDate-day': '14',
      'coverEndDate-month': '03',
      'coverEndDate-year': '2024',
    } as unknown as TfmFacility['facilitySnapshot'];

    // Act
    const result = getCoverEndDate(facilitySnapshot);

    // Assert
    expect(result?.toISOString()).toEqual('2024-03-14T00:00:00.000Z');
  });

  it('should return null when cover end date fields cannot be resolved', () => {
    // Arrange
    const facilitySnapshot = {} as TfmFacility['facilitySnapshot'];

    // Act
    const result = getCoverEndDate(facilitySnapshot);

    // Assert
    expect(result).toBeNull();
  });
});

describe('getRequestedCoverStartDate', () => {
  it('should return requestedCoverStartDate when present as a single field', () => {
    // Arrange
    const facilitySnapshot = {
      requestedCoverStartDate: '2024-01-15T00:00:00.000Z',
    } as unknown as TfmFacility['facilitySnapshot'];

    // Act
    const result = getRequestedCoverStartDate(facilitySnapshot);

    // Assert
    expect(result?.toISOString()).toEqual('2024-01-15T00:00:00.000Z');
  });

  it('should return a date from legacy requestedCoverStartDate split fields', () => {
    // Arrange
    const facilitySnapshot = {
      'requestedCoverStartDate-day': '15',
      'requestedCoverStartDate-month': '01',
      'requestedCoverStartDate-year': '2024',
    } as unknown as TfmFacility['facilitySnapshot'];

    // Act
    const result = getRequestedCoverStartDate(facilitySnapshot);

    // Assert
    expect(result?.toISOString()).toEqual('2024-01-15T00:00:00.000Z');
  });

  it('should return null when start date fields cannot be resolved', () => {
    // Arrange
    const facilitySnapshot = {} as TfmFacility['facilitySnapshot'];

    // Act
    const result = getRequestedCoverStartDate(facilitySnapshot);

    // Assert
    expect(result).toBeNull();
  });
});

describe('getTotalMonths', () => {
  it('should include a partial final month when end day is after start day', () => {
    // Arrange
    const startDate = new Date('2024-01-15T00:00:00.000Z');
    const endDate = new Date('2024-03-16T00:00:00.000Z');

    // Act
    const result = getTotalMonths(startDate, endDate);

    // Assert
    expect(result).toEqual(3);
  });

  it('should return 1 for same-day coverage', () => {
    // Arrange
    const startDate = new Date('2024-01-15T00:00:00.000Z');
    const endDate = new Date('2024-01-15T00:00:00.000Z');

    // Act
    const result = getTotalMonths(startDate, endDate);

    // Assert
    expect(result).toEqual(1);
  });

  it('should return null when end date is before start date', () => {
    // Arrange
    const startDate = new Date('2024-03-16T00:00:00.000Z');
    const endDate = new Date('2024-01-15T00:00:00.000Z');

    // Act
    const result = getTotalMonths(startDate, endDate);

    // Assert
    expect(result).toBeNull();
  });
});

describe('getMonthsOfCover', () => {
  describe(`when deal is ${DEAL_TYPE.GEF}`, () => {
    it('should return total months using coverStartDate and coverEndDate', () => {
      // Arrange
      const facilitySnapshot = {
        coverStartDate: '2026-06-12T00:00:00.000+00:00',
        coverEndDate: '2027-05-28T00:00:00.000+00:00',
      } as unknown as TfmFacility['facilitySnapshot'];

      // Act
      const result = getMonthsOfCover({
        facilitySnapshot,
        isBssEwcsDeal: false,
        isGefDeal: true,
      });

      // Assert
      expect(result).toEqual(12);
    });

    it('should return null when coverStartDate is missing and monthsOfCover is not set', () => {
      // Arrange
      const facilitySnapshot = {
        coverEndDate: '2027-05-28T00:00:00.000+00:00',
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

    it('should fall back to monthsOfCover when coverStartDate is missing', () => {
      // Arrange — unissued GEF facility: cover dates not yet set
      const facilitySnapshot = {
        monthsOfCover: 18,
        coverEndDate: '2027-05-28T00:00:00.000+00:00',
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

    it('should fall back to monthsOfCover when coverEndDate is missing', () => {
      // Arrange — unissued GEF facility: cover dates not yet set
      const facilitySnapshot = {
        monthsOfCover: 6,
        coverStartDate: '2026-06-12T00:00:00.000+00:00',
      } as unknown as TfmFacility['facilitySnapshot'];

      // Act
      const result = getMonthsOfCover({
        facilitySnapshot,
        isBssEwcsDeal: false,
        isGefDeal: true,
      });

      // Assert
      expect(result).toEqual(6);
    });

    it('should return null when cover dates are missing and monthsOfCover is also missing', () => {
      // Arrange
      const facilitySnapshot = {} as TfmFacility['facilitySnapshot'];

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
    it('should return ukefGuaranteeInMonths when it is present and positive', () => {
      // Arrange
      const facilitySnapshot = {
        ukefGuaranteeInMonths: '9',
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
      expect(result).toEqual(9);
    });

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

    it('should support legacy requestedCoverStartDate day/month/year fields', () => {
      // Arrange
      const facilitySnapshot = {
        'requestedCoverStartDate-day': '15',
        'requestedCoverStartDate-month': '01',
        'requestedCoverStartDate-year': '2024',
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
