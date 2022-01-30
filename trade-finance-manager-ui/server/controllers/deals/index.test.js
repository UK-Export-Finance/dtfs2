import caseController from '.';
import generateHeadingText from '../helpers';
import api from '../../api';
import { mockRes } from '../../test-mocks';

describe('controllers - deals', () => {
  let res;
  const mockDeals = [
    { _id: '61f6ac5b02ffda01b1e8efef' },
    { _id: '61f6ac5b02ffda01b1e8efeg' },
  ];

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
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
          user: mockReq.session.user,
          activeSortByField: 'dealSnapshot.details.submissionDate',
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
          },
        };

        await caseController.queryDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalledWith({ searchString });

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
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
          },
        };

        await caseController.queryDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalledWith({
          searchString: '',
          sortBy: {
            field: mockReq.body.descending,
            order: 'descending',
          },
        });

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
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
          },
        };

        await caseController.queryDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalledWith({
          searchString: '',
          sortBy: {
            field: mockReq.body.ascending,
            order: 'ascending',
          },
        });

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
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
          body: {
          },
        };

        await caseController.queryDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalled();

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
          user: mockReq.session.user,
          activeSortByField: '',
          activeSortByOrder: 'ascending',
        });
      });
    });
  });
});
