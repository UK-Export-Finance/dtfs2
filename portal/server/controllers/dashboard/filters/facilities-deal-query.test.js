import { dashboardFacilitiesDealFiltersQuery } from './facilities-deal-query';

describe('controllers/dashboard/filters - facilities deal query', () => {
  const mockUser = {
    _id: '123',
    roles: ['maker'],
    bank: { id: '9' },
  };

  it('should return bank.id filter', () => {
    const mockFilters = [];

    const result = dashboardFacilitiesDealFiltersQuery(
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

  describe('when user is a super user', () => {
    it('should not return any filters', () => {
      const mockFilters = [];
      mockUser.bank.id = '*';
      mockUser.roles = [];

      const result = dashboardFacilitiesDealFiltersQuery(
        mockFilters,
        mockUser,
      );

      const expected = [];

      expect(result).toEqual(expected);
    });
  });
});
