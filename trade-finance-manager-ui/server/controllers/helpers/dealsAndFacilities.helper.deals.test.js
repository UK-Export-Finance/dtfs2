import { AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import api from '../../api';
import PageOutOfBoundsError from '../../errors/page-out-of-bounds.error';
import { mockRes as generateMockRes } from '../../test-mocks';
import { queryDealsOrFacilities, renderDealsOrFacilitiesPage } from './dealsAndFacilities.helper';
import { DEAL } from '../../constants';

describe('controllers - deals', () => {
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
  const mockDeals = [
    {
      _id: '0',
      tfm: {
        stage: DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS,
      },
    },
    {
      _id: '1',
      tfm: {
        stage: DEAL.DEAL_STAGE.APPROVED_WITHOUT_CONDITIONS,
      },
    },
  ];
  const mockApiGetDealsResponse = {
    deals: mockDeals,
    pagination: {
      totalItems: mockDeals.length,
      currentPage: 0,
      totalPages: 1,
    },
  };
  const mockAmendments = [
    {
      status: AMENDMENT_STATUS.IN_PROGRESS,
      dealId: '0',
    },
    {
      status: AMENDMENT_STATUS.NOT_STARTED,
      dealId: '1',
    },
  ];
  const mockApiGetAllAmendmentsInProgressResponse = {
    data: mockAmendments,
  };

  beforeEach(() => {
    mockRes = generateMockRes();
  });

  describe('renderDealsOrFacilitiesPage', () => {
    describe('when called with `deals` as its first argument', () => {
      describe('when there are deals', () => {
        beforeEach(() => {
          api.getDeals = jest.fn().mockImplementation(() => Promise.resolve(mockApiGetDealsResponse));
          api.getAllAmendmentsInProgress = jest.fn().mockImplementation(() => Promise.resolve({}));
        });

        describe('when the pageNumber, sortfield, sortorder and search are not specified in the request', () => {
          const mockReq = structuredClone(mockReqTemplate);

          itShouldMakeRequestsForDealsDataWithDefaultArguments(mockReq);
          itShouldRenderDealsTemplateWithDefaultArguments({ mockReq });
        });

        describe('when the pageNumber is less than 0', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.params.pageNumber = '-1';

          it('should redirect to not-found route', async () => {
            await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
            expect(mockRes.redirect).toHaveBeenCalledWith('/not-found');
          });
        });

        describe('when the pageNumber cannot be converted to a number', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.params.pageNumber = 'hello world';

          itShouldMakeRequestsForDealsDataWithDefaultArguments(mockReq);
          itShouldRenderDealsTemplateWithDefaultArguments({ mockReq });
        });

        describe('when the sortfield and sortorder are specified in the request', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.query.sortfield = 'dealSnapshot.ukefDealId';
          mockReq.query.sortorder = 'ascending';

          it('should make requests to TFM API for the deals data with the correct arguments', async () => {
            await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
            expect(api.getDeals).toHaveBeenCalledWith(
              {
                sortBy: {
                  field: 'dealSnapshot.ukefDealId',
                  order: 'ascending',
                },
                pagesize: 20,
                page: 0,
              },
              'userToken',
            );
          });

          it('should render the deals template with the deals data and the correct arguments', async () => {
            await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
            expect(mockRes.render).toHaveBeenCalledWith('deals/deals.njk', {
              heading: 'All deals',
              deals: mockDeals,
              activePrimaryNavigation: 'all deals',
              activeSubNavigation: 'deal',
              sortButtonWasClicked: true,
              user: mockReq.session.user,
              activeSortByField: 'dealSnapshot.ukefDealId',
              activeSortByOrder: 'ascending',
              pages: {
                totalPages: 1,
                currentPage: 0,
                totalItems: mockDeals.length,
              },
              queryString: '?sortfield=dealSnapshot.ukefDealId&sortorder=ascending',
            });
          });
        });

        describe('when a search is specified in the request', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.query.search = 'test';

          it('should make requests to TFM API for the deals data with the correct arguments', async () => {
            await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
            expect(api.getDeals).toHaveBeenCalledWith(
              {
                sortBy: {
                  field: 'tfm.dateReceivedTimestamp',
                  order: 'descending',
                },
                pagesize: 20,
                page: 0,
                searchString: 'test',
              },
              'userToken',
            );
          });

          it('should render the deals template with the deals data and the correct arguments', async () => {
            await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
            expect(mockRes.render).toHaveBeenCalledWith('deals/deals.njk', {
              heading: `${mockDeals.length} results for "${mockReq.query.search}"`,
              deals: mockDeals,
              activePrimaryNavigation: 'all deals',
              activeSubNavigation: 'deal',
              sortButtonWasClicked: false,
              user: mockReq.session.user,
              activeSortByField: 'tfm.dateReceivedTimestamp',
              activeSortByOrder: 'descending',
              pages: {
                totalPages: 1,
                currentPage: 0,
                totalItems: mockDeals.length,
              },
              queryString: `?search=${mockReq.query.search}`,
            });
          });
        });

        describe('when there is an in-progress amendment corresponding to one of the deals', () => {
          beforeEach(() => {
            api.getAllAmendmentsInProgress = jest.fn().mockImplementation(() => Promise.resolve(mockApiGetAllAmendmentsInProgressResponse));
          });

          const mockReq = structuredClone(mockReqTemplate);

          itShouldMakeRequestsForDealsDataWithDefaultArguments(mockReq);
          itShouldRenderDealsTemplateWithDefaultArguments({ mockReq, overrideDealStage: true });
        });
      });

      describe('when there are no deals', () => {
        beforeEach(() => {
          api.getDeals = () =>
            Promise.resolve({
              deals: [],
              pagination: {
                totalItems: 0,
                currentPage: 0,
                totalPages: 1,
              },
            });
        });

        const mockReq = structuredClone(mockReqTemplate);

        it('should render the deals template with the correct arguments and no data', async () => {
          await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
          expect(mockRes.render).toHaveBeenCalledWith('deals/deals.njk', {
            heading: 'All deals',
            deals: [],
            activePrimaryNavigation: 'all deals',
            activeSubNavigation: 'deal',
            sortButtonWasClicked: false,
            user: mockReq.session.user,
            activeSortByField: 'tfm.dateReceivedTimestamp',
            activeSortByOrder: 'descending',
            pages: {
              totalPages: 1,
              currentPage: 0,
              totalItems: 0,
            },
            queryString: '',
          });
        });
      });

      describe('when api.getDeals throws a PageOutOfBoundsError', () => {
        const error = new PageOutOfBoundsError('Requested page number exceeds the maximum page number');
        const mockReq = structuredClone(mockReqTemplate);

        beforeEach(() => {
          api.getDeals = () => Promise.reject(error);
        });

        it('should log the error thrown by api.getDeals', async () => {
          const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
          await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
          expect(consoleErrorMock).toHaveBeenCalledWith(error);
          consoleErrorMock.mockRestore();
        });

        it('should redirect to not-found route', async () => {
          await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
          expect(mockRes.redirect).toHaveBeenCalledWith('/not-found');
        });
      });

      describe('when api.getDeals throws any other error', () => {
        const error = new Error('some error');
        const mockReq = structuredClone(mockReqTemplate);

        beforeEach(() => {
          api.getDeals = () => Promise.reject(error);
        });

        it('should log the error thrown by api.getDeals', async () => {
          const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();
          await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
          expect(consoleErrorMock).toHaveBeenCalledWith(error);
          consoleErrorMock.mockRestore();
        });

        it('should render the problem-with-service page', async () => {
          await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
          expect(mockRes.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
        });
      });
    });

    describe('queryDealsOrFacilities', () => {
      describe('when called with `deals` as its first argument', () => {
        describe('when the pageNumber, sort field/order and search are not specified in the request', () => {
          const mockReq = structuredClone(mockReqTemplate);

          it('should redirect to GET deals without query parameters', async () => {
            await queryDealsOrFacilities('deals', mockReq, mockRes);

            expect(mockRes.redirect).toHaveBeenCalledWith('/deals/0');
          });
        });

        describe('when the pageNumber is less than 0', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.params.pageNumber = '-1';

          it('should redirect to GET deals (page 0) without query parameters', async () => {
            await queryDealsOrFacilities('deals', mockReq, mockRes);

            expect(mockRes.redirect).toHaveBeenCalledWith('/deals/0');
          });
        });

        describe('when the pageNumber cannot be converted to a number', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.params.pageNumber = 'hello world';

          it('should redirect to GET deals (page 0) without query parameters', async () => {
            await queryDealsOrFacilities('deals', mockReq, mockRes);

            expect(mockRes.redirect).toHaveBeenCalledWith('/deals/0');
          });
        });

        describe('when the pageNumber is a non-negative integer', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.params.pageNumber = '2';

          it('should redirect to GET deals (page 0) without query parameters', async () => {
            await queryDealsOrFacilities('deals', mockReq, mockRes);

            expect(mockRes.redirect).toHaveBeenCalledWith('/deals/0');
          });
        });

        describe.each(['ascending', 'descending'])('', (order) => {
          describe(`when a ${order} sort field is specified in the request body`, () => {
            const mockReq = structuredClone(mockReqTemplate);

            mockReq.body[order] = 'dealSnapshot.ukefDealId';

            it('should redirect to GET deals with the correct query parameters', async () => {
              await queryDealsOrFacilities('deals', mockReq, mockRes);

              expect(mockRes.redirect).toHaveBeenCalledWith(`/deals/0?sortfield=dealSnapshot.ukefDealId&sortorder=${order}`);
            });
          });

          describe(`when a ${order} sort field is specified in the query parameters`, () => {
            const mockReq = structuredClone(mockReqTemplate);

            mockReq.query.sortfield = 'dealSnapshot.ukefDealId';
            mockReq.query.sortorder = order;

            it('should redirect to GET deals with the correct query parameters', async () => {
              await queryDealsOrFacilities('deals', mockReq, mockRes);

              expect(mockRes.redirect).toHaveBeenCalledWith(`/deals/0?sortfield=dealSnapshot.ukefDealId&sortorder=${order}`);
            });
          });
        });

        describe('when a sort is specified in the both the request body and the query parameters', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.body.descending = 'dealSnapshot.exporter.companyName';
          mockReq.query.sortfield = 'dealSnapshot.ukefDealId';
          mockReq.query.sortorder = 'ascending';

          it('should redirect to GET deals with query parameters based on the sort specified in the request body', async () => {
            await queryDealsOrFacilities('deals', mockReq, mockRes);

            expect(mockRes.redirect).toHaveBeenCalledWith('/deals/0?sortfield=dealSnapshot.exporter.companyName&sortorder=descending');
          });
        });

        describe('when a search is specified in the request body', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.body.search = 'test';

          it('should redirect to GET deals with the correct query parameters', async () => {
            await queryDealsOrFacilities('deals', mockReq, mockRes);

            expect(mockRes.redirect).toHaveBeenCalledWith('/deals/0?search=test');
          });
        });

        describe('when a search is specified in the query parameters', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.query.search = 'test';

          it('should redirect to GET deals with the correct query parameters', async () => {
            await queryDealsOrFacilities('deals', mockReq, mockRes);

            expect(mockRes.redirect).toHaveBeenCalledWith('/deals/0?search=test');
          });
        });

        describe('when a search is specified in the both the request body and the query parameters', () => {
          const mockReq = structuredClone(mockReqTemplate);

          mockReq.body.search = 'searchFromBody';
          mockReq.query.search = 'searchFromQuery';

          it('should redirect to GET deals with query parameters based on the search specified in the request body', async () => {
            await queryDealsOrFacilities('deals', mockReq, mockRes);

            expect(mockRes.redirect).toHaveBeenCalledWith('/deals/0?search=searchFromBody');
          });
        });
      });
    });
  });

  function itShouldMakeRequestsForDealsDataWithDefaultArguments(mockReq) {
    it('should make requests to TFM API for the deals data with the default arguments', async () => {
      await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
      expect(api.getDeals).toHaveBeenCalledWith(
        {
          sortBy: {
            field: 'tfm.dateReceivedTimestamp',
            order: 'descending',
          },
          pagesize: 20,
          page: 0,
        },
        'userToken',
      );
      expect(api.getAllAmendmentsInProgress).toHaveBeenCalledWith('userToken');
    });
  }

  function itShouldRenderDealsTemplateWithDefaultArguments({ mockReq, overrideDealStage }) {
    it('should render the deals template with the deals data and the default arguments', async () => {
      await renderDealsOrFacilitiesPage('deals', mockReq, mockRes);
      expect(mockRes.render).toHaveBeenCalledWith('deals/deals.njk', {
        heading: 'All deals',
        deals: [
          {
            _id: '0',
            tfm: {
              stage: overrideDealStage ? DEAL.DEAL_STAGE.AMENDMENT_IN_PROGRESS : DEAL.DEAL_STAGE.UKEF_APPROVED_WITH_CONDITIONS,
            },
          },
          {
            _id: '1',
            tfm: {
              stage: DEAL.DEAL_STAGE.APPROVED_WITHOUT_CONDITIONS,
            },
          },
        ],
        activePrimaryNavigation: 'all deals',
        activeSubNavigation: 'deal',
        sortButtonWasClicked: false,
        user: mockReq.session.user,
        activeSortByField: 'tfm.dateReceivedTimestamp',
        activeSortByOrder: 'descending',
        pages: {
          totalPages: 1,
          currentPage: 0,
          totalItems: mockDeals.length,
        },
        queryString: '',
      });
    });
  }
});
