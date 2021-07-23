import { bssDeals, gefDeals } from '.';
import mockResponse from '../../helpers/responseMock';
import { getApiData } from '../../helpers';

jest.mock('../../api');
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
        user: 'mock-user',
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
        user: 'mock-user',
      });
    });
  });

  describe('gefDeals', () => {
    it('renders the correct template', async () => {
      getApiData.mockResolvedValue({
        count: 1,
        deals: [{
          _id: 'mockDeal',
          exporter: { companyName: 'mock company' },
        }],
      });

      await gefDeals(req, res);

      expect(res.render).toHaveBeenCalledWith('dashboard/deals.njk', {
        deals: [{
          _id: 'mockDeal',
          exporter: 'mock company',
          product: 'GEF',
          type: '-',
        }],
        pages: {
          totalPages: 1,
          currentPage: 1,
          totalItems: 1,
        },
        primaryNav: 'home',
        tab: 'gefDeals',
        user: 'mock-user',
      });
    });
  });
});
