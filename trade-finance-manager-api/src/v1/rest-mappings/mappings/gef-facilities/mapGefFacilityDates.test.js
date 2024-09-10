import { AMENDMENT_STATUS, isTfmFacilityEndDateFeatureFlagEnabled } from '@ukef/dtfs2-common';

const { format } = require('date-fns');
const mapGefFacilityDates = require('./mapGefFacilityDates');
const mapCoverEndDate = require('../facilities/mapCoverEndDate');
const mapTenorDate = require('../facilities/mapTenorDate');
const { convertDateToTimestamp } = require('../../../../utils/date');

const MOCK_GEF_DEAL = require('../../../__mocks__/mock-gef-deal');
const MOCK_CASH_CONTINGENT_FACILITIES = require('../../../__mocks__/mock-cash-contingent-facilities');

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

  describe('when Facility end date feature flag not enabled', () => {
    beforeAll(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(false);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should not return facility end date fields when part of the facility snapshot', () => {
      const facilityWithFEDinformation = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: true,
          facilityEndDate: new Date('2025-08-12'),
          bankReviewDate: new Date('2025-07-12'),
        },
      };

      const result = mapGefFacilityDates(facilityWithFEDinformation, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.isUsingFacilityEndDate).toBeUndefined();
      expect(result.facilityEndDate).toBeUndefined();
      expect(result.bankReviewDate).toBeUndefined();
    });

    it('should not return facility end date fields when featured in an amendment', () => {
      const facilityWithAmendments = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
        },
        amendments: [
          {
            updatedAt: 1723641632,
            version: 1,
            status: AMENDMENT_STATUS.COMPLETED,
            tfm: {
              coverEndDate: 1723641632,
              isUsingFacilityEndDate: false,
              facilityEndDate: new Date('2025-08-12'),
              bankReviewDate: new Date('2025-07-12'),
            },
          },
        ],
      };

      const result = mapGefFacilityDates(facilityWithAmendments, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.isUsingFacilityEndDate).toBeUndefined();
      expect(result.facilityEndDate).toBeUndefined();
      expect(result.bankReviewDate).toBeUndefined();
    });
  });

  describe('when Facility end date feature flag is enabled', () => {
    beforeAll(() => {
      jest.mocked(isTfmFacilityEndDateFeatureFlagEnabled).mockReturnValue(true);
    });

    afterAll(() => {
      jest.resetAllMocks();
    });

    it('should return all facility end date fields as undefined if they are undefined in the snapshot and no amendment has been made to them', () => {
      const facilityWithAmendments = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: undefined,
          bankReviewDate: undefined,
          facilityEndDate: undefined,
        },
        amendments: [
          {
            updatedAt: 1723641632,
            version: 1,
            status: AMENDMENT_STATUS.COMPLETED,
            tfm: {
              coverEndDate: 1723641632,
            },
          },
        ],
      };

      const result = mapGefFacilityDates(facilityWithAmendments, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.isUsingFacilityEndDate).toBeUndefined();
      expect(result.facilityEndDate).toBeUndefined();
      expect(result.bankReviewDate).toBeUndefined();
    });

    it('should return isUsingFacilityEndDate from the snapshot if no amendment has been made to it', () => {
      const facilityWithAmendments = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: true,
        },
        amendments: [
          {
            updatedAt: 1723641632,
            version: 1,
            status: AMENDMENT_STATUS.COMPLETED,
            tfm: {
              coverEndDate: 1723641632,
            },
          },
        ],
      };

      const result = mapGefFacilityDates(facilityWithAmendments, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.isUsingFacilityEndDate).toEqual(true);
    });

    it('should return facilityEndDate from the snapshot if no amendment has been made to it', () => {
      const facilityWithAmendments = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: true,
          facilityEndDate: new Date('2025-4-3'),
        },
        amendments: [
          {
            updatedAt: 1723641632,
            version: 1,
            status: AMENDMENT_STATUS.COMPLETED,
            tfm: {
              coverEndDate: 1723641632,
            },
          },
        ],
      };

      const result = mapGefFacilityDates(facilityWithAmendments, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.facilityEndDate).toEqual(new Date('2025-4-3'));
    });

    it('should return bankReviewDate from the snapshot if no amendment has been made to it', () => {
      const facilityWithAmendments = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: false,
          bankReviewDate: new Date('2025-4-7'),
        },
        amendments: [
          {
            updatedAt: 1723641632,
            version: 1,
            status: AMENDMENT_STATUS.COMPLETED,
            tfm: {
              coverEndDate: 1723641632,
            },
          },
        ],
      };

      const result = mapGefFacilityDates(facilityWithAmendments, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.bankReviewDate).toEqual(new Date('2025-4-7'));
    });

    it('should return the facility end date values from the most recent amendment if it has been amended', () => {
      const facilityWithAmendments = {
        facilitySnapshot: {
          ...mockFacility.facilitySnapshot,
          isUsingFacilityEndDate: false,
          bankReviewDate: new Date('2025-4-7'),
        },
        amendments: [
          {
            updatedAt: 1723641632,
            version: 1,
            status: AMENDMENT_STATUS.COMPLETED,
            tfm: {
              coverEndDate: 1723641632,
              isUsingFacilityEndDate: true,
              facilityEndDate: new Date('2026-4-7'),
            },
          },
          {
            updatedAt: 1723641640,
            version: 2,
            status: AMENDMENT_STATUS.COMPLETED,
            tfm: {
              coverEndDate: 1723641640,
            },
          },
        ],
      };

      const result = mapGefFacilityDates(facilityWithAmendments, mockFacilityTfm, MOCK_GEF_DEAL);

      expect(result.isUsingFacilityEndDate).toEqual(true);
      expect(result.facilityEndDate).toEqual(new Date('2026-4-7'));
      expect(result.bankReviewDate).toEqual(undefined);
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
