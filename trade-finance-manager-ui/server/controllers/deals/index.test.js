import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';

const res = mockRes();

describe('controllers - deals', () => {
  const mockDeals = [
    { _id: '1000023' },
    { _id: '1000024' },
  ];

  describe('GET deals', () => {
    describe('when there are deals', () => {
      beforeEach(() => {
        api.getDeals = () => Promise.resolve(mockDeals);
      });

      it('should render deals template with data', async () => {
        const mockReq = {
          session: {
            user: {},
          },
        };

        await caseController.getDeals(mockReq, res);
        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          deals: mockDeals,
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
          user: mockReq.session.user,
        });
      });
    });

    describe('when there are no deals', () => {
      beforeEach(() => {
        api.getDeals = () => Promise.resolve();
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
      const getDealsSpy = jest.fn(() => Promise.resolve(mockDeals));

      beforeEach(() => {
        // api.getDeals = () => Promise.resolve(mockDeals);
        api.getDeals = getDealsSpy;
      });

      it('should call api and render template with data', async () => {
        const mockReq = {
          session: {
            user: {},
          },
          body: {
            search: 'test',
          },
        };

        await caseController.searchDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalledWith(mockReq.body.search);

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          deals: mockDeals,
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
          user: mockReq.session.user,
        });
      });
    });

    describe('without req.body.search', () => {
      const getDealsSpy = jest.fn(() => Promise.resolve(mockDeals));

      beforeEach(() => {
        // api.getDeals = () => Promise.resolve(mockDeals);
        api.getDeals = getDealsSpy;
      });

      it('should call api and render template with data', async () => {
        const mockReq = {
          session: {
            user: {},
          },
          body: {
            search: '',
          },
        };

        await caseController.searchDeals(mockReq, res);

        expect(getDealsSpy).toHaveBeenCalled();

        expect(res.render).toHaveBeenCalledWith('deals/deals.njk', {
          deals: mockDeals,
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
          user: mockReq.session.user,
        });
      });
    });
  });
});
