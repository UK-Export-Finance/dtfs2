import underwriterManagersDecisionController from '.';
import canUserEditManagersDecision from './helpers';
import { validateSubmittedValues } from './validateSubmittedValues';
import { mapDecisionObject } from '../../../helpers';
import api from '../../../../api';
import { mockRes } from '../../../../test-mocks';

import CONSTANTS from '../../../../constants';

const res = mockRes();

const session = {
  user: {
    _id: '12345678',
    username: 'testUser',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['UNDERWRITER_MANAGERS'],
  },
};

const mockDeal = {
  _id: '61f6ac5b02ffda01b1e8efef',
  dealSnapshot: {
    _id: '61f6ac5b02ffda01b1e8efef',
    submissionType: 'Manual Inclusion Application',
  },
  tfm: {},
};

const dealId = mockDeal._id;

describe('GET underwriting - underwriting managers decision', () => {
  const userCanEdit = canUserEditManagersDecision(session.user, mockDeal.dealSnapshot.submissionType, mockDeal.tfm);

  describe('when deal exists', () => {
    it('should return object with data', async () => {
      const result = await underwriterManagersDecisionController.getUnderwriterManagersDecision(mockDeal, session.user);

      expect(result).toEqual({
        userCanEdit,
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

describe('GET underwriting - underwriting managers decision edit', () => {
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

      await underwriterManagersDecisionController.getUnderwriterManagersDecisionEdit(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/managers-decision/edit-managers-decision.njk', {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        deal: mockDeal.dealSnapshot,
        tfm: mockDeal.tfm,
        dealId: mockDeal.dealSnapshot._id,
        user: session.user,
      });
    });
  });

  describe('when user cannot edit (i.e, NOT in UNDERWRITER_MANAGERS team)', () => {
    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session: {
          user: {
            ...session.user,
            teams: ['TEAM1'],
          },
        },
      };

      await underwriterManagersDecisionController.getUnderwriterManagersDecisionEdit(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
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

      await underwriterManagersDecisionController.getUnderwriterManagersDecisionEdit(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});

describe('POST underwriting - underwriting managers decision edit', () => {
  describe('when there are NO validation errors', () => {
    const apiUpdateSpy = jest.fn(() =>
      Promise.resolve({
        test: true,
      }));

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(mockDeal);
      api.updateUnderwriterManagersDecision = apiUpdateSpy;
    });

    it('should call API and redirect to `/managers-decision` route', async () => {
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

      expect(apiUpdateSpy).toHaveBeenCalledWith(dealId, mapDecisionObject(req.body, req.session.user));

      expect(res.redirect).toHaveBeenCalledWith(`/case/${dealId}/underwriting`);
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
          decision: CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
        },
      };

      await underwriterManagersDecisionController.postUnderwriterManagersDecision(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/managers-decision/edit-managers-decision.njk', {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        deal: mockDeal.dealSnapshot,
        tfm: mockDeal.tfm,
        dealId: mockDeal.dealSnapshot._id,
        user: session.user,
        submittedValues: {
          decision: CONSTANTS.DECISIONS.UNDERWRITER_MANAGER_DECISIONS.APPROVED_WITH_CONDITIONS,
        },
        validationErrors: validateSubmittedValues(req.body),
      });
    });
  });

  describe('when user cannot edit (i.e, is NOT in UNDERWRITER_MANAGERS team)', () => {
    it('should redirect to not-found route', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session: {
          user: {
            ...session.user,
            teams: ['TEAM1'],
          },
        },
      };

      await underwriterManagersDecisionController.postUnderwriterManagersDecision(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
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
