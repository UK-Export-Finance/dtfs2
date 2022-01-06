import { allDeals } from '.';
import mockResponse from '../../helpers/responseMock';
import { getFlashSuccessMessage } from '../../helpers';
import api from '../../api';
import { PRODUCT, STATUS } from '../../constants';

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
}));

describe('controllers/dashboard', () => {
  let req;
  let res;
  beforeEach(() => {
    req = {
      body: { createdByYou: '' },
      params: { page: 1 },
      session: {
        dashboardFilters: 'mock-filters',
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
    it('calls api.allDeals with bank.id filter', async () => {
      await allDeals(req, res);

      expect(api.allDeals).toBeCalledTimes(1);

      const expectedFilters = [
        {
          field: 'bank.id',
          value: req.session.user.bank.id,
        },
      ];

      expect(api.allDeals).toHaveBeenCalledWith(
        20,
        20,
        expectedFilters,
        'mock-token',
      );
    });

    it('renders the correct template', async () => {
      await allDeals(req, res);

      expect(res.render).toHaveBeenCalledWith('dashboard/deals.njk', {
        deals: mockDeals,
        pages: {
          totalPages: 1,
          currentPage: 1,
          totalItems: 2,
        },
        successMessage: getFlashSuccessMessage(req),
        primaryNav: 'home',
        tab: 'deals',
        user: req.session.user,
        createdByYou: req.body.createdByYou,
      });
    });

    describe('when req.body.createdByYou is provided', () => {
      it('calls api.allDeals with `maker._id`` filter', async () => {
        req.body.createdByYou = 'true';

        await allDeals(req, res);

        const expectedFilters = [
          {
            field: 'bank.id',
            value: req.session.user.bank.id,
          },
          {
            field: 'maker._id',
            value: req.session.user._id,
          },
        ];

        expect(api.allDeals).toHaveBeenCalledWith(
          20,
          20,
          expectedFilters,
          'mock-token',
        );
      });
    });

    describe('when user is a checker', () => {
      it(`calls api.allDeals with ${STATUS.readyForApproval} filter`, async () => {
        req.session.user.roles = ['checker'];

        await allDeals(req, res);

        const expectedFilters = [
          {
            field: 'bank.id',
            value: req.session.user.bank.id,
          },
          {
            field: 'status',
            value: STATUS.readyForApproval,
          },
        ];

        expect(api.allDeals).toHaveBeenCalledWith(
          20,
          20,
          expectedFilters,
          'mock-token',
        );
      });
    });
  });
});
