import {
  getAllDealsData,
  getTemplateVariables,
  getDataAndTemplateVariables,
  allDeals,
  removeSingleAllDealsFilter,
  removeAllDealsFilters,
} from '.';
import mockResponse from '../../../helpers/responseMock';
import { getFlashSuccessMessage } from '../../../helpers';
import api from '../../../api';
import {
  submittedFiltersArray,
  submittedFiltersObject,
} from '../filters/helpers';
import { removeSessionFilter } from '../filters/remove-filter-from-session';
import { dashboardDealsFiltersQuery } from './deals-filters-query';
import { dealsTemplateFilters as templateFilters } from './template-filters';
import { selectedFilters } from './selected-filters';
import CONSTANTS from '../../../constants';

jest.mock('../../../api', () => ({
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

jest.mock('../../../helpers', () => ({
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

describe('controllers/dashboard/deals', () => {
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
        dashboardFilters: CONSTANTS.DASHBOARD.DEFAULT_FILTERS,
        userToken: '1234',
        user: {
          _id: 'mock-user',
          roles: ['maker', 'checker'],
          bank: { id: '9' },
        },
      },
    };

    mockRes = mockResponse();
  });

  describe('getAllDealsData', () => {
    it('should calls api.allDeals with filters query', async () => {
      await getAllDealsData(
        'mock-token',
        mockReq.session.user,
        mockReq.session.dashboardFilters,
        mockReq.params.page,
        mockRes,
      );

      expect(api.allDeals).toBeCalledTimes(1);

      const filtersArray = submittedFiltersArray(mockReq.session.dashboardFilters);

      const expectedFilters = dashboardDealsFiltersQuery(
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

    it('should return an object', async () => {
      const result = await getAllDealsData(
        'mock-token',
        mockReq.session.user,
        mockReq.session.dashboardFilters,
        mockReq.params.page,
        mockRes,
      );

      const filtersArray = submittedFiltersArray(mockReq.session.dashboardFilters);

      const expected = {
        deals: mockDeals,
        count: mockDeals.length,
        filtersArray,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('getTemplateVariables', () => {
    it('should return an object', () => {
      const filtersArray = submittedFiltersArray(mockReq.session.dashboardFilters);

      const result = getTemplateVariables(
        mockReq.session.user,
        mockReq.session.dashboardFilters,
        mockDeals,
        mockDeals.length,
        mockReq.params.page,
        filtersArray,
      );

      const expectedFiltersObj = submittedFiltersObject(filtersArray);

      const expectedPages = {
        totalPages: Math.ceil(mockDeals.length / 20),
        currentPage: parseInt(mockReq.params.page, 10),
        totalItems: mockDeals.length,
      };

      const expected = {
        user: mockReq.session.user,
        primaryNav: 'home',
        tab: 'deals',
        deals: mockDeals,
        pages: expectedPages,
        filters: templateFilters(expectedFiltersObj),
        selectedFilters: selectedFilters(expectedFiltersObj),
        createdByYou: mockReq.session.dashboardFilters.createdByYou,
        keyword: mockReq.session.dashboardFilters.keyword,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('getDataAndTemplateVariables', () => {
    it('should return variables from getData and templateVariables functions', async () => {
      const result = await getDataAndTemplateVariables(
        'mock-token',
        mockReq.session.user,
        mockReq.session.dashboardFilters,
        mockReq.params.page,
        mockRes,
      );

      const filtersArray = submittedFiltersArray(mockReq.session.dashboardFilters);

      const expected = getTemplateVariables(
        mockReq.session.user,
        mockReq.session.dashboardFilters,
        mockDeals,
        mockDeals.length,
        mockReq.params.page,
        filtersArray,
      );

      expect(result).toEqual(expected);
    });
  });

  describe('allDeals', () => {
    describe('when there is req.body', () => {
      it('should set req.session.dashboardFilters to provided values', async () => {
        mockReq = {
          ...mockReq,
          body: {
            fieldA: 'test',
          },
        };

        await allDeals(mockReq, mockRes);

        const expected = mockReq.body;

        expect(mockReq.session.dashboardFilters).toEqual(expected);
      });
    });

    it('renders the correct template', async () => {
      await allDeals(mockReq, mockRes);

      const expectedVariables = await getDataAndTemplateVariables(
        'mock-token',
        mockReq.session.user,
        mockReq.session.dashboardFilters,
        mockReq.params.page,
        mockRes,
      );

      expect(mockRes.render).toHaveBeenCalledWith('dashboard/deals.njk', {
        ...expectedVariables,
        successMessage: getFlashSuccessMessage(mockReq),
      });
    });
  });

  describe('removeSingleAllDealsFilter', () => {
    it('should remove a filter and redirect to `/dashboard/deals/0`', async () => {
      mockReq = {
        ...mockReq,
        session: {
          ...mockReq.session,
          dashboardFilters: {
            fieldA: ['valueA'],
            fieldB: ['valueB1', 'valueB2'],
          },
        },
        params: {
          fieldName: 'fieldB',
          fieldValue: 'valueB1',
        },
      };

      await removeSingleAllDealsFilter(mockReq, mockRes);

      const expected = removeSessionFilter(mockReq);

      expect(mockReq.session.dashboardFilters).toEqual(expected);
      expect(mockRes.redirect).toHaveBeenCalledWith('/dashboard/deals/0');
    });
  });

  describe('removeAllDealsFilters', () => {
    it('should reset all session filters and redirect to `/dashboard/deals/0', async () => {
      mockReq = {
        ...mockReq,
        session: {
          ...mockReq.session,
          dashboardFilters: { fieldA: ['valueA'] },
        },
      };

      await removeAllDealsFilters(mockReq, mockRes);

      expect(mockReq.session.dashboardFilters).toEqual(CONSTANTS.DASHBOARD.DEFAULT_FILTERS);
    });
  });
});
