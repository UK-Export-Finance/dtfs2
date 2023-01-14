const mapTenor = require('./mapTenor');
const { FACILITY_TYPE } = require('../../../../constants/facilities');

describe('mapTenor()', () => {
  const coverEndDateUnix = 1658403289;

  const mockCoverEndDate = {
    'coverEndDate-day': '01',
    'coverEndDate-month': '06',
    'coverEndDate-year': '2022',
  };

  const mockCoverStartDate = {
    'requestedCoverStartDate-year': '2022',
    'requestedCoverStartDate-month': '5',
    'requestedCoverStartDate-day': '1',
  };

  const mockGefFacility = {
    facilitySnapshot: {
      _id: '1',
      hasBeenIssued: true,
      monthsOfCover: 12,
      ukefFacilityType: FACILITY_TYPE.CASH,
    },
    tfm: {
      exposurePeriodInMonths: 12,
    },
  };

  const mockBssEwcsFacility = {
    facilitySnapshot: {
      _id: '1',
      hasBeenIssued: false,
      ukefGuaranteeInMonths: 12,
      requestedCoverStartDate: '2021-12-08T00:00:00.000Z',
      ...mockCoverEndDate,
      ...mockCoverStartDate,
      ukefFacilityType: FACILITY_TYPE.BOND,
    },
    tfm: {
    },
  };

  const mockAmendmentDateResponse = {
    amendmentExposurePeriodInMonths: 2,
  };

  it('Should return tenor from un-issued BSS/EWCS facility, when no amendment exists', () => {
    const result = mapTenor(mockBssEwcsFacility.facilitySnapshot, mockBssEwcsFacility.tfm, mockBssEwcsFacility);

    const expected = `${mockBssEwcsFacility.facilitySnapshot.ukefGuaranteeInMonths} months`;

    expect(result).toEqual(expected);
  });

  it('Should return tenor from issued BSS/EWCS facility, when no amendment exists', () => {
    const mockBssEwcsFacilityIssued = {
      ...mockBssEwcsFacility,
      tfm: {
        exposurePeriodInMonths: 21,
      },
    };

    const result = mapTenor(mockBssEwcsFacilityIssued.facilitySnapshot, mockBssEwcsFacilityIssued.tfm, mockBssEwcsFacilityIssued);

    const expected = `${mockBssEwcsFacilityIssued.tfm.exposurePeriodInMonths} months`;

    expect(result).toEqual(expected);
  });

  it('should return tenor from GEF facility when no amendment exists', () => {
    const result = mapTenor(mockGefFacility.facilitySnapshot, mockGefFacility.tfm, mockGefFacility);

    const expected = `${mockGefFacility.tfm.exposurePeriodInMonths} months`;

    expect(result).toEqual(expected);
  });

  it('should return tenor from GEF facility when no completed amendment exists', () => {
    mockGefFacility.amendments = [{
      coverEndDate: coverEndDateUnix,
    }];
    const result = mapTenor(mockGefFacility.facilitySnapshot, mockGefFacility.tfm, mockGefFacility);

    const expected = `${mockGefFacility.tfm.exposurePeriodInMonths} months`;

    expect(result).toEqual(expected);
  });

  it('should return tenor from GEF amendment when completed amendment exists', () => {
    mockGefFacility.amendments[0] = {
      tfm: {
        ...mockAmendmentDateResponse,
      },
    };
    const result = mapTenor(mockGefFacility.facilitySnapshot, mockGefFacility.tfm, mockGefFacility);

    const expected = '2 months';

    expect(result).toEqual(expected);
  });
});
