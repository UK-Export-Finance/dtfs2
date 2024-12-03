import { AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import api from '../../api';
import PageOutOfBoundsError from '../../errors/page-out-of-bounds.error';
import { mockRes as generateMockRes } from '../../test-mocks';
import { queryDealsOrFacilities, renderDealsOrFacilitiesPage } from './dealsAndFacilities.helper';

describe('controllers - facilities', () => {
  let mockRes;
  const mockReqTemplate = {
    session: {
      user: {},
      userToken: 'userToken',
    },
    body: {},
    params: {},
    query: {},
  };
  const mockFacilities = [
    {
      facilityId: '0',
      hasAmendmentInProgress: false,
    },
    {
      facilityId: '1',
      hasAmendmentInProgress: false,
    },
  ];
  const mockApiGetFacilitiesResponse = {
    facilities: mockFacilities,
    pagination: {
      totalItems: mockFacilities.length,
      currentPage: 0,
      totalPages: 1,
    },
  };
  const mockAmendments = [
    {
      status: AMENDMENT_STATUS.IN_PROGRESS,
      facilityId: '0',
    },
    {
      status: AMENDMENT_STATUS.NOT_STARTED,
      facilityId: '1',
    },
  ];
  const mockApiGetAllAmendmentsInProgressResponse = {
    data: mockAmendments,
  };

  beforeEach(() => {
    mockRes = generateMockRes();
  });

  describe('renderDealsOrFacilitiesPage', () => {
    describe('when called with `facilities` as its first argument', () => {
      describe('when there are facilities', () => {
        beforeEach(() => {
          api.getFacilities = jest.fn().mockImplementation(() => Promise.resolve(mockApiGetFacilitiesResponse));
          api.getAllAmendmentsInProgress = jest.fn().mockImplementation(() => Promise.resolve({}));
        });

        describe('when the pageNumber, sortfield, sortorder and search are not specified in the request', () => {
          const mockReq = structuredClone(mockReqTemplate);

          itShouldMakeRequestsForFacilitiesDataWithDefaultArguments(mockReq);
          itShouldRenderFacilitiesTemplateWithDefaultArguments({ mockReq, hasAmendmentInProgress: false });
        });

        describe('when the pageNumber is less than 0', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.params.pageNumber = '-1';

          it('should redirect to not-found route', async () => {
            await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
            expect(mockRes.redirect).toHaveBeenCalledWith('/not-found');
          });
        });

        describe('when the pageNumber cannot be converted to a number', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.params.pageNumber = 'hello world';

          itShouldMakeRequestsForFacilitiesDataWithDefaultArguments(mockReq);
          itShouldRenderFacilitiesTemplateWithDefaultArguments({ mockReq, hasAmendmentInProgress: false });
        });

        describe('when the sortfield and sortorder are specified in the request', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.query.sortfield = 'tfmFacilities.dealType';
          mockReq.query.sortorder = 'ascending';

          it('should make requests to TFM API for the facilities data with the correct arguments', async () => {
            await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
            expect(api.getFacilities).toHaveBeenCalledWith(
              {
                sortBy: {
                  field: 'tfmFacilities.dealType',
                  order: 'ascending',
                },
                pagesize: 20,
                page: 0,
              },
              'userToken',
            );
          });

          it('should render the facilities template with the facilities data and the correct arguments', async () => {
            await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
            expect(mockRes.render).toHaveBeenCalledWith('facilities/facilities.njk', {
              heading: 'All facilities',
              facilities: mockFacilities,
              activePrimaryNavigation: 'all facilities',
              activeSubNavigation: 'facility',
              sortButtonWasClicked: true,
              user: mockReq.session.user,
              activeSortByField: 'tfmFacilities.dealType',
              activeSortByOrder: 'ascending',
              pages: {
                totalPages: 1,
                currentPage: 0,
                totalItems: mockFacilities.length,
              },
              queryString: '?sortfield=tfmFacilities.dealType&sortorder=ascending',
            });
          });
        });

        describe('when a search is specified in the request', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.query.search = 'test';

          it('should make requests to TFM API for the facilities data with the correct arguments', async () => {
            await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
            expect(api.getFacilities).toHaveBeenCalledWith(
              {
                sortBy: {
                  field: 'ukefFacilityId',
                  order: 'ascending',
                },
                pagesize: 20,
                page: 0,
                searchString: 'test',
              },
              'userToken',
            );
          });

          it('should render the facilities template with the facilities data and the correct arguments', async () => {
            await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
            expect(mockRes.render).toHaveBeenCalledWith('facilities/facilities.njk', {
              heading: `${mockFacilities.length} results for "${mockReq.query.search}"`,
              facilities: mockFacilities,
              activePrimaryNavigation: 'all facilities',
              activeSubNavigation: 'facility',
              sortButtonWasClicked: false,
              user: mockReq.session.user,
              activeSortByField: 'ukefFacilityId',
              activeSortByOrder: 'ascending',
              pages: {
                totalPages: 1,
                currentPage: 0,
                totalItems: mockFacilities.length,
              },
              queryString: `?search=${mockReq.query.search}`,
            });
          });
        });

        describe('when there is an in-progress amendment corresponding to one of the facilities', () => {
          beforeEach(() => {
            api.getAllAmendmentsInProgress = jest.fn().mockImplementation(() => Promise.resolve(mockApiGetAllAmendmentsInProgressResponse));
          });

          const mockReq = structuredClone(mockReqTemplate);

          itShouldMakeRequestsForFacilitiesDataWithDefaultArguments(mockReq);
          itShouldRenderFacilitiesTemplateWithDefaultArguments({ mockReq, hasAmendmentInProgress: true });
        });
      });

      describe('when there are no facilities', () => {
        beforeEach(() => {
          api.getFacilities = () =>
            Promise.resolve({
              facilities: [],
              pagination: {
                totalItems: 0,
                currentPage: 0,
                totalPages: 1,
              },
            });
        });

        const mockReq = structuredClone(mockReqTemplate);

        it('should render the facilities template with the correct arguments and no data', async () => {
          await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
          expect(mockRes.render).toHaveBeenCalledWith('facilities/facilities.njk', {
            heading: 'All facilities',
            facilities: [],
            activePrimaryNavigation: 'all facilities',
            activeSubNavigation: 'facility',
            sortButtonWasClicked: false,
            user: mockReq.session.user,
            activeSortByField: 'ukefFacilityId',
            activeSortByOrder: 'ascending',
            pages: {
              totalPages: 1,
              currentPage: 0,
              totalItems: 0,
            },
            queryString: '',
          });
        });
      });

      describe('when api.getFacilities throws a PageOutOfBoundsError', () => {
        const error = new PageOutOfBoundsError('Requested page number exceeds the maximum page number');
        const mockReq = structuredClone(mockReqTemplate);

        beforeEach(() => {
          api.getFacilities = () => Promise.reject(error);
        });

        it('should log the error thrown by api.getFacilities', async () => {
          const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
          await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
          expect(consoleErrorMock).toHaveBeenCalledWith(error);
          consoleErrorMock.mockRestore();
        });

        it('should redirect to not-found route', async () => {
          await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
          expect(mockRes.redirect).toHaveBeenCalledWith('/not-found');
        });
      });

      describe('when api.getFacilities throws any other error', () => {
        const error = new Error('some error');
        const mockReq = structuredClone(mockReqTemplate);

        beforeEach(() => {
          api.getFacilities = () => Promise.reject(error);
        });

        it('should log the error thrown by api.getFacilities', async () => {
          const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
          await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
          expect(consoleErrorMock).toHaveBeenCalledWith(error);
          consoleErrorMock.mockRestore();
        });

        it('should render the problem-with-service page', async () => {
          await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
          expect(mockRes.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
        });
      });
    });
  });

  describe('queryDealsOrFacilities', () => {
    describe('when called with `facilities` as its first argument', () => {
      describe('when the pageNumber, sort field/order and search are not specified in the request', () => {
        const mockReq = structuredClone(mockReqTemplate);

        it('should redirect to GET facilities without query parameters', async () => {
          await queryDealsOrFacilities('facilities', mockReq, mockRes);

          expect(mockRes.redirect).toHaveBeenCalledWith('/facilities/0');
        });
      });

      describe('when the pageNumber is less than 0', () => {
        const mockReq = structuredClone(mockReqTemplate);

        mockReq.params.pageNumber = '-1';

        it('should redirect to GET facilities (page 0) without query parameters', async () => {
          await queryDealsOrFacilities('facilities', mockReq, mockRes);

          expect(mockRes.redirect).toHaveBeenCalledWith('/facilities/0');
        });
      });

      describe('when the pageNumber cannot be converted to a number', () => {
        const mockReq = structuredClone(mockReqTemplate);

        mockReq.params.pageNumber = 'hello world';

        it('should redirect to GET facilities (page 0) without query parameters', async () => {
          await queryDealsOrFacilities('facilities', mockReq, mockRes);

          expect(mockRes.redirect).toHaveBeenCalledWith('/facilities/0');
        });
      });

      describe('when the pageNumber is a non-negative integer', () => {
        const mockReq = structuredClone(mockReqTemplate);

        mockReq.params.pageNumber = '2';

        it('should redirect to GET facilities (page 0) without query parameters', async () => {
          await queryDealsOrFacilities('facilities', mockReq, mockRes);

          expect(mockRes.redirect).toHaveBeenCalledWith('/facilities/0');
        });
      });

      describe.each(['ascending', 'descending'])('', (order) => {
        describe(`when a ${order} sort field is specified in the request body`, () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.body[order] = 'tfmFacilities.dealType';

          it('should redirect to GET facilities with the correct query parameters', async () => {
            await queryDealsOrFacilities('facilities', mockReq, mockRes);

            expect(mockRes.redirect).toHaveBeenCalledWith(`/facilities/0?sortfield=tfmFacilities.dealType&sortorder=${order}`);
          });
        });

        describe(`when a ${order} sort field is specified in the query parameters`, () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.query.sortfield = 'tfmFacilities.dealType';
          mockReq.query.sortorder = order;

          it('should redirect to GET facilities with the correct query parameters', async () => {
            await queryDealsOrFacilities('facilities', mockReq, mockRes);

            expect(mockRes.redirect).toHaveBeenCalledWith(`/facilities/0?sortfield=tfmFacilities.dealType&sortorder=${order}`);
          });
        });
      });

      describe('when a sort is specified in the both the request body and the query parameters', () => {
        const mockReq = structuredClone(mockReqTemplate);

        mockReq.body.descending = 'tfmFacilities.type';
        mockReq.query.sortfield = 'tfmFacilities.dealType';
        mockReq.query.sortorder = 'ascending';

        it('should redirect to GET facilities with query parameters based on the sort specified in the request body', async () => {
          await queryDealsOrFacilities('facilities', mockReq, mockRes);

          expect(mockRes.redirect).toHaveBeenCalledWith('/facilities/0?sortfield=tfmFacilities.type&sortorder=descending');
        });
      });

      describe('when a search is specified in the request body', () => {
        const mockReq = structuredClone(mockReqTemplate);

        mockReq.body.search = 'test';

        it('should redirect to GET facilities with the correct query parameters', async () => {
          await queryDealsOrFacilities('facilities', mockReq, mockRes);

          expect(mockRes.redirect).toHaveBeenCalledWith('/facilities/0?search=test');
        });
      });

      describe('when a search is specified in the query parameters', () => {
        const mockReq = structuredClone(mockReqTemplate);

        mockReq.query.search = 'test';

        it('should redirect to GET facilities with the correct query parameters', async () => {
          await queryDealsOrFacilities('facilities', mockReq, mockRes);

          expect(mockRes.redirect).toHaveBeenCalledWith('/facilities/0?search=test');
        });
      });

      describe('when a search is specified in the both the request body and the query parameters', () => {
        const mockReq = structuredClone(mockReqTemplate);

        mockReq.body.search = 'searchFromBody';
        mockReq.query.search = 'searchFromQuery';

        it('should redirect to GET facilities with query parameters based on the search specified in the request body', async () => {
          await queryDealsOrFacilities('facilities', mockReq, mockRes);

          expect(mockRes.redirect).toHaveBeenCalledWith('/facilities/0?search=searchFromBody');
        });
      });
    });
  });

  function itShouldMakeRequestsForFacilitiesDataWithDefaultArguments(mockReq) {
    it('should make requests to TFM API for the facilities data with the default arguments', async () => {
      await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
      expect(api.getFacilities).toHaveBeenCalledWith(
        {
          sortBy: {
            field: 'ukefFacilityId',
            order: 'ascending',
          },
          pagesize: 20,
          page: 0,
        },
        'userToken',
      );
      expect(api.getAllAmendmentsInProgress).toHaveBeenCalledWith('userToken');
    });
  }

  function itShouldRenderFacilitiesTemplateWithDefaultArguments({ mockReq, hasAmendmentInProgress }) {
    it('should render the facilities template with the facilities data and the default arguments', async () => {
      await renderDealsOrFacilitiesPage('facilities', mockReq, mockRes);
      expect(mockRes.render).toHaveBeenCalledWith('facilities/facilities.njk', {
        heading: 'All facilities',
        facilities: [
          {
            facilityId: '0',
            hasAmendmentInProgress,
          },
          {
            facilityId: '1',
            hasAmendmentInProgress: false,
          },
        ],
        activePrimaryNavigation: 'all facilities',
        activeSubNavigation: 'facility',
        sortButtonWasClicked: false,
        user: mockReq.session.user,
        activeSortByField: 'ukefFacilityId',
        activeSortByOrder: 'ascending',
        pages: {
          totalPages: 1,
          currentPage: 0,
          totalItems: mockFacilities.length,
        },
        queryString: '',
      });
    });
  }
});
