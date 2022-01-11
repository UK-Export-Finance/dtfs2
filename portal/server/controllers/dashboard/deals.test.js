import { allDeals } from '.';
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
import { PRODUCT } from '../../constants';

jest.mock('../../api', () => ({
  allDeals: jest.fn(),
}));

const mockDeals = [
  {
    _id: 'mockDeal',
    exporter: { companyName: 'mock company' },
    product: PRODUCT.BSS_EWCS,
    createdAt: 1234,
  },
  {
    _id: 'mockDeal2',
    exporter: { companyName: 'mock company' },
    product: PRODUCT.GEF,
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
  let req;
  let res;
  beforeEach(() => {
    req = {
      body: {
        createdByYou: '',
        keyword: '',
      },
      params: { page: 1 },
      session: {
        dashboardFilters: {
          createdByYou: '',
          keyword: '',
        },
        user: {
          _id: 'mock-user',
          roles: ['maker', 'checker'],
          bank: { id: '9' },
        },
      },
    };

    res = mockResponse();
  });

  describe('allDeals', () => {
    it('calls api.allDeals with filters query', async () => {
      await allDeals(req, res);

      expect(api.allDeals).toBeCalledTimes(1);

      const filtersArray = submittedFiltersArray(req.session.dashboardFilters);

      const expectedFilters = dashboardFiltersQuery(
        req.body.createdByYou,
        filtersArray,
        req.session.user,
      );

      expect(api.allDeals).toHaveBeenCalledWith(
        20,
        20,
        expectedFilters,
        'mock-token',
      );
    });

    it('renders the correct template', async () => {
      await allDeals(req, res);

      const filtersArray = submittedFiltersArray(req.body);
      const filtersObj = submittedFiltersObject(filtersArray);

      expect(res.render).toHaveBeenCalledWith('dashboard/deals.njk', {
        user: req.session.user,
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
        successMessage: getFlashSuccessMessage(req),
        createdByYou: req.session.dashboardFilters.createdByYou,
        keyword: req.session.dashboardFilters.keyword,
      });
    });
  });
});
