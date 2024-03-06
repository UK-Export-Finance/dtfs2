import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';
import CONSTANTS from '../../constants';

describe('controllers - facilities', () => {
  let res;
  const mockFacilities = [
    {
      dealId: '121212',
      facilityId: '112233',
      ukefFacilityId: '123456',
      type: CONSTANTS.FACILITY.FACILITY_TYPE.CASH,
      companyName: 'Mock Company Name',
      value: 'GBP 1,000,000.00',
      coverEndDate: '2021-08-12T00:00:00.000Z',
      dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
      hasBeenIssued: true,
      currency: 'GBP',
    },
    {
      dealId: '122122',
      facilityId: '223344',
      ukefFacilityId: '1234567',
      type: CONSTANTS.FACILITY.FACILITY_TYPE.CASH,
      companyName: 'Mock Company Name',
      value: 'EUR 18,000,000.00',
      coverEndDate: null,
      dealType: CONSTANTS.DEAL.DEAL_TYPE.BSS_EWCS,
      hasBeenIssued: false,
      currency: 'EUR',
    },
  ];

  const mockGetFacilities = {
    facilities: mockFacilities,
    pagination: {
      totalItems: 2,
      currentPage: 0,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    res = mockRes();
  });

  describe('GET all facilities', () => {
    describe('when there are facilities', () => {
      beforeEach(() => {
        api.getFacilities = () => Promise.resolve(mockGetFacilities); // TODO: look at this line
        api.getAllAmendmentsInProgress = () => Promise.resolve({ data: [] });
      });

      it('should render facilities template with data', async () => {
        const mockReq = {
          params: {},
          query: {},
          session: { user: {} },
        };

        await caseController.getFacilities(mockReq, res);
        expect(res.render).toHaveBeenCalledWith('facilities/facilities.njk', {
          heading: 'All facilities',
          facilities: mockFacilities,
          activePrimaryNavigation: 'all facilities',
          activeSubNavigation: 'facility',
          user: mockReq.session.user,
          sortButtonWasClicked: false,
          activeSortByField: CONSTANTS.FACILITY.TFM_SORT_BY_DEFAULT.field,
          activeSortByOrder: CONSTANTS.FACILITY.TFM_SORT_BY_DEFAULT.order,
          pages: {
            totalPages: 1,
            currentPage: 0,
            totalItems: 2,
          },
          queryString: '',
        });
      });
    });

    describe('when there are no facilities', () => {
      beforeEach(() => {
        api.getFacilities = () => Promise.resolve({});
      });

      it('should redirect to not-found route', async () => {
        const mockReq = {
          params: {},
          query: {},
          session: { user: {} },
        };

        await caseController.getFacilities(mockReq, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST facilities', () => {
    describe('with searchString parameter', () => {
      const getFacilitiesSpy = jest.fn(() => Promise.resolve(mockGetFacilities));

      beforeEach(() => {
        api.getFacilities = getFacilitiesSpy;
      });

      it('should redirect to GET /facilities with a query string based on the searchString', async () => {
        const searchString = 'test';

        const mockReq = {
          params: {},
          query: {},
          session: { user: {} },
          body: { search: searchString },
        };

        await caseController.queryFacilities(mockReq, res);

        expect(res.redirect).toHaveBeenCalledWith('/facilities/0?search=test');
      });
    });

    describe('without searchString parameter', () => {
      const getFacilitiesSpy = jest.fn(() => Promise.resolve(mockGetFacilities));

      beforeEach(() => {
        api.getFacilities = getFacilitiesSpy;
      });

      it('should call api and render template with data', async () => {
        const mockReq = {
          params: {},
          query: {},
          session: { user: {} },
          body: {},
        };

        await caseController.queryFacilities(mockReq, res);

        expect(res.redirect).toHaveBeenCalledWith('/facilities/0');
      });
    });
  });
});
