import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';

describe('controllers - deals', () => {
  let res;
  const mockDeals = [
    { _id: '1000023' },
    { _id: '1000024' },
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

        await caseController.searchDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalledWith(searchString);

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: caseController.generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
          user: mockReq.session.user,
        });
      });
    });

    describe('without req.body.search', () => {
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
            search: searchString,
          },
        };

        await caseController.searchDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalled();

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          heading: caseController.generateHeadingText(mockGetDeals.count, searchString),
          deals: mockDeals,
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
          user: mockReq.session.user,
        });
      });
    });
  });
});
