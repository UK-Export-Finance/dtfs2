import pricingAndRiskController from '..';
import api from '../../../../api';
import { mockRes } from '../../../../test-mocks';
import {
  userCanEditGeneral,
} from './helpers';

const res = mockRes();

const mockUser = {
  _id: '12345678',
  username: 'testUser',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: ['UNDERWRITERS', 'RISK_MANAGERS'],
};

const session = {
  user: mockUser,
};

const userCannotEdit = {
  ...mockUser,
  teams: ['BUSINESS_SUPPORT'],
};

const mockDeal = {
  _id: '61f6ac5b02ffda01b1e8efef',
  dealSnapshot: {
    _id: '61f6ac5b02ffda01b1e8efef',
    submissionDetails: {
      supplierName: 'test supplier',
    },
  },
  tfm: {},
};

describe('GET underwriting - pricing and risk', () => {
  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should return the pricing and risk object with data', async () => {
      const result = await pricingAndRiskController.getUnderWritingPricingAndRisk(mockDeal, mockUser);
      expect(result).toEqual(
        {
          userCanEditGeneral: userCanEditGeneral(session.user),
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
});

describe('GET underwriting - pricing and risk edit', () => {
  describe('when deal exists', () => {
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

      await pricingAndRiskController.getUnderWritingPricingAndRiskEdit(req, res);
      expect(res.render).toHaveBeenCalledWith(
        'case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk',
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

      await pricingAndRiskController.getUnderWritingPricingAndRiskEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('when user is not allowed to edit', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session: {
          user: userCannotEdit,
        },
      };

      await pricingAndRiskController.getUnderWritingPricingAndRiskEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST underwriting - pricing and risk edit', () => {
  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.updateUnderwriterManagersDecision = () => Promise.resolve({
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

      await pricingAndRiskController.postUnderWritingPricingAndRisk(req, res);

      expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/underwriting`);
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

        await pricingAndRiskController.postUnderWritingPricingAndRisk(req, res);

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

        expect(res.render).toHaveBeenCalledWith(
          'case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk',
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

        await pricingAndRiskController.postUnderWritingPricingAndRisk(req, res);

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

        expect(res.render).toHaveBeenCalledWith(
          'case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              exporterCreditRating: req.body.exporterCreditRating,
            },
            dealId: mockDeal.dealSnapshot._id,
            user: session.user,
            validationErrors: expectedValidationErrors,
          },
        );
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

        await pricingAndRiskController.postUnderWritingPricingAndRisk(req, res);

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

        expect(res.render).toHaveBeenCalledWith(
          'case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              exporterCreditRating: req.body.exporterCreditRatingOther,
            },
            dealId: mockDeal.dealSnapshot._id,
            user: session.user,
            validationErrors: expectedValidationErrors,
          },
        );
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

        await pricingAndRiskController.postUnderWritingPricingAndRisk(req, res);

        expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/underwriting`);
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

      await pricingAndRiskController.postUnderWritingPricingAndRisk(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });

  describe('when user is not allowed to edit', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: '1',
        },
        session: {
          user: userCannotEdit,
        },
      };

      await pricingAndRiskController.postUnderWritingPricingAndRisk(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
