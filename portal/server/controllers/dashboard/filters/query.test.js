import { dashboardFiltersQuery } from './query';
import { STATUS } from '../../../constants';

describe('controllers/dashboard/filters - query', () => {
  const mockUser = {
    _id: '123',
    roles: ['maker'],
    bank: { id: '9' },
  };

  it('should return bank.id filter', () => {
    const mockCreatedByYou = '';
    const mockFilters = [];

    const result = dashboardFiltersQuery(
      mockCreatedByYou,
      mockFilters,
      mockUser,
    );

    const expected = [
      {
        field: 'bank.id',
        value: mockUser.bank.id,
      },
    ];

    expect(result).toEqual(expected);
  });

  describe('when createdByYou is true', () => {
    it('should return maker._id filter', () => {
      const mockCreatedByYou = 'true';
      const mockFilters = [];

      const result = dashboardFiltersQuery(
        mockCreatedByYou,
        mockFilters,
        mockUser,
      );

      const expected = [
        {
          field: 'bank.id',
          value: mockUser.bank.id,
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

      const result = dashboardFiltersQuery(
        mockCreatedByYou,
        mockFilters,
        mockUser,
      );

      const expected = [
        {
          field: 'bank.id',
          value: mockUser.bank.id,
        },
        {
          field: 'status',
          value: STATUS.READY_FOR_APPROVAL,
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

      const result = dashboardFiltersQuery(
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

    const result = dashboardFiltersQuery(
      mockCreatedByYou,
      mockFilters,
      mockUser,
    );

    const expected = [
      {
        field: 'dealType',
        value: mockFilters[0].dealType[0],
      },
      {
        field: 'dealType',
        value: mockFilters[0].dealType[1],
      },
      {
        field: 'submissionType',
        value: mockFilters[1].submissionType[0],
      },
    ];

    expect(result).toEqual(expected);
  });
});
