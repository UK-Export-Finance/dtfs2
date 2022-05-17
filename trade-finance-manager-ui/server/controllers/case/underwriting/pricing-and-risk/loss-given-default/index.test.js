import lossGivenDefaultController from '..';
import api from '../../../../../api';
import { mockRes } from '../../../../../test-mocks';

const res = mockRes();

const session = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['UNDERWRITERS'],
  },
};

describe('GET underwriting - loss given default', () => {
  describe('when deal exists', () => {
    const mockDeal = {
      _id: '61f6ac5b02ffda01b1e8efef',
      dealSnapshot: {
        _id: '61f6ac5b02ffda01b1e8efef',
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {
        lossGivenDefault: '50',
      },
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should render loss given default template with data', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
      };

      await lossGivenDefaultController.getUnderWritingLossGivenDefault(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/underwriting/pricing-and-risk/loss-given-default.njk',
        {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'underwriting',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id,
          user: session.user,
        },
      );
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
        session,
      };

      await lossGivenDefaultController.getUnderWritingLossGivenDefault(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST underwriting - loss given default', () => {
  const apiUpdateSpy = jest.fn(() => Promise.resolve({
    lossGivenDefault: 45,
  }));

  describe('when deal exists', () => {
    const mockDeal = {
      _id: '61f6ac5b02ffda01b1e8efef',
      dealSnapshot: {
        _id: '61f6ac5b02ffda01b1e8efef',
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {
        lossGivenDefault: '50',
      },
      mock: true,
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.updateLossGivenDefault = apiUpdateSpy;
    });

    it('should call API and redirect to /pricing-and-risk', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
        body: {
          lossGivenDefault: '45',
        },
      };

      await lossGivenDefaultController.postUnderWritingLossGivenDefault(req, res);

      expect(apiUpdateSpy).toHaveBeenCalledWith(
        mockDeal._id,
        { lossGivenDefault: Number(req.body.lossGivenDefault) },
      );

      expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/underwriting`);
    });

    describe('with no req.body.lossGivenDefault', () => {
      it('should return template with validation errors', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            lossGivenDefault: '',
          },
        };

        await lossGivenDefaultController.postUnderWritingLossGivenDefault(req, res);

        const expectedValidationErrors = {
          count: 1,
          errorList: {
            lossGivenDefault: {
              text: 'Enter a loss given default',
              order: '1',
            },
          },
          summary: [{
            text: 'Enter a loss given default',
            href: '#lossGivenDefault',
          }],
        };

        expect(res.render).toHaveBeenCalledWith(
          'case/underwriting/pricing-and-risk/loss-given-default.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              ...req.body,
            },
            dealId: mockDeal.dealSnapshot._id,
            user: session.user,
            validationErrors: expectedValidationErrors,
          },
        );
      });
    });

    describe('with loss given default < 1', () => {
      it('should return template with validation errors', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            lossGivenDefault: '0.5',
          },
        };

        await lossGivenDefaultController.postUnderWritingLossGivenDefault(req, res);

        const expectedValidationErrors = {
          count: 1,
          errorList: {
            lossGivenDefault: {
              text: 'Enter a value between 1 - 100',
              order: '1',
            },
          },
          summary: [{
            text: 'Enter a value between 1 - 100',
            href: '#lossGivenDefault',
          }],
        };

        expect(res.render).toHaveBeenCalledWith(
          'case/underwriting/pricing-and-risk/loss-given-default.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              lossGivenDefault: req.body.lossGivenDefault,
            },
            dealId: mockDeal.dealSnapshot._id,
            user: session.user,
            validationErrors: expectedValidationErrors,
          },
        );
      });
    });

    describe('with loss given default > 100', () => {
      it('should return template with validation errors', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            lossGivenDefault: '105',
          },
        };

        await lossGivenDefaultController.postUnderWritingLossGivenDefault(req, res);

        const expectedValidationErrors = {
          count: 1,
          errorList: {
            lossGivenDefault: {
              text: 'Enter a value between 1 - 100',
              order: '1',
            },
          },
          summary: [{
            text: 'Enter a value between 1 - 100',
            href: '#lossGivenDefault',
          }],
        };

        expect(res.render).toHaveBeenCalledWith(
          'case/underwriting/pricing-and-risk/loss-given-default.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              lossGivenDefault: req.body.lossGivenDefault,
            },
            dealId: mockDeal.dealSnapshot._id,
            user: session.user,
            validationErrors: expectedValidationErrors,
          },
        );
      });
    });

    describe('with non numeric loss given default', () => {
      it('should return template with validation errors', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            lossGivenDefault: '10x',
          },
        };

        await lossGivenDefaultController.postUnderWritingLossGivenDefault(req, res);

        const expectedValidationErrors = {
          count: 1,
          errorList: {
            lossGivenDefault: {
              text: 'Enter a value between 1 - 100',
              order: '1',
            },
          },
          summary: [{
            text: 'Enter a value between 1 - 100',
            href: '#lossGivenDefault',
          }],
        };

        expect(res.render).toHaveBeenCalledWith(
          'case/underwriting/pricing-and-risk/loss-given-default.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              lossGivenDefault: req.body.lossGivenDefault,
            },
            dealId: mockDeal.dealSnapshot._id,
            user: session.user,
            validationErrors: expectedValidationErrors,
          },
        );
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
        session,
      };

      await lossGivenDefaultController.postUnderWritingLossGivenDefault(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
