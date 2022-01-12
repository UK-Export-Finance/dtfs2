import {
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
} from '.';
import mockResponse from '../../helpers/responseMock';
import { getFlashSuccessMessage } from '../../helpers';
import api from '../../api';
import {
  submittedFiltersArray,
  submittedFiltersObject,
} from './filters/helpers';
import { dashboardFiltersQuery } from './filters/query';
import { dashboardFilters } from './filters/ui-filters';
import { selectedDashboardFilters } from './filters/ui-selected-filters';
import CONSTANTS from '../../constants';

jest.mock('../../api', () => ({
  allDeals: jest.fn(),
}));

const mockDeals = [
  {
    _id: 'mockDeal',
    exporter: { companyName: 'mock company' },
    product: CONSTANTS.PRODUCT.BSS_EWCS,
    createdAt: 1234,
  },
  {
    _id: 'mockDeal2',
    exporter: { companyName: 'mock company' },
    product: CONSTANTS.PRODUCT.GEF,
    createdAt: 5678,
  },
];

jest.mock('../../helpers', () => ({
  __esModule: true,
  getApiData: jest.fn(() => ({
    count: 2,
    deals: mockDeals,
  })),
  getFlashSuccessMessage: jest.fn(),
  requestParams: jest.fn(() => ({ userToken: 'mock-token' })),
  isSuperUser: jest.fn((user) => {
    if (user.bank.id === '*') {
      return true;
    }

    return false;
  }),
  getUserRoles: jest.fn(() => ({ isMaker: true })),
}));

describe('controllers/dashboard', () => {
  let mockReq;
  let mockRes;
  beforeEach(() => {
    mockReq = {
      body: {
        createdByYou: '',
        keyword: '',
      },
      params: { page: 1 },
      session: {
        dashboardFilters: CONSTANTS.DASHBOARD_FILTERS_DEFAULT,
        user: {
          _id: 'mock-user',
          roles: ['maker', 'checker'],
          bank: { id: '9' },
        },
      },
    };

    mockRes = mockResponse();
  });

  describe('allDeals', () => {
    it('calls api.allDeals with filters query', async () => {
      await allDeals(mockReq, mockRes);

      expect(api.allDeals).toBeCalledTimes(1);

      const filtersArray = submittedFiltersArray(mockReq.session.dashboardFilters);

      const expectedFilters = dashboardFiltersQuery(
        mockReq.body.createdByYou,
        filtersArray,
        mockReq.session.user,
      );

      expect(api.allDeals).toHaveBeenCalledWith(
        20,
        20,
        expectedFilters,
        'mock-token',
      );
    });

    it('renders the correct template', async () => {
      await allDeals(mockReq, mockRes);

      const filtersArray = submittedFiltersArray(mockReq.body);
      const filtersObj = submittedFiltersObject(filtersArray);

      expect(mockRes.render).toHaveBeenCalledWith('dashboard/deals.njk', {
        user: mockReq.session.user,
        primaryNav: 'home',
        tab: 'deals',
        deals: mockDeals,
        pages: {
          totalPages: 1,
          currentPage: 1,
          totalItems: 2,
        },
        filters: dashboardFilters(filtersObj),
        selectedFilters: selectedDashboardFilters(filtersObj),
        successMessage: getFlashSuccessMessage(mockReq),
        createdByYou: mockReq.session.dashboardFilters.createdByYou,
        keyword: mockReq.session.dashboardFilters.keyword,
      });
    });
  });

  describe('removeSingleAllDealsFilter', () => {
    it('should remove a single filter from mockReq.session.dashboardFilters', async () => {
      mockReq = {
        ...mockReq,
        session: {
          ...mockReq.session,
          dashboardFilters: {
            fieldA: 'valueA',
            fieldB: 'valueB',
          },
        },
        params: {
          fieldName: 'fieldB',
        },
      };

      await removeSingleAllDealsFilter(mockReq, mockRes);

      const expected = { fieldA: 'valueA' };

      expect(mockReq.session.dashboardFilters).toEqual(expected);
    });
  });

  describe('removeAllDealsFilters', () => {
    it('should remove a single filter from mockReq.session.dashboardFilters', async () => {
      mockReq = {
        ...mockReq,
        session: {
          ...mockReq.session,
          dashboardFilters: { fieldA: 'valueA' },
        },
      };

      await removeAllDealsFilters(mockReq, mockRes);

      expect(mockReq.session.dashboardFilters).toEqual(CONSTANTS.DASHBOARD_FILTERS_DEFAULT);
    });
  });
});
