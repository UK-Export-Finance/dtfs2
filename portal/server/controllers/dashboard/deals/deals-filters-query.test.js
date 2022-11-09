import { dashboardDealsFiltersQuery } from './deals-filters-query';
import {
  STATUS,
  SUBMISSION_TYPE,
  FIELD_NAMES,
} from '../../../constants';
import CONTENT_STRINGS from '../../../content-strings';
import keywordQuery from './deals-filters-keyword-query';

describe('controllers/dashboard/deals - filters query', () => {
  const mockUser = {
    _id: '123',
    roles: ['maker'],
    bank: { id: '9' },
  };

  it('should return bank.id filter', () => {
    const mockFilters = [];

    const result = dashboardDealsFiltersQuery(
      mockFilters,
      mockUser,
    );

    const expected = {
      $and: [
        { 'bank.id': mockUser.bank.id },
      ],
    };

    expect(result).toEqual(expected);
  });

  describe('when createdByYou is true', () => {
    it('should return maker._id filter', () => {
      const mockFilters = [
        { [FIELD_NAMES.DEAL.CREATED_BY]: ['Created by you'] },
      ];

      const result = dashboardDealsFiltersQuery(
        mockFilters,
        mockUser,
      );

      const expected = {
        $and: [
          { 'bank.id': mockUser.bank.id },
          { 'maker._id': mockUser._id },
        ],
      };

      expect(result).toEqual(expected);
    });

    it('should return maker._id filter and other filters if many selected', () => {
      const mockFilters = [
        { [FIELD_NAMES.DEAL.DEAL_TYPE]: ['BSS', 'EWCS'] },
        { [FIELD_NAMES.DEAL.SUBMISSION_TYPE]: [SUBMISSION_TYPE.AIN] },
        { [FIELD_NAMES.DEAL.CREATED_BY]: ['Created by you'] },
      ];

      const result = dashboardDealsFiltersQuery(
        mockFilters,
        mockUser,
      );

      const expected = {
        $and: [
          { 'bank.id': mockUser.bank.id },
          {
            $or: [
              { [FIELD_NAMES.DEAL.DEAL_TYPE]: mockFilters[0].dealType[0] },
              { [FIELD_NAMES.DEAL.DEAL_TYPE]: mockFilters[0].dealType[1] },
            ],
          },
          {
            $or: [{ [FIELD_NAMES.DEAL.SUBMISSION_TYPE]: mockFilters[1].submissionType[0] }],
          },
          { 'maker._id': mockUser._id },
        ],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when user is a checker', () => {
    it(`should return ${STATUS.READY_FOR_APPROVAL} filter`, () => {
      const mockFilters = [];
      mockUser.roles = ['checker'];

      const result = dashboardDealsFiltersQuery(
        mockFilters,
        mockUser,
      );

      const expected = {
        $and: [
          { 'bank.id': mockUser.bank.id },
          { status: STATUS.READY_FOR_APPROVAL },
        ],
      };

      expect(result).toEqual(expected);
    });
  });

  describe('when user is a super user', () => {
    it('should not return any filters', () => {
      const mockFilters = [];
      mockUser.bank.id = '*';
      mockUser.roles = [];

      const result = dashboardDealsFiltersQuery(
        mockFilters,
        mockUser,
      );

      const expected = {};

      expect(result).toEqual(expected);
    });
  });

  it('should add multiple custom filters to the query', () => {
    const mockKeyword = 'test';
    const mockFilters = [
      { [FIELD_NAMES.DEAL.DEAL_TYPE]: ['BSS', 'EWCS'] },
      { [FIELD_NAMES.DEAL.SUBMISSION_TYPE]: [SUBMISSION_TYPE.AIN] },
      {
        [CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD]: [
          mockKeyword,
        ],
      },
    ];
    mockUser.bank.id = '*';
    mockUser.roles = [];

    const result = dashboardDealsFiltersQuery(
      mockFilters,
      mockUser,
    );

    const expected = {
      $and: [
        {
          $or: [
            { [FIELD_NAMES.DEAL.DEAL_TYPE]: mockFilters[0].dealType[0] },
            { [FIELD_NAMES.DEAL.DEAL_TYPE]: mockFilters[0].dealType[1] },
          ],
        },
        {
          $or: [{ [FIELD_NAMES.DEAL.SUBMISSION_TYPE]: mockFilters[1].submissionType[0] }],
        },
        {
          $or: [...keywordQuery(mockKeyword)],
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it(`should NOT add a filter to the query when the field value is ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES}`, () => {
    const mockFilters = [
      { status: [CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES] },
    ];
    mockUser.bank.id = '*';
    mockUser.roles = [];

    const result = dashboardDealsFiltersQuery(
      mockFilters,
      mockUser,
    );

    const expected = {};

    expect(result).toEqual(expected);
  });
});
