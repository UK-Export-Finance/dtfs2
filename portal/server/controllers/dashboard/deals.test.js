import { bssDeals, gefDeals } from '.';
import mockResponse from '../../helpers/responseMock';
import { getApiData } from '../../helpers';
import api from '../../api';
const { PRODUCT, STATUS } = require('../../constants');

jest.mock('../../api', () => ({
  allDeals: jest.fn(),
  gefDeals: jest.fn(),
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

  describe('bssDeals', () => {
    it('renders the correct template', async () => {
      await bssDeals(req, res);

      expect(res.render).toHaveBeenCalledWith('dashboard/deals.njk', {
        deals: ['mock deal 1', 'mock deal 2'],
        pages: {
          totalPages: 1,
          currentPage: 1,
          totalItems: 2,
        },
        primaryNav: 'home',
        tab: 'bssDeals',
        user: {
          id: 'mock-user',
          roles: ['maker', 'checker'],
        },
      });
    });

    it('adds filter if user is a checker', async () => {
      req.session.user.roles = ['checker'];

      await bssDeals(req, res);

      expect(api.allDeals).toHaveBeenCalledWith(20, 20, [{
        field: 'status',
        value: STATUS.readyForApproval,
      }], 'mock-token');
    });
  });

  describe('gefDeals', () => {
    it('renders the correct template', async () => {
      getApiData.mockResolvedValue({
        count: 2,
        deals: [
          {
            _id: 'mockDeal',
            exporter: { companyName: 'mock company' },
            createdAt: 1234,
          },
          {
            _id: 'mockDeal2',
            exporter: { companyName: 'mock company' },
            createdAt: 5678,
          },
        ],
      });

      await gefDeals(req, res);

      expect(res.render).toHaveBeenCalledWith('dashboard/deals.njk', {
        deals: [
          {
            _id: 'mockDeal2',
            exporter: 'mock company',
            product: PRODUCT.GEF,
            lastUpdate: 5678,
          },
          {
            _id: 'mockDeal',
            exporter: 'mock company',
            product: PRODUCT.GEF,
            lastUpdate: 1234,
          }],
        pages: {
          totalPages: 1,
          currentPage: 1,
          totalItems: 2,
        },
        primaryNav: 'home',
        tab: 'gefDeals',
        user: {
          id: 'mock-user',
          roles: ['maker', 'checker'],
        },
      });
    });

    it('adds filter if user is a checker', async () => {
      req.session.user.roles = ['checker'];

      await gefDeals(req, res);

      expect(api.gefDeals).toHaveBeenCalledWith(20, 20, [{
        field: 'status',
        value: 'Ready for Checker\'s approval',
      }], 'mock-token');
    });
  });
});
