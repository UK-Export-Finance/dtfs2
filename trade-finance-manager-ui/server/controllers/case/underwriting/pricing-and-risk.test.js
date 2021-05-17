/* eslint-disable no-underscore-dangle */
import underwritingController from '.';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';
import { userIsInTeam } from '../../../helpers/user';
import CONSTANTS from '../../../constants';

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
          userCanEdit: userIsInTeam(session.user, [CONSTANTS.TEAMS.UNDERWRITERS]),
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

describe('GET underwriting - loss given default', () => {
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

      await underwritingController.getUnderWritingLossGivenDefault(req, res);
      expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/loss-given-default.njk',
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

      await underwritingController.getUnderWritingLossGivenDefault(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST underwriting - loss given default', () => {
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
        lossGivenDefault: '50',
      },
      mock: true,
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.updateLossGivenDefault = () => Promise.resolve({
        updateLossGivenDefault: {
          lossGivenDefault: '45',
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
          lossGivenDefault: '45',
        },
      };

      await underwritingController.postUnderWritingLossGivenDefault(req, res);

      // eslint-disable-next-line no-underscore-dangle
      expect(res.redirect).toHaveBeenCalledWith(`/case/${mockDeal._id}/underwriting/pricing-and-risk`);
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

        await underwritingController.postUnderWritingLossGivenDefault(req, res);

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

        // eslint-disable-next-line no-underscore-dangle
        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/loss-given-default.njk',
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

        await underwritingController.postUnderWritingLossGivenDefault(req, res);

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

        // eslint-disable-next-line no-underscore-dangle
        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/loss-given-default.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            activeSideNavigation: 'pricing and risk',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              lossGivenDefault: req.body.lossGivenDefault,
            },
            dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
            user: session.user,
            validationErrors: expectedValidationErrors,
          });
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

        await underwritingController.postUnderWritingLossGivenDefault(req, res);

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

        // eslint-disable-next-line no-underscore-dangle
        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/loss-given-default.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            activeSideNavigation: 'pricing and risk',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              lossGivenDefault: req.body.lossGivenDefault,
            },
            dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
            user: session.user,
            validationErrors: expectedValidationErrors,
          });
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

        await underwritingController.postUnderWritingLossGivenDefault(req, res);

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

        // eslint-disable-next-line no-underscore-dangle
        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/loss-given-default.njk',
          {
            activePrimaryNavigation: 'manage work',
            activeSubNavigation: 'underwriting',
            activeSideNavigation: 'pricing and risk',
            deal: mockDeal.dealSnapshot,
            tfm: {
              ...mockDeal.tfm,
              lossGivenDefault: req.body.lossGivenDefault,
            },
            dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
            user: session.user,
            validationErrors: expectedValidationErrors,
          });
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

      await underwritingController.postUnderWritingLossGivenDefault(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

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
        probabilityOfDefault: '25',
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

      await underwritingController.getUnderWritingProbabilityOfDefault(req, res);
      expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/probability-of-default.njk',
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

      await underwritingController.getUnderWritingProbabilityOfDefault(req, res);
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
        probabilityOfDefault: '25',
      },
      mock: true,
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.updateProbabilityOfDefault = () => Promise.resolve({
        updateProbabilityOfDefault: {
          probabilityOfDefault: '45',
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
          probabilityOfDefault: '45',
        },
      };

      await underwritingController.postUnderWritingProbabilityOfDefault(req, res);

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

        await underwritingController.postUnderWritingProbabilityOfDefault(req, res);

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
        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/probability-of-default.njk',
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

    describe('with non numeric probability of default', () => {
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

        await underwritingController.postUnderWritingProbabilityOfDefault(req, res);

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
        expect(res.render).toHaveBeenCalledWith('case/underwriting/pricing-and-risk/probability-of-default.njk',
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
          });
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

      await underwritingController.postUnderWritingProbabilityOfDefault(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
