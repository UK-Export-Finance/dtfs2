import { dashboardDealsFiltersQuery } from './deals-query';
import { STATUS } from '../../../constants';
import CONTENT_STRINGS from '../../../content-strings';

describe('controllers/dashboard/filters - deals query', () => {
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

    const expected = [
      {
        field: 'bank.id',
        value: mockUser.bank.id,
        operator: 'and',
      },
    ];

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

      const expected = [
        {
          field: 'bank.id',
          value: mockUser.bank.id,
          operator: 'and',
        },
        {
          field: 'maker._id',
          value: mockUser._id,
        },
      ];

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

      const expected = [
        {
          field: 'bank.id',
          value: mockUser.bank.id,
          operator: 'and',
        },
        {
          field: 'status',
          value: STATUS.READY_FOR_APPROVAL,
          operator: 'and',
        },
      ];

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

      const expected = [];

      expect(result).toEqual(expected);
    });
  });

  it('should add multiple custom filters to the query', () => {
    const mockCreatedByYou = '';
    const mockFilters = [
      { dealType: ['BSS', 'EWCS'] },
      { submissionType: ['Automatic Inclusion Notice'] },
    ];
    mockUser.bank.id = '*';
    mockUser.roles = [];

    const result = dashboardDealsFiltersQuery(
      mockCreatedByYou,
      mockFilters,
      mockUser,
    );

    const expected = [
      {
        field: 'dealType',
        value: [
          mockFilters[0].dealType[0],
          mockFilters[0].dealType[1],
        ],
        operator: 'or',
      },
      {
        field: 'submissionType',
        value: [
          mockFilters[1].submissionType[0],
        ],
        operator: 'or',
      },
    ];

    expect(result).toEqual(expected);
  });

  it(`should NOT add a filter to the query when the field value is ${CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES}`, () => {
    const mockCreatedByYou = '';
    const mockFilters = [
      { status: [CONTENT_STRINGS.DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.ALL_STATUSES] },
    ];
    mockUser.bank.id = '*';
    mockUser.roles = [];

    const result = dashboardDealsFiltersQuery(
      mockCreatedByYou,
      mockFilters,
      mockUser,
    );

    const expected = [];

    expect(result).toEqual(expected);
  });
});
