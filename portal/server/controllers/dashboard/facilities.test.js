import { bssFacilities, gefFacilities } from '.';
import mockResponse from '../../helpers/responseMock';
import { getApiData } from '../../helpers';
import { PRODUCT, STATUS } from '../../constants';
import api from '../../api';

jest.mock('../../helpers', () => ({
  __esModule: true,
  getApiData: jest.fn(),
  getFlashSuccessMessage: jest.fn(),
  requestParams: jest.fn(() => ({ userToken: 'mock-token' })),
}));

describe('controllers/facilities', () => {
  let req;
  let checkerReq;
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

    checkerReq = {
      body: {},
      params: { page: 1 },
      session: {
        dashboardFilters: 'mock-filters',
        user: {
          id: 'mock-user',
          roles: ['checker'],
        },
      },
    };

    api.gefFacilities = jest.fn();
    api.transactions = jest.fn();

    res = mockResponse();
  });

  describe('bssFacilities', () => {
    beforeEach(() => {
      getApiData.mockResolvedValue({
        count: 2,
        transactions: [
          {
            transaction_id: 'mockFacility1',
            deal_id: 'mock-deal-1',
            bankFacilityId: 'mock-facility',
            transactionType: 'Bond',
            currency: { id: 'GBP' },
          },
          {
            transaction_id: 'mockFacility2',
            deal_id: 'mock-deal-1',
            transactionType: 'another-type',
            currency: { id: 'GBP' },
          },
        ],
      });
    });

    afterEach(() => {
      getApiData.mockReset();
    });

    it('passes the expected filter for maker', async () => {
      await bssFacilities(req, res);

      expect(api.transactions).toHaveBeenCalledWith(20, 20, [], 'mock-token');
    });

    it('passes the expected filter for checker', async () => {
      await bssFacilities(checkerReq, res);

      expect(api.transactions).toHaveBeenCalledWith(20, 20, [{ field: 'status', operator: 'eq', value: STATUS.READY_FOR_APPROVAL }], 'mock-token');
    });

    it('renders the correct template', async () => {
      await bssFacilities(req, res);

      expect(res.render).toHaveBeenCalledWith('dashboard/facilities.njk', {
        facilities: [
          {
            _id: 'mockFacility1',
            bankId: 'mock-facility',
            dealId: 'mock-deal-1',
            type: 'Bond',
            product: PRODUCT.BSS_EWCS,
            ukefStage: '-',
            value: { currency: 'GBP' },
            url: '/contract/mock-deal-1/bond/mockFacility1/details',
          },
          {
            _id: 'mockFacility2',
            bankId: 'Not entered',
            dealId: 'mock-deal-1',
            type: 'another-type',
            product: PRODUCT.BSS_EWCS,
            ukefStage: '-',
            value: { currency: 'GBP' },
            url: '/contract/mock-deal-1/another-type/mockFacility2/guarantee-details',
          },
        ],
        pages: {
          totalPages: 1,
          currentPage: 1,
          totalItems: 2,
        },
        primaryNav: 'home',
        tab: 'bssFacilities',
        user: {
          id: 'mock-user',
          roles: ['maker', 'checker'],
        },
      });
    });
  });

  describe('gefFacilities', () => {
    beforeEach(() => {
      getApiData.mockResolvedValue({
        count: 2,
        facilities: [
          {
            _id: 'mockFacility1',
            name: 'mock-facility',
            dealId: 'mock-deal-1',
            type: 'mock-type',
            hasBeenIssued: true,
            deal: { _id: 'mock-deal-1' },
            currency: { id: 'JPY' },
          },
          {
            _id: 'mockFacility2',
            dealId: 'mock-deal-1',
            type: 'mock-type',
            deal: { _id: 'mock-deal-1' },
            currency: { id: 'JPY' },
          },
        ],
      });
    });

    afterEach(() => {
      getApiData.mockReset();
    });

    it('passes the expected filter for maker', async () => {
      await gefFacilities(req, res);

      expect(api.gefFacilities).toHaveBeenCalledWith(20, 20, [], 'mock-token');
    });

    it('passes the expected filter for checker', async () => {
      await gefFacilities(checkerReq, res);

      expect(api.gefFacilities).toHaveBeenCalledWith(20, 20, [{ field: 'deal.status', operator: 'eq', value: STATUS.READY_FOR_APPROVAL }], 'mock-token');
    });

    it('renders the correct template', async () => {
      await gefFacilities(req, res);

      expect(res.render).toHaveBeenCalledWith('dashboard/facilities.njk', {
        facilities: [
          {
            _id: 'mockFacility1',
            bankId: 'mock-facility',
            dealId: 'mock-deal-1',
            type: 'mock-type',
            bankStage: 'Issued',
            product: PRODUCT.GEF,
            ukefStage: '-',
            url: '/gef/application-details/mock-deal-1/facilities/mockFacility1/',
            value: { amount: 0, currency: 'JPY' },
          },
          {
            _id: 'mockFacility2',
            bankId: 'Not entered',
            dealId: 'mock-deal-1',
            type: 'mock-type',
            bankStage: 'Unissued',
            product: PRODUCT.GEF,
            ukefStage: '-',
            url: '/gef/application-details/mock-deal-1/facilities/mockFacility2/',
            value: { amount: 0, currency: 'JPY' },
          },
        ],
        pages: {
          totalPages: 1,
          currentPage: 1,
          totalItems: 2,
        },
        primaryNav: 'home',
        tab: 'gefFacilities',
        user: {
          id: 'mock-user',
          roles: ['maker', 'checker'],
        },
      });
    });
  });
});
