/* eslint-disable no-underscore-dangle */
import underwritingController from '.';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import helpers from '../helpers';
import CONSTANTS from '../../../constants';

const {
  userIsInTeam,
} = helpers;

const res = mockRes();

const session = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['TEAM1'],
  },
};

describe('GET underwriting - pricing and risk', () => {
  describe('when deal exists', () => {
    const mockDeal = {
      _id: '1000023',
      dealSnapshot: {
        _id: '1000023',
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {},
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should render pricing and risk template with data', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
      };

      await underwritingController.getUnderWritingPricingAndRisk(req, res);
      expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/pricing-and-risk.njk',
        {
          userCanEdit: userIsInTeam(session.user, CONSTANTS.TEAMS.UNDERWRITING_SUPPORT),
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'underwriting',
          activeSideNavigation: 'pricing and risk',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
          user: session.user,
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

      await underwritingController.getUnderWritingPricingAndRisk(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('GET underwriting - pricing and risk edit', () => {
  describe('when deal exists', () => {
    const mockDeal = {
      _id: '1000023',
      dealSnapshot: {
        _id: '1000023',
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {},
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should render edit pricing and risk template with data', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
      };

      await underwritingController.getUnderWritingPricingAndRiskEdit(req, res);
      expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk',
        {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'underwriting',
          activeSideNavigation: 'pricing and risk',
          deal: mockDeal.dealSnapshot,
          tfm: mockDeal.tfm,
          dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
          user: session.user,
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

      await underwritingController.getUnderWritingPricingAndRiskEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST underwriting - pricing and risk edit', () => {
  describe('when deal exists', () => {
    const mockDeal = {
      _id: '1000023',
      dealSnapshot: {
        _id: '1000023',
        submissionDetails: {
          supplierName: 'test supplier',
        },
      },
      tfm: {},
      mock: true,
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.updateCreditRating = () => Promise.resolve({
        updateCreditRating: {
          exporterCreditRating: 'Good (BB-)',
        },
      });
    });

    it('should redirect to /pricing-and-risk', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
        body: {
          exporterCreditRating: 'Good (BB-)',
        },
      };

      await underwritingController.postUnderWritingPricingAndRisk(req, res);

      // eslint-disable-next-line no-underscore-dangle
      expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/underwriting/pricing-and-risk`);
    });

    describe('with no req.body.exporterCreditRating', () => {
      it('should return template with validation errors', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            exporterCreditRating: '',
          },
        };

        await underwritingController.postUnderWritingPricingAndRisk(req, res);

        const expectedValidationErrors = {
          count: 1,
          errorList: {
            exporterCreditRating: {
              text: 'Enter a credit rating',
              order: '1',
            },
          },
          summary: [{
            text: 'Enter a credit rating',
            href: '#exporterCreditRating',
          }],
        };

        // eslint-disable-next-line no-underscore-dangle
        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk',
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
          });
      });
    });

    describe('with req.body.exporterCreditRating as `Other`, but no req.body.exporterCreditRatingOther', () => {
      it('should return template with validation errors', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            exporterCreditRating: 'Other',
            exporterCreditRatingOther: '',
          },
        };

        await underwritingController.postUnderWritingPricingAndRisk(req, res);

        const expectedValidationErrors = {
          count: 1,
          errorList: {
            exporterCreditRatingOther: {
              text: 'Enter a credit rating',
              order: '1',
            },
          },
          summary: [{
            text: 'Enter a credit rating',
            href: '#exporterCreditRatingOther',
          }],
        };

        // eslint-disable-next-line no-underscore-dangle
        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            activeSideNavigation: 'pricing and risk',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              exporterCreditRating: req.body.exporterCreditRating,
            },
            dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
            user: session.user,
            validationErrors: expectedValidationErrors,
          });
      });
    });

    describe('with req.body.exporterCreditRating as `Other`, but req.body.exporterCreditRatingOther contains numbers', () => {
      it('should return template with validation errors', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            exporterCreditRating: 'Other',
            exporterCreditRatingOther: 'test100',
          },
        };

        await underwritingController.postUnderWritingPricingAndRisk(req, res);

        const expectedValidationErrors = {
          count: 1,
          errorList: {
            exporterCreditRatingOther: {
              text: 'Credit rating must not include numbers',
              order: '1',
            },
          },
          summary: [{
            text: 'Credit rating must not include numbers',
            href: '#exporterCreditRatingOther',
          }],
        };

        // eslint-disable-next-line no-underscore-dangle
        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            activeSideNavigation: 'pricing and risk',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              exporterCreditRating: req.body.exporterCreditRatingOther,
            },
            dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
            user: session.user,
            validationErrors: expectedValidationErrors,
          });
      });
    });

    describe('with req.body.exporterCreditRating as `Other` and req.body.exporterCreditRatingOther, and exporterCreditRatingOther does not match existing deal value', () => {
      it('should redirect to /pricing-and-risk', async () => {
        const req = {
          params: {
            _id: mockDeal._id,
          },
          session,
          body: {
            exporterCreditRating: 'Other',
            exporterCreditRatingOther: 'The other value',
          },
        };

        await underwritingController.postUnderWritingPricingAndRisk(req, res);

        // eslint-disable-next-line no-underscore-dangle
        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/underwriting/pricing-and-risk`);
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

      await underwritingController.postUnderWritingPricingAndRisk(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
