import caseController from '.';
import api from '../../api';
import { mockReq, mockRes } from '../../test-mocks';

const res = mockRes();

describe('controllers - case', () => {
  describe('GET', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        mockDeal: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render deal template with data', async() => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
        };

        await caseController.getCaseDeal(req, res);
        expect(res.render).toHaveBeenCalledWith('case/deal/deal.njk', {
          deal: mockDeal,
        });
      });
    });

    describe('when deal does NOT exist', () => {
      beforeEach(() => {
        api.getDeal = () => Promise.resolve();
      });

      it('should redirect to not-found route', async () => {
        const req = {
          params: {
            _id: '1',
          },
        };

        await caseController.getCaseDeal(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });
});
