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
    const mockCreatedByYou = '';
    const mockFilters = [];

    const result = dashboardDealsFiltersQuery(
      mockCreatedByYou,
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
      const mockCreatedByYou = 'true';
      const mockFilters = [];

      const result = dashboardDealsFiltersQuery(
        mockCreatedByYou,
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
  });

  describe('when user is a checker', () => {
    it(`should return ${STATUS.READY_FOR_APPROVAL} filter`, () => {
      const mockCreatedByYou = '';
      const mockFilters = [];
      mockUser.roles = ['checker'];

      const result = dashboardDealsFiltersQuery(
        mockCreatedByYou,
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
      const mockCreatedByYou = '';
      const mockFilters = [];
      mockUser.bank.id = '*';
      mockUser.roles = [];

      const result = dashboardDealsFiltersQuery(
        mockCreatedByYou,
        mockFilters,
        mockUser,
      );

      const expected = {};

      expect(result).toEqual(expected);
    });
  });

  it('should add multiple custom filters to the query', () => {
    const mockCreatedByYou = '';
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
      mockCreatedByYou,
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
    const mockCreatedByYou = '';
    const mockFilters = [
      { status: [CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.DEALS.ALL_STATUSES] },
    ];
    mockUser.bank.id = '*';
    mockUser.roles = [];

    const result = dashboardDealsFiltersQuery(
      mockCreatedByYou,
      mockFilters,
      mockUser,
    );

    const expected = {};

    expect(result).toEqual(expected);
  });
});
