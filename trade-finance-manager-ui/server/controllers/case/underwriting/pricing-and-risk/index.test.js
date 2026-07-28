import { TEAM_IDS } from '@ukef/dtfs2-common';
import pricingAndRiskController from '..';
import api from '../../../../api';
import { mockRes } from '../../../../test-mocks';
import { userCanEditGeneral } from './helpers';
import { mapOtherCreditRatings } from '../../../../helpers/map-other-credit-ratings';
import { mapSelectedCreditRating } from '../../../../helpers/map-selected-credit-rating';

jest.mock('../../../../helpers/map-other-credit-ratings', () => ({
  mapOtherCreditRatings: jest.fn(),
}));

const res = mockRes();

const mockUser = {
  _id: '12345678',
  username: 'testUser',
  firstName: 'Joe',
  lastName: 'Bloggs',
  teams: [TEAM_IDS.UNDERWRITERS, TEAM_IDS.RISK_MANAGERS],
};

const session = {
  user: mockUser,
};

const userCannotEdit = {
  ...mockUser,
  teams: [TEAM_IDS.BUSINESS_SUPPORT],
};

const mockDeal = {
  _id: '61f6ac5b02fade01b1e8efef',
  dealSnapshot: {
    _id: '61f6ac5b02fade01b1e8efef',
    submissionDetails: {
      supplierName: 'test supplier',
    },
  },
  tfm: {},
};

const label = 'Credit rating';
const otherCreditRatings = [{ value: 'A', text: 'A', selected: false }];

describe('GET underwriting - pricing and risk', () => {
  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should return the pricing and risk object with data', async () => {
      const result = await pricingAndRiskController.getUnderWritingPricingAndRisk(mockDeal, mockUser);
      expect(result).toEqual({
        userCanEditGeneral: userCanEditGeneral(session.user),
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        deal: mockDeal.dealSnapshot,
        tfm: mockDeal.tfm,
        dealId: mockDeal.dealSnapshot._id,
        user: session.user,
      });
    });
  });
});

describe('GET underwriting - pricing and risk edit', () => {
  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      mapOtherCreditRatings.mockResolvedValue(otherCreditRatings);
    });

    it('should render edit pricing and risk template with data', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
      };

      await pricingAndRiskController.getUnderWritingPricingAndRiskEdit(req, res);

      const { goodSelected, acceptableSelected, otherSelected, otherCreditRatingValue } = mapSelectedCreditRating(mockDeal?.tfm?.exporterCreditRating);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        deal: mockDeal.dealSnapshot,
        tfm: mockDeal.tfm,
        dealId: mockDeal.dealSnapshot._id,
        user: session.user,
        goodSelected,
        acceptableSelected,
        otherSelected,
        otherCreditRatingValue,
        otherCreditRatings,
        label,
      });

      // Should pass otherCreditRatingValue (empty string if not Other, or the value if Other is selected)
      expect(mapOtherCreditRatings).toHaveBeenCalledWith(otherCreditRatingValue);
    });

    it('should render problem-with-service when credit ratings are not available', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
      };

      mapOtherCreditRatings.mockResolvedValue(false);

      await pricingAndRiskController.getUnderWritingPricingAndRiskEdit(req, res);

      expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk', { user: session.user });
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
      api.updateCreditRating = jest.fn().mockResolvedValue({});
      mapOtherCreditRatings.mockResolvedValue(otherCreditRatings);
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
          summary: [
            {
              text: 'Enter a credit rating',
              href: '#exporterCreditRating',
            },
          ],
        };

        const { goodSelected, acceptableSelected, otherSelected, otherCreditRatingValue } = mapSelectedCreditRating(req.body.exporterCreditRating);

        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
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
          otherCreditRatings,
          goodSelected,
          acceptableSelected,
          otherSelected,
          otherCreditRatingValue,
          label,
        });

        expect(mapOtherCreditRatings).toHaveBeenCalledWith();
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
          summary: [
            {
              text: 'Enter a credit rating',
              href: '#exporterCreditRatingOther',
            },
          ],
        };

        const { goodSelected, acceptableSelected, otherSelected, otherCreditRatingValue } = mapSelectedCreditRating(req.body.exporterCreditRating);

        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/edit-pricing-and-risk.njk', {
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
          otherCreditRatings,
          goodSelected,
          acceptableSelected,
          otherSelected,
          otherCreditRatingValue,
          label,
        });

        expect(mapOtherCreditRatings).toHaveBeenCalledWith();
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

    it('should render problem-with-service when credit ratings are not available', async () => {
      const req = {
        params: {
          _id: mockDeal._id,
        },
        session,
        body: {
          exporterCreditRating: 'Good (BB-)',
        },
      };

      mapOtherCreditRatings.mockResolvedValue(false);

      await pricingAndRiskController.postUnderWritingPricingAndRisk(req, res);

      expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk', { user: session.user });
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
