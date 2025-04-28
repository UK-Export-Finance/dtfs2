import { PORTAL_AMENDMENT_STATUS, ROLES, isPortalFacilityAmendmentsFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { dashboardDealsFiltersQuery } from './deals-filters-query';
import { STATUS, SUBMISSION_TYPE, FIELD_NAMES, ALL_BANKS_ID } from '../../../constants';
import CONTENT_STRINGS from '../../../content-strings';
import keywordQuery from './deals-filters-keyword-query';
import getCheckersApprovalAmendmentDealIds from '../../../helpers/getCheckersApprovalAmendmentDealIds';

jest.mock('../../../helpers/getCheckersApprovalAmendmentDealIds');

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  isPortalFacilityAmendmentsFeatureFlagEnabled: jest.fn(),
}));

const { MAKER, CHECKER } = ROLES;

describe('controllers/dashboard/deals - filters query', () => {
  const mockUser = {
    _id: '123',
    roles: [MAKER],
    bank: { id: '9' },
  };

  it('should return bank.id filter', async () => {
    // Arrange
    const mockFilters = [];
    const expected = {
      AND: [{ 'bank.id': mockUser.bank.id }],
    };

    // Act
    const result = await dashboardDealsFiltersQuery(mockFilters, mockUser);

    // Assert
    expect(result).toEqual(expected);
  });

  describe('when createdByYou is true', () => {
    it('should return maker._id filter', async () => {
      // Arrange
      const mockFilters = [{ [FIELD_NAMES.DEAL.CREATED_BY]: ['Created by you'] }];
      const expected = {
        AND: [{ 'bank.id': mockUser.bank.id }, { 'maker._id': mockUser._id }],
      };

      // Act
      const result = await dashboardDealsFiltersQuery(mockFilters, mockUser);

      // Assert
      expect(result).toEqual(expected);
    });

    it('should return maker._id filter and other filters if many selected', async () => {
      // Arrange
      const mockFilters = [
        { [FIELD_NAMES.DEAL.DEAL_TYPE]: ['BSS', 'EWCS'] },
        { [FIELD_NAMES.DEAL.SUBMISSION_TYPE]: [SUBMISSION_TYPE.AIN] },
        { [FIELD_NAMES.DEAL.CREATED_BY]: ['Created by you'] },
      ];

      const expected = {
        AND: [
          { 'bank.id': mockUser.bank.id },
          {
            OR: [{ [FIELD_NAMES.DEAL.DEAL_TYPE]: mockFilters[0].dealType[0] }, { [FIELD_NAMES.DEAL.DEAL_TYPE]: mockFilters[0].dealType[1] }],
          },
          {
            OR: [{ [FIELD_NAMES.DEAL.SUBMISSION_TYPE]: mockFilters[1].submissionType[0] }],
          },
          { 'maker._id': mockUser._id },
        ],
      };

      // Act
      const result = await dashboardDealsFiltersQuery(mockFilters, mockUser);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('when user is a checker', () => {
    it(`should return ${STATUS.DEAL.READY_FOR_APPROVAL} filter`, async () => {
      // Arrange
      const mockFilters = [];
      mockUser.roles = [CHECKER];
      const mockDealIds = [];
      const expected = {
        AND: [
          { 'bank.id': mockUser.bank.id },
          {
            OR: [{ status: STATUS.DEAL.READY_FOR_APPROVAL }],
          },
        ],
      };

      getCheckersApprovalAmendmentDealIds.mockResolvedValue(mockDealIds);

      // Act
      const result = await dashboardDealsFiltersQuery(mockFilters, mockUser);

      // Assert
      expect(result).toEqual(expected);
    });

    it(`should only return deals with status ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL} filter when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is disabled`, async () => {
      // Arrange
      const mockFilters = [];
      mockUser.roles = [CHECKER];
      const mockDealIds = ['deal1', 'deal2'];
      const expected = {
        AND: [
          { 'bank.id': mockUser.bank.id },
          {
            OR: [{ status: STATUS.DEAL.READY_FOR_APPROVAL }],
          },
        ],
      };

      getCheckersApprovalAmendmentDealIds.mockResolvedValue(mockDealIds);
      jest.mocked(isPortalFacilityAmendmentsFeatureFlagEnabled).mockReturnValueOnce(false);

      // Act
      const result = await dashboardDealsFiltersQuery(mockFilters, mockUser);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  describe('when user is a super user', () => {
    it('should not return any filters', async () => {
      // Arrange
      const mockFilters = [];
      mockUser.bank.id = ALL_BANKS_ID;
      mockUser.roles = [];
      const expected = {};

      // Act
      const result = await dashboardDealsFiltersQuery(mockFilters, mockUser);

      // Assert
      expect(result).toEqual(expected);
    });
  });

  it('should add multiple custom filters to the query', async () => {
    // Arrange
    const mockKeyword = 'test';
    const mockFilters = [
      { [FIELD_NAMES.DEAL.DEAL_TYPE]: ['BSS', 'EWCS'] },
      { [FIELD_NAMES.DEAL.SUBMISSION_TYPE]: [SUBMISSION_TYPE.AIN] },
      {
        [CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD]: [mockKeyword],
      },
    ];
    const expected = {
      AND: [
        {
          OR: [{ [FIELD_NAMES.DEAL.DEAL_TYPE]: mockFilters[0].dealType[0] }, { [FIELD_NAMES.DEAL.DEAL_TYPE]: mockFilters[0].dealType[1] }],
        },
        {
          OR: [{ [FIELD_NAMES.DEAL.SUBMISSION_TYPE]: mockFilters[1].submissionType[0] }],
        },
        {
          OR: [...keywordQuery(mockKeyword)],
        },
      ],
    };
    mockUser.bank.id = ALL_BANKS_ID;
    mockUser.roles = [];

    // Act
    const result = await dashboardDealsFiltersQuery(mockFilters, mockUser);

    // Assert
    expect(result).toEqual(expected);
  });

  it(`should NOT add a filter to the query when the field value is ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES}`, async () => {
    // Arrange
    const mockFilters = [{ status: [CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES] }];
    mockUser.bank.id = ALL_BANKS_ID;
    mockUser.roles = [];
    const expected = {};

    // Act
    const result = await dashboardDealsFiltersQuery(mockFilters, mockUser);

    // Assert
    expect(result).toEqual(expected);
  });
});
