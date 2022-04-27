import api from '../../../api';
import { mockRes } from '../../../test-mocks';

import underwriterController from '.';

describe('GET getUnderwriterPage', () => {
  const res = mockRes();

  const MOCK_USER_UNDERWRITER_MANAGER = {
    _id: '12345678',
    username: 'UNDERWRITER_MANAGER_1',
    firstName: 'Joe',
    lastName: 'Bloggs',
    teams: ['UNDERWRITER_MANAGERS'],
  };

  const session = {
    user: MOCK_USER_UNDERWRITER_MANAGER,
  };

  const MOCK_DEAL = {
    _id: '61f6ac5b02ffda01b1e8efef',
    dealSnapshot: {
      _id: '61f6ac5b02ffda01b1e8efef',
      submissionType: 'Manual Inclusion Application',
    },
    tfm: {
      leadUnderwriter: '12345678910',
    },
  };

  const dealId = MOCK_DEAL._id;
  describe('when deal exists', () => {
    const apiGetUserSpy = jest.fn(() => Promise.resolve(MOCK_USER_UNDERWRITER_MANAGER));

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCK_DEAL);
      api.getUser = apiGetUserSpy;
    });

    it('it should render template with data', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session,
      };

      await underwriterController.getUnderwriterPage(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/underwriting.njk', {
        deal: MOCK_DEAL.dealSnapshot,
        tfm: MOCK_DEAL.tfm,
        dealId: MOCK_DEAL.dealSnapshot._id,
        user: session.user,
        leadUnderwriter: {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'underwriting',
          currentLeadUnderWriter: {
            _id: '12345678',
            firstName: 'Joe',
            lastName: 'Bloggs',
            teams: ['UNDERWRITER_MANAGERS'],
            username: 'UNDERWRITER_MANAGER_1',
          },
          deal: MOCK_DEAL.dealSnapshot,
          dealId: MOCK_DEAL.dealSnapshot._id,
          tfm: MOCK_DEAL.tfm,
          user: session.user,
          userCanEdit: true,
        },
        pricingAndRisk: {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'underwriting',
          deal: MOCK_DEAL.dealSnapshot,
          tfm: MOCK_DEAL.tfm,
          dealId: MOCK_DEAL.dealSnapshot._id,
          user: session.user,
          userCanEditGeneral: true,
        },
        underwriterManagersDecision: {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'underwriting',
          deal: MOCK_DEAL.dealSnapshot,
          tfm: MOCK_DEAL.tfm,
          dealId: MOCK_DEAL.dealSnapshot._id,
          user: session.user,
          userCanEdit: true,
        },
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

      await underwriterController.getUnderwriterPage(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
