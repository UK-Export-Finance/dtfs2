import { ROLES, FACILITY_TYPE, FACILITY_STAGE } from '@ukef/dtfs2-common';
import { dashboardFacilitiesFiltersQuery } from './facilities-filters-query';
import CONSTANTS, { ALL_BANKS_ID } from '../../../constants';
import { DASHBOARD_FILTERS } from '../../../content-strings';
import keywordQuery from './facilities-filters-keyword-query';

const { ADMIN, MAKER } = ROLES;

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
        [CONSTANTS.FIELD_NAMES.FACILITY.TYPE]: [FACILITY_TYPE.CASH, FACILITY_TYPE.BOND],
      },
      {
        [CONSTANTS.FIELD_NAMES.FACILITY.STAGE]: [DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED],
      },
      {
        [DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD]: [mockKeyword],
      },
    ];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUser);

    const expected = {
      AND: [
        { 'deal.bank.id': mockUser.bank.id },
        {
          OR: [{ [CONSTANTS.FIELD_NAMES.FACILITY.TYPE]: mockFilters[0].type[0] }, { [CONSTANTS.FIELD_NAMES.FACILITY.TYPE]: mockFilters[0].type[1] }],
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
    const mockFilters = [{ [CONSTANTS.FIELD_NAMES.FACILITY.CREATED_BY]: ['Created by you'] }];

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
        [CONSTANTS.FIELD_NAMES.FACILITY.TYPE]: [FACILITY_TYPE.CASH, FACILITY_TYPE.BOND],
      },
      {
        [CONSTANTS.FIELD_NAMES.FACILITY.STAGE]: [DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED],
      },
      {
        [DASHBOARD_FILTERS.BESPOKE_FIELD_NAMES.KEYWORD]: [mockKeyword],
      },
      { [CONSTANTS.FIELD_NAMES.FACILITY.CREATED_BY]: [DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.CREATED_BY_YOU] },
    ];

    const result = dashboardFacilitiesFiltersQuery(mockFilters, mockUser);

    const expected = {
      AND: [
        { 'deal.bank.id': mockUser.bank.id },
        {
          OR: [{ [CONSTANTS.FIELD_NAMES.FACILITY.TYPE]: mockFilters[0].type[0] }, { [CONSTANTS.FIELD_NAMES.FACILITY.TYPE]: mockFilters[0].type[1] }],
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

  it(`should return hasBeenIssued filter when stage is ${DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED}`, () => {
    const mockFilters = [
      {
        [CONSTANTS.FIELD_NAMES.FACILITY.STAGE]: [DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.ISSUED],
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

  it(`should return hasBeenIssued filter when stage is ${DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED}`, () => {
    const mockFilters = [
      {
        [CONSTANTS.FIELD_NAMES.FACILITY.STAGE]: [[DASHBOARD_FILTERS.BESPOKE_FILTER_VALUES.FACILITIES.UNISSUED]],
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
        [CONSTANTS.FIELD_NAMES.FACILITY.STAGE]: [FACILITY_STAGE.RISK_EXPIRED],
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
