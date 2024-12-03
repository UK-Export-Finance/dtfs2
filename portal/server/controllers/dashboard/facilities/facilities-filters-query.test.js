import { ROLES, FACILITY_TYPE, FACILITY_STAGE } from '@ukef/dtfs2-common';
import { dashboardFacilitiesFiltersQuery } from './facilities-filters-query';
import CONSTANTS, { ALL_BANKS_ID } from '../../../constants';
import { DASHBOARD_FILTERS } from '../../../content-strings';
import keywordQuery from './facilities-filters-keyword-query';

const { ADMIN, MAKER } = ROLES;
const {
  FIELD_NAMES: {
    FACILITY: { TYPE, STAGE, CREATED_BY },
  },
} = CONSTANTS;
const {
  BESPOKE_FIELD_NAMES: { KEYWORD },
  BESPOKE_FILTER_VALUES: {
    FACILITIES: { UNISSUED, ISSUED, CREATED_BY_YOU },
  },
} = DASHBOARD_FILTERS;

describe('controllers/dashboard/facilities - filters query', () => {
  const mockUser = {
    _id: '123',
    roles: [MAKER],
    bank: { id: '9' },
  };

  const mockUserAdmin = {
    _id: '123',
    roles: [ADMIN],
    bank: { id: ALL_BANKS_ID },
  };

  it('should return deal.bank.id filter', () => {
    const mockFilters = [];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUser);

    const expected = {
      AND: [{ 'deal.bank.id': mockUser.bank.id }],
    };

    expect(result).toEqual(expected);
  });

  it('should add multiple custom filters to the query', () => {
    const mockKeyword = 'test';
    const mockFilters = [
      {
        [TYPE]: [FACILITY_TYPE.CASH, FACILITY_TYPE.BOND],
      },
      {
        [STAGE]: [UNISSUED],
      },
      {
        [KEYWORD]: [mockKeyword],
      },
    ];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUser);

    const expected = {
      AND: [
        { 'deal.bank.id': mockUser.bank.id },
        {
          OR: [{ [TYPE]: mockFilters[0].type[0] }, { [TYPE]: mockFilters[0].type[1] }],
        },
        {
          OR: [{ hasBeenIssued: false }],
        },
        {
          OR: [...keywordQuery(mockKeyword)],
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('should return maker._id filter', () => {
    const mockFilters = [{ [CREATED_BY]: ['Created by you'] }];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUser);

    const expected = {
      AND: [{ 'deal.bank.id': mockUser.bank.id }, { 'deal.maker._id': mockUser._id }],
    };

    expect(result).toEqual(expected);
  });

  it('should return maker._id filter and other filters if many selected', () => {
    const mockKeyword = 'test';
    const mockFilters = [
      {
        [TYPE]: [FACILITY_TYPE.CASH, FACILITY_TYPE.BOND],
      },
      {
        [STAGE]: [ISSUED],
      },
      {
        [KEYWORD]: [mockKeyword],
      },
      { [CREATED_BY]: [CREATED_BY_YOU] },
    ];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUser);

    const expected = {
      AND: [
        { 'deal.bank.id': mockUser.bank.id },
        {
          OR: [{ [TYPE]: mockFilters[0].type[0] }, { [TYPE]: mockFilters[0].type[1] }],
        },
        {
          OR: [{ hasBeenIssued: true }],
        },
        {
          OR: [...keywordQuery(mockKeyword)],
        },
        { 'deal.maker._id': mockUser._id },
      ],
    };

    expect(result).toEqual(expected);
  });

  it(`should return hasBeenIssued filter when stage is ${ISSUED}`, () => {
    const mockFilters = [
      {
        [STAGE]: [ISSUED],
      },
    ];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUser);

    const expected = {
      AND: [
        { 'deal.bank.id': mockUser.bank.id },
        {
          OR: [{ hasBeenIssued: true }],
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it(`should return hasBeenIssued filter when stage is ${UNISSUED}`, () => {
    const mockFilters = [
      {
        [STAGE]: [UNISSUED],
      },
    ];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUser);

    const expected = {
      AND: [
        { 'deal.bank.id': mockUser.bank.id },
        {
          OR: [{ hasBeenIssued: false }],
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it(`should return facilityStage filter when stage is ${FACILITY_STAGE.RISK_EXPIRED}`, () => {
    const mockFilters = [
      {
        [STAGE]: [FACILITY_STAGE.RISK_EXPIRED],
      },
    ];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUser);

    const expected = {
      AND: [
        { 'deal.bank.id': mockUser.bank.id },
        {
          OR: [{ facilityStage: FACILITY_STAGE.RISK_EXPIRED }],
        },
      ],
    };

    expect(result).toEqual(expected);
  });

  it('should remove _crsf from the query', () => {
    const mockFilters = [
      {
        _csrf: ['123'],
      },
    ];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUser);

    const expected = {
      AND: [{ 'deal.bank.id': mockUser.bank.id }],
    };

    expect(result).toEqual(expected);
  });

  it('should not return deal.bank.id if superuser', () => {
    const mockFilters = [];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUserAdmin);

    const expected = {};

    expect(result).toEqual(expected);
  });
});
