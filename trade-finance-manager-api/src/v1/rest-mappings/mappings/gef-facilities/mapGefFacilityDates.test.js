import { isTfmFacilityEndDateFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { formatISO } from 'date-fns';

const { format } = require('date-fns');
const mapGefFacilityDates = require('./mapGefFacilityDates');
const mapCoverEndDate = require('../facilities/mapCoverEndDate');
const mapTenorDate = require('../facilities/mapTenorDate');
const { convertDateToTimestamp } = require('../../../../utils/date');

const MOCK_GEF_DEAL = require('../../../__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILITIES = require('../../../__mocks__/mock-cash-contingent-facilities');

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isTfmFacilityEndDateFeatureFlagEnabled: jest.fn(),
}));

describe('mapGefFacilityDates', () => {
  const mockFacility = {
    facilitySnapshot: {
      ...MOCK_CASH_CONTINGENT_FACILITIES[0],
      facilityStage: 'Issued',
      hasBeenIssued: true,
    },
  };

  const mockFacilityTfm = {
    exposurePeriodInMonths: 12,
  };

  it('should return inclusionNoticeReceived as deal submissionDate if manualInclusionNoticeSubmissionDate is empty', () => {
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);
    expect(result.inclusionNoticeReceived).toEqual(MOCK_GEF_DEAL.submissionDate);
  });

  it('should return manualInclusionNoticeSubmissionDate as deal submissionDate if manualInclusionNoticeSubmissionDate has a value', () => {
    const mockMinDeal = {
      ...MOCK_GEF_DEAL,
      manualInclusionNoticeSubmissionDate: '16069006199999',
    };

    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, mockMinDeal);

    expect(result.inclusionNoticeReceived).toEqual(mockMinDeal.manualInclusionNoticeSubmissionDate);
  });

  it('should return bankIssueNoticeReceived as submittedAsIssuedDate', () => {
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    expect(result.bankIssueNoticeReceived).toEqual(mockFacility.facilitySnapshot.submittedAsIssuedDate);
  });

  it('should return coverStartDate as timestamp', () => {
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    const expected = convertDateToTimestamp(mockFacility.facilitySnapshot.coverStartDate);

    expect(result.coverStartDate).toEqual(expected);
  });

  it('should return mapped coverEndDate', () => {
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    const mockCoverEndDate = new Date(mockFacility.facilitySnapshot.coverEndDate);

    const expected = mapCoverEndDate(format(mockCoverEndDate, 'dd'), format(mockCoverEndDate, 'MM'), format(mockCoverEndDate, 'yyyy'), mockFacility);

    expect(result.coverEndDate).toEqual(expected);
  });

  describe('facility end date feature flag not enabled', () => {
    beforeAll(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should not return facility end date fields', () => {
      const facilityWithEndDate = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: true,
          facilityEndDate: '2021-12-08T00:00:00.000Z',
          bankReviewDate: '2023-12-08T00:00:00.000Z',
        },
      };

      const result = mapGefFacilityDates(facilityWithEndDate, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.isUsingFacilityEndDate).toBeUndefined();
      expect(result.facilityEndDate).toBeUndefined();
      expect(result.bankReviewDate).toBeUndefined();
    });
  });

  describe('facility end date feature flag enabled', () => {
    beforeAll(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should return all facility end date fields as undefined if they are received as undefined', () => {
      const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.isUsingFacilityEndDate).toBeUndefined();
      expect(result.facilityEndDate).toBeUndefined();
      expect(result.bankReviewDate).toBeUndefined();
    });

    it('should return isUsingFacilityEndDate', () => {
      const facilityWithEndDate = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: true,
        },
      };

      const result = mapGefFacilityDates(facilityWithEndDate, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.isUsingFacilityEndDate).toEqual(facilityWithEndDate.facilitySnapshot.isUsingFacilityEndDate);
    });

    it('should return mapped facilityEndDate if isUsingFacilityEndDate is true', () => {
      const facilityEndDate = new Date(1638921600000);

      const facilityWithEndDate = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: true,
          facilityEndDate: formatISO(facilityEndDate),
        },
      };

      const result = mapGefFacilityDates(facilityWithEndDate, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.facilityEndDate).toEqual('1638921600000');
    });

    it('should not return bankReviewDate if isUsingFacilityEndDate is true', () => {
      const facilityWithEndDate = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: true,
          facilityEndDate: '2021-12-08T00:00:00.000Z',
          bankReviewDate: '2023-12-08T00:00:00.000Z',
        },
      };

      const result = mapGefFacilityDates(facilityWithEndDate, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.bankReviewDate).toBeUndefined();
    });

    it('should return mapped bankReviewDate if isUsingFacilityEndDate is false', () => {
      const bankReviewDate = new Date(1752274800000);

      const facilityWithEndDate = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: false,
          bankReviewDate: formatISO(bankReviewDate),
        },
      };

      const result = mapGefFacilityDates(facilityWithEndDate, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.bankReviewDate).toEqual('1752274800000');
    });

    it('should not return facilityEndDate if isUsingFacilityEndDate is false', () => {
      const facilityWithEndDate = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: false,
          facilityEndDate: '2021-12-08T00:00:00.000Z',
          bankReviewDate: '2023-12-08T00:00:00.000Z',
        },
      };

      const result = mapGefFacilityDates(facilityWithEndDate, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.facilityEndDate).toBeUndefined();
    });
  });

  it('should return mapped tenor', () => {
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);

    const expected = mapTenorDate(mockFacility.monthsOfCover, mockFacilityTfm.exposurePeriodInMonths);

    expect(result.tenor).toEqual(expected);
  });

  it('should not map coverStartDate when date is null', () => {
    mockFacility.facilitySnapshot.coverStartDate = null;
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);
    // undefined as not set in function
    expect(result.coverStartDate).toBeUndefined();
  });

  it('should not map coverEndDate when date is null', () => {
    mockFacility.facilitySnapshot.coverEndDate = null;
    const result = mapGefFacilityDates(mockFacility, mockFacilityTfm, MOCK_GEF_DEAL);
    // undefined as not set in function
    expect(result.coverEndDate).toBeUndefined();
  });
});
