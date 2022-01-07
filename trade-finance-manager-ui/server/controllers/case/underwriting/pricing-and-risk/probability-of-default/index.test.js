import probabilityOfDefaultController from '..';
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

describe('GET underwriting - probability of default', () => {
  describe('when deal exists', () => {
    const mockDeal = {
      _id: '1000023',
      dealSnapshot: {
        _id: '1000023',
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {
        probabilityOfDefault: 25,
      },
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should render probability of default template with data', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
      };

      await probabilityOfDefaultController.getUnderWritingProbabilityOfDefault(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/underwriting/pricing-and-risk/probability-of-default.njk',
        {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'underwriting',
          activeSideNavigation: 'pricing and risk',
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

      await probabilityOfDefaultController.getUnderWritingProbabilityOfDefault(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST underwriting - probability of default', () => {
  describe('when deal exists', () => {
    const mockDeal = {
      _id: '1000023',
      dealSnapshot: {
        _id: '1000023',
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {
        probabilityOfDefault: 25,
      },
      mock: true,
    };

    const apiUpdateSpy = jest.fn(() => Promise.resolve({
      updateProbabilityOfDefault: {
        probabilityOfDefault: 45,
      },
    }));

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.updateProbabilityOfDefault = apiUpdateSpy;
    });

    it('should call api.updateProbabilityOfDefault with probabilityOfDefault as a number', async () => {
      const submittedProbabilityOfDefault = '45';

      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
        body: {
          probabilityOfDefault: submittedProbabilityOfDefault,
        },
      };

      await probabilityOfDefaultController.postUnderWritingProbabilityOfDefault(req, res);

      const expectedUpdateObj = {
        probabilityOfDefault: Number(submittedProbabilityOfDefault),
      };

      expect(apiUpdateSpy).toHaveBeenCalledWith(
        mockDeal._id,
        expectedUpdateObj,
      );
    });

    it('should redirect to /pricing-and-risk', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
        body: {
          probabilityOfDefault: '45',
        },
      };

      await probabilityOfDefaultController.postUnderWritingProbabilityOfDefault(req, res);

      // eslint-disable-next-line no-underscore-dangle
      expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/underwriting/pricing-and-risk`);
    });

    describe('with no req.body.probabilityOfDefault', () => {
      it('should return template with validation errors', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            probabilityOfDefault: '',
          },
        };

        await probabilityOfDefaultController.postUnderWritingProbabilityOfDefault(req, res);

        const expectedValidationErrors = {
          count: 1,
          errorList: {
            probabilityOfDefault: {
              text: 'Enter a probability of default',
              order: '1',
            },
          },
          summary: [{
            text: 'Enter a probability of default',
            href: '#probabilityOfDefault',
          }],
        };

        // eslint-disable-next-line no-underscore-dangle
        expect(res.render).toHaveBeenCalledWith(
          'case/underwriting/pricing-and-risk/probability-of-default.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            activeSideNavigation: 'pricing and risk',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              ...req.body,
            },
            dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
            user: session.user,
            validationErrors: expectedValidationErrors,
          },
        );
      });
    });

    describe('when non numeric probability of default is submitted', () => {
      it('should return template with validation errors', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            probabilityOfDefault: '10x',
          },
        };

        await probabilityOfDefaultController.postUnderWritingProbabilityOfDefault(req, res);

        const expectedValidationErrors = {
          count: 1,
          errorList: {
            probabilityOfDefault: {
              text: 'Enter a numeric value',
              order: '1',
            },
          },
          summary: [{
            text: 'Enter a numeric value',
            href: '#probabilityOfDefault',
          }],
        };

        // eslint-disable-next-line no-underscore-dangle
        expect(res.render).toHaveBeenCalledWith(
          'case/underwriting/pricing-and-risk/probability-of-default.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            activeSideNavigation: 'pricing and risk',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              probabilityOfDefault: req.body.probabilityOfDefault,
            },
            dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
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

      await probabilityOfDefaultController.postUnderWritingProbabilityOfDefault(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
