import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';

const res = mockRes();

describe.skip('controllers - deals', () => {
  describe('GET deals', () => {
    describe('when deals exist', () => {
      const deals = [{
        _id: '1000023',
        mock: true,
      }, {
        _id: '1000024',
        mock: true,
      }];

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(deals);
      });

      it('should render deal template', async () => {
        const req = {};

        await caseController.getCaseDeal(req, res);
        expect(res.render).toHaveBeenCalledWith('deals.njk', {
          deals,
          activePrimaryNavigation: 'all deals',
          activeSubNavigation: 'deal',
        });
      });
    });
  });
});
