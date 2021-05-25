import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';

const res = mockRes();

describe('controllers - deals', () => {
  describe('GET deals', () => {
    describe('when there are deals', () => {
      const mockDeals = [
        { _id: '1000023' },
        { _id: '1000024' },
      ];

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
});
