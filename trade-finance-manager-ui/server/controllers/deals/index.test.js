import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';

describe('controllers - deals', () => {
  let res;
  const mockDeals = [{ _id: 'mock' }, { _id: 'mock' }];
  const sortFormId = 'deals-table-sorting';

  const mockGetDeals = {
    deals: mockDeals,
    pagination: {
      totalItems: mockDeals.length,
      currentPage: 0,
      totalPages: 1,
    },
  };

  beforeEach(() => {
    res = mockRes();
  });

  describe('GET deals', () => {
    describe('when there are deals', () => {
      beforeEach(() => {
        api.getDeals = () => Promise.resolve(mockGetDeals);
        api.getAllAmendmentsInProgress = () => Promise.resolve(mockGetDeals);
      });

      it('should render deals template with data', async () => {
        const mockReq = {
          session: {
            user: {},
          },
          params: {},
          query: {},
        };

        await caseController.getDeals(mockReq, res);
        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: 'All deals',
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
          queryString: ''
        });
      });
    });

    describe('when there are no deals', () => {
      beforeEach(() => {
        api.getDeals = () => Promise.resolve({});
      });

      it('should redirect to not-found route', async () => {
        const mockReq = {
          session: {
            user: {},
          },
          params: {},
          query: {},
        };

        await caseController.getDeals(mockReq, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST deals', () => {
    describe('with req.body.search', () => {
      it('should redirect to GET deals with the correct query parameters', async () => {
        const searchString = 'test';

        const mockReq = {
          session: {
            user: {},
          },
          body: {
            search: searchString,
            formId: sortFormId,
          },
          params: {},
          query: {},
        };

        await caseController.queryDeals(mockReq, res);

        expect(res.redirect).toHaveBeenCalledWith('/deals/0?search=test');
      });
    });

    describe('with req.body.descending', () => {
      const getDealsSpy = jest.fn(() => Promise.resolve(mockGetDeals));

      beforeEach(() => {
        api.getDeals = getDealsSpy;
      });

      it('should redirect to GET deals with the correct query parameters', async () => {
        const mockReq = {
          session: {
            user: {},
          },
          body: {
            descending: 'fieldThatWillBeSortedBy',
            formId: sortFormId,
          },
          params: {},
          query: {},
        };

        await caseController.queryDeals(mockReq, res);

        expect(res.redirect).toHaveBeenCalledWith('/deals/0?sortfield=fieldThatWillBeSortedBy&sortorder=descending');
      });
    });

    describe('with req.body.ascending', () => {
      it('should redirect to GET deals with the correct query parameters', async () => {
        const mockReq = {
          session: {
            user: {},
          },
          body: {
            ascending: 'fieldThatWillBeSortedBy',
            formId: sortFormId,
          },
          params: {},
          query: {},
        };

        await caseController.queryDeals(mockReq, res);

        expect(res.redirect).toHaveBeenCalledWith('/deals/0?sortfield=fieldThatWillBeSortedBy&sortorder=ascending');
      });
    });

    describe('without req.body.search, req.body.ascending or req.body.descending', () => {
      it('should redirect to GET deals without query parameters', async () => {
        const mockReq = {
          session: {
            user: {},
          },
          body: {},
          params: {},
          query: {},
        };

        await caseController.queryDeals(mockReq, res);

        expect(res.redirect).toHaveBeenCalledWith('/deals/0');
      });
    });
  });
});
