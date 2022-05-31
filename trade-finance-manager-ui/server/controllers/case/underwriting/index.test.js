import api from '../../../api';
import { mockRes } from '../../../test-mocks';

import MOCKS from '../../../test-mocks/amendment-test-mocks';

import underwriterController from '.';

describe('GET getUnderwriterPage', () => {
  const res = mockRes();

  const dealId = MOCKS.MOCK_DEAL._id;
  describe('when deal exists', () => {
    const apiGetUserSpy = jest.fn(() => Promise.resolve(MOCKS.MOCK_USER_UNDERWRITER_MANAGER));
    const expectedBody = {
      activePrimaryNavigation: 'manage work',
      activeSubNavigation: 'underwriting',
      deal: MOCKS.MOCK_DEAL.dealSnapshot,
      tfm: MOCKS.MOCK_DEAL.tfm,
      dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
      user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
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
        user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
        userCanEdit: true,
      },
      pricingAndRisk: {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        deal: MOCKS.MOCK_DEAL.dealSnapshot,
        tfm: MOCKS.MOCK_DEAL.tfm,
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
        userCanEditGeneral: true,
      },
      underwriterManagersDecision: {
        activePrimaryNavigation: 'manage work',
        activeSubNavigation: 'underwriting',
        deal: MOCKS.MOCK_DEAL.dealSnapshot,
        tfm: MOCKS.MOCK_DEAL.tfm,
        dealId: MOCKS.MOCK_DEAL.dealSnapshot._id,
        user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER,
        userCanEdit: true,
      },
    };
    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getUser = apiGetUserSpy;
    });

    it('should render template with data', async () => {
      api.getAmendmentInProgressByDealId = () => Promise.resolve({ data: MOCKS.MOCK_AMENDMENT });
      const req = {
        params: {
          _id: dealId,
        },
        session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER },
      };

      await underwriterController.getUnderwriterPage(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/underwriting.njk', {
        ...expectedBody,
        amendment: {
          ...MOCKS.MOCK_AMENDMENT,
          leadUnderWriter: undefined,
          underwriterManagerDecision: undefined,
          banksDecision: undefined,
        },
      });
    });
  });
});
