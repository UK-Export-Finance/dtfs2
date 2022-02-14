import { dashboardFacilitiesFiltersQuery } from './facilities-filters-query';

describe('controllers/dashboard/facilities - filters query', () => {
  const mockUser = {
    _id: '123',
    roles: ['maker'],
    bank: { id: '9' },
  };

  it('should return deal.bank.id filter', () => {
    const mockFilters = [];

    const result = dashboardFacilitiesFiltersQuery(
      mockFilters,
      mockUser,
    );

    const expected = [
      {
        field: 'deal.bank.id',
        value: mockUser.bank.id,
        operator: 'and',
      },
    ];

    expect(result).toEqual(expected);
  });

  it('should add multiple custom filters to the query', () => {
    const mockFilters = [
      { type: ['Cash', 'Bond'] },
      { hasBeenIssued: ['true'] },
    ];

    const result = dashboardFacilitiesFiltersQuery(
      mockFilters,
      mockUser,
    );

    const expected = [
      {
        field: 'deal.bank.id',
        value: mockUser.bank.id,
        operator: 'and',
      },
      {
        field: 'type',
        value: [
          mockFilters[0].type[0],
          mockFilters[0].type[1],
        ],
        operator: 'or',
      },
      {
        field: 'hasBeenIssued',
        value: [
          mockFilters[1].hasBeenIssued[0],
        ],
        operator: 'or',
      },
    ];

    expect(result).toEqual(expected);
  });
});
