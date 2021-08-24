import { bssFacilities, gefFacilities } from '.';
import mockResponse from '../../helpers/responseMock';
import { getApiData } from '../../helpers';

jest.mock('../../api', () => ({
  transactions: jest.fn(),
  gefFacilities: jest.fn(),
}));
jest.mock('../../helpers', () => ({
  __esModule: true,
  getApiData: jest.fn(() => ({
    count: 2,
    facilities: ['mock facility 1', 'mock facility 2'],
  })),
  getFlashSuccessMessage: jest.fn(),
  requestParams: jest.fn(() => ({ userToken: 'mock-token' })),
}));

describe('controllers/facilities', () => {
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

  describe('bssFacilities', () => {
    it('renders the correct template', async () => {
      getApiData.mockResolvedValue({
        count: 2,
        transactions: [
          {
            transaction_id: 'mockFacility1',
            deal_id: 'mock-deal-1',
            bankFacilityId: 'mock-facility',
            transactionType: 'bond',
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

      await bssFacilities(req, res);

      expect(res.render).toHaveBeenCalledWith('dashboard/facilities.njk', {
        facilities: [
          {
            _id: 'mockFacility1',
            bankId: 'mock-facility',
            dealId: 'mock-deal-1',
            facilityType: 'bond',
            product: 'BSS/EWCS',
            ukefStage: '-',
            value: { currency: 'GBP' },
            url: '/contract/mock-deal-1/bond/mockFacility1/details',
          },
          {
            _id: 'mockFacility2',
            bankId: 'Not entered',
            dealId: 'mock-deal-1',
            facilityType: 'another-type',
            product: 'BSS/EWCS',
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
    it('renders the correct template', async () => {
      getApiData.mockResolvedValue({
        count: 2,
        facilities: [
          {
            _id: 'mockFacility1',
            name: 'mock-facility',
            applicationId: 'mock-deal-1',
            type: 'mock-type',
            hasBeenIssued: true,
            deal: { _id: 'mock-deal-1' },
          },
          {
            _id: 'mockFacility2',
            applicationId: 'mock-deal-1',
            type: 'mock-type',
            deal: { _id: 'mock-deal-1' },
          },
        ],
      });

      await gefFacilities(req, res);

      expect(res.render).toHaveBeenCalledWith('dashboard/facilities.njk', {
        facilities: [
          {
            _id: 'mockFacility1',
            bankId: 'mock-facility',
            dealId: 'mock-deal-1',
            facilityType: 'mock-type',
            bankStage: 'Issued',
            product: 'GEF',
            ukefStage: '-',
            url: '/gef/application-details/mock-deal-1/facilities/mockFacility1/',
            value: { amount: 0, currency: '' },
          },
          {
            _id: 'mockFacility2',
            bankId: 'Not entered',
            dealId: 'mock-deal-1',
            facilityType: 'mock-type',
            bankStage: 'Unissued',
            product: 'GEF',
            ukefStage: '-',
            url: '/gef/application-details/mock-deal-1/facilities/mockFacility2/',
            value: { amount: 0, currency: '' },
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
