import { allDeals } from '.';
import mockResponse from '../../helpers/responseMock';
import { getApiData } from '../../helpers';
import api from '../../api';
import { PRODUCT } from '../../constants';

jest.mock('../../api', () => ({
  allDeals: jest.fn(),
}));

jest.mock('../../helpers', () => ({
  __esModule: true,
  getApiData: jest.fn(() => ({
    count: 2,
    deals: ['mock deal 1', 'mock deal 2'],
  })),
  getFlashSuccessMessage: jest.fn(),
  requestParams: jest.fn(() => ({ userToken: 'mock-token' })),
}));

describe('controllers/dashboard', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {
      body: {},
      params: { page: 1 },
      session: {
        dashboardFilters: 'mock-filters',
        user: {
          id: 'mock-user',
          roles: ['maker', 'checker'],
        },
      },
    };

    res = mockResponse();
  });

  describe('allDeals', () => {
    it('renders the correct template', async () => {
      getApiData.mockResolvedValue({
        count: 2,
        deals: [
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
        ],
      });

      await allDeals(req, res);

      expect(res.render).toHaveBeenCalledWith('dashboard/deals.njk', {
        deals: [
          {
            _id: 'mockDeal2',
            exporter: 'mock company',
            product: PRODUCT.BSS_EWCS,
            updatedAt: 5678,
          },
          {
            _id: 'mockDeal',
            exporter: 'mock company',
            product: PRODUCT.GEF,
            updatedAt: 1234,
          }],
        pages: {
          totalPages: 1,
          currentPage: 1,
          totalItems: 2,
        },
        primaryNav: 'home',
        tab: 'deals',
        user: {
          id: 'mock-user',
          roles: ['maker', 'checker'],
        },
      });
    });

    it('adds filter if user is a checker', async () => {
      req.session.user.roles = ['checker'];

      await allDeals(req, res);

      expect(api.allDeals).toHaveBeenCalledWith(20, 20, [{
        field: 'status',
        value: 'Ready for Checker\'s approval',
      }], 'mock-token');
    });
  });
});
