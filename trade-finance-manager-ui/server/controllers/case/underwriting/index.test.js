import api from '../../../api';
import { mockRes } from '../../../test-mocks';

import MOCKS from './test-mocks/amendment-test-mocks';

import underwriterController from '.';

describe('GET getUnderwriterPage', () => {
  const res = mockRes();

  const dealId = MOCKS.MOCK_DEAL._id;
  describe('when deal exists', () => {
    const apiGetUserSpy = jest.fn(() => Promise.resolve(MOCKS.MOCK_USER_UNDERWRITER_MANAGER));

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getUser = apiGetUserSpy;
      api.getAmendmentInProgressByDealId = () => Promise.resolve(MOCKS.MOCK_AMENDMENT_FULL);
    });

    it('it should render template with data', async () => {
      const req = {
        params: {
          _id: dealId,
        },
        session: MOCKS.session,
      };

      await underwriterController.getUnderwriterPage(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/underwriting.njk', {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        deal: MOCKS.MOCK_DEAL.dealSnapshot,
        tfm: MOCKS.MOCK_DEAL.tfm,
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        user: MOCKS.session.user,
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
          deal: MOCKS.MOCK_DEAL.dealSnapshot,
          dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
          tfm: MOCKS.MOCK_DEAL.tfm,
          user: MOCKS.session.user,
          userCanEdit: true,
        },
        pricingAndRisk: {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'underwriting',
          deal: MOCKS.MOCK_DEAL.dealSnapshot,
          tfm: MOCKS.MOCK_DEAL.tfm,
          dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
          user: MOCKS.session.user,
          userCanEditGeneral: true,
        },
        underwriterManagersDecision: {
          activePrimaryNavigation: 'manage work',
          activeSubNavigation: 'underwriting',
          deal: MOCKS.MOCK_DEAL.dealSnapshot,
          tfm: MOCKS.MOCK_DEAL.tfm,
          dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
          user: MOCKS.session.user,
          userCanEdit: true,
        },
        amendmentBanksDecision: {
          userCanEdit: false,
          amendment: MOCKS.MOCK_AMENDMENT_FULL.data,
        },
        amendmentData: MOCKS.MOCK_AMENDMENT_FULL.data,
        amendmentLeadUnderwriter: {
          userCanEdit: true,
          currentLeadUnderWriter: undefined,
          amendment: MOCKS.MOCK_AMENDMENT_FULL.data,
        },
        amendmentUnderwriterManagersDecision: {
          userCanEdit: true,
          amendment: MOCKS.MOCK_AMENDMENT_FULL.data,
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
        session: MOCKS.session,
      };

      await underwriterController.getUnderwriterPage(req, res);
      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });
  });
});
