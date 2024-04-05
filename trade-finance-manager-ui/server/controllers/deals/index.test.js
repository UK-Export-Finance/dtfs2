import caseController from '.';
import { generateHeadingText } from '../helpers';
import api from '../../api';
import { mockRes } from '../../test-mocks';
import { PRIMARY_NAVIGATION_KEYS } from '../../constants';

describe('controllers - deals', () => {
  let res;
  const mockDeals = [{ _id: 'mock' }, { _id: 'mock' }];
  const sortFormId = 'deals-table-sorting';

  const mockGetDeals = {
    deals: mockDeals,
    count: mockDeals.length,
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
        };

        await caseController.getDeals(mockReq, res);
        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: 'All deals',
          deals: mockDeals,
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          activeSubNavigation: 'deal',
          sortButtonWasClicked: false,
          user: mockReq.session.user,
          activeSortByField: 'tfm.dateReceivedTimestamp',
          activeSortByOrder: 'descending',
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
        };

        await caseController.getDeals(mockReq, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

  describe('POST deals', () => {
    describe('with req.body.search', () => {
      const getDealsSpy = jest.fn(() => Promise.resolve(mockGetDeals));

      beforeEach(() => {
        api.getDeals = getDealsSpy;
      });

      it('should call api and render template with data', async () => {
        const searchString = 'test';

        const mockReq = {
          session: {
            user: {},
          },
          body: {
            search: searchString,
            formId: sortFormId,
          },
        };

        await caseController.queryDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalledWith({ searchString }, undefined);

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          activeSubNavigation: 'deal',
          sortButtonWasClicked: true,
          user: mockReq.session.user,
          activeSortByField: '',
          activeSortByOrder: 'ascending',
        });
      });
    });

    describe('with req.body.descending', () => {
      const getDealsSpy = jest.fn(() => Promise.resolve(mockGetDeals));

      beforeEach(() => {
        api.getDeals = getDealsSpy;
      });

      it('should call api and render template with data', async () => {
        const searchString = '';

        const mockReq = {
          session: {
            user: {},
          },
          body: {
            descending: 'deal.fieldThatWillBeSortedBy',
            formId: sortFormId,
          },
        };

        await caseController.queryDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalledWith(
          {
            searchString: '',
            sortBy: {
              field: mockReq.body.descending,
              order: 'descending',
            },
          },
          undefined,
        );

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          activeSubNavigation: 'deal',
          sortButtonWasClicked: true,
          user: mockReq.session.user,
          activeSortByField: mockReq.body.descending,
          activeSortByOrder: 'descending',
        });
      });
    });

    describe('with req.body.ascending', () => {
      const getDealsSpy = jest.fn(() => Promise.resolve(mockGetDeals));

      beforeEach(() => {
        api.getDeals = getDealsSpy;
      });

      it('should call api and render template with data', async () => {
        const searchString = '';

        const mockReq = {
          session: {
            user: {},
          },
          body: {
            ascending: 'deal.fieldThatWillBeSortedBy',
            formId: sortFormId,
          },
        };

        await caseController.queryDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalledWith(
          {
            searchString: '',
            sortBy: {
              field: mockReq.body.ascending,
              order: 'ascending',
            },
          },
          undefined,
        );

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          activeSubNavigation: 'deal',
          sortButtonWasClicked: true,
          user: mockReq.session.user,
          activeSortByField: mockReq.body.ascending,
          activeSortByOrder: 'ascending',
        });
      });
    });

    describe('without req.body.search, req.body.ascending or req.body.descending', () => {
      const getDealsSpy = jest.fn(() => Promise.resolve(mockGetDeals));

      beforeEach(() => {
        api.getDeals = getDealsSpy;
      });

      it('should call api and render template with data', async () => {
        const searchString = '';

        const mockReq = {
          session: {
            user: {},
          },
          body: {},
        };

        await caseController.queryDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalled();

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          activeSubNavigation: 'deal',
          sortButtonWasClicked: false,
          user: mockReq.session.user,
          activeSortByField: '',
          activeSortByOrder: 'ascending',
        });
      });

      it('Not matching formId causes sortButtonWasClicked to be false', async () => {
        const searchString = '';

        const mockReq = {
          session: {
            user: {},
          },
          body: {
            formId: 'other-form',
          },
        };

        await caseController.queryDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalled();

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
          activeSubNavigation: 'deal',
          sortButtonWasClicked: false,
          user: mockReq.session.user,
          activeSortByField: '',
          activeSortByOrder: 'ascending',
        });
      });
    });
  });
});
