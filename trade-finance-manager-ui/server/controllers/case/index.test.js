import caseController from '.';
import api from '../../api';
import { mockRes } from '../../test-mocks';

const res = mockRes();

describe('controllers - case', () => {
  describe('GET case deals', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
          },
        };

        await caseController.getCaseDeal(req, res);
        expect(res.render).toHaveBeenCalledWith('case/deal/deal.njk', {
          deal: mockDeal,
          active_sheet: 'deal',
          dealId: req.params._id, // eslint-disable-line no-underscore-dangle
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

  describe('GET case parties', () => {
    describe('when deal exists', () => {
      const mockDeal = {
        _id: '1000023',
        mock: true,
      };

      beforeEach(() => {
        api.getDeal = () => Promise.resolve(mockDeal);
      });

      it('should render deal template with data', async () => {
        const req = {
          params: {
            _id: mockDeal._id, // eslint-disable-line no-underscore-dangle
          },
        };

        await caseController.getCaseParties(req, res);
        expect(res.render).toHaveBeenCalledWith('case/parties/parties.njk', {
          deal: mockDeal,
          active_sheet: 'parties',
          dealId: req.params._id, // eslint-disable-line no-underscore-dangle
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

        await caseController.getCaseParties(req, res);
        expect(res.redirect).toHaveBeenCalledWith('/not-found');
      });
    });
  });

});
