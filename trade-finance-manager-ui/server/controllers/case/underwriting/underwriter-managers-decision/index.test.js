/* eslint-disable no-underscore-dangle */
import underwriterManagersDecisionController from '.';
import validateSubmittedValues from './validateSubmittedValues';
import mapSubmittedValues from './mapSubmittedValues';
import api from '../../../../api';
import { mockRes } from '../../../../test-mocks';
// import helpers from './helpers';

// const { isDecisionSubmitted } = helpers;

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

const mockDeal = {
  _id: '1000023',
  dealSnapshot: {
    _id: '1000023',
  },
  tfm: {},
};

const dealId = mockDeal._id;

describe('GET underwriting - underwriting managers decision', () => {
  describe('when deal exists', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should render template with data', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session,
      };

      await underwriterManagersDecisionController.getUnderwriterManagersDecision(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/managers-decision/managers-decision.njk', {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        activeSideNavigation: 'underwriter managers decision',
        deal: mockDeal.dealSnapshot,
        tfm: mockDeal.tfm,
        dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
        user: session.user,
        // decisionSubmitted: isDecisionSubmitted(mockDeal.tfm),
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

      await underwriterManagersDecisionController.getUnderwriterManagersDecision(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST underwriting - underwriting managers decision', () => {
  describe('when there are NO validation errors', () => {
    const apiUpdateSpy = jest.fn(() => Promise.resolve({
      test: true,
    }));

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.updateUnderwriterManagersDecision = apiUpdateSpy;
    });

    it('should call API and redirect to underwriter-managers-decision route', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session,
        body: {
          decision: 'Approve without conditions',
        },
      };

      await underwriterManagersDecisionController.postUnderwriterManagersDecision(req, res);

      expect(apiUpdateSpy).toHaveBeenCalledWith(
        dealId,
        mapSubmittedValues(req.body),
      );

      expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/underwriting/managers-decision`);
    });
  });

  describe('when there are validation errors', () => {
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
    });

    it('should render template with validationErrors and submittedValues', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session,
        body: {
          decision: 'Approve with conditions',
        },
      };

      await underwriterManagersDecisionController.postUnderwriterManagersDecision(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/managers-decision/managers-decision.njk', {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        activeSideNavigation: 'underwriter managers decision',
        deal: mockDeal.dealSnapshot,
        tfm: mockDeal.tfm,
        dealId: mockDeal.dealSnapshot._id, // eslint-disable-line no-underscore-dangle
        user: session.user,
        submittedValues: {
          decision: 'Approve with conditions',
        },
        validationErrors: validateSubmittedValues(req.body),
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

      await underwriterManagersDecisionController.postUnderwriterManagersDecision(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
