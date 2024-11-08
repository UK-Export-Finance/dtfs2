import { TEAM_IDS, TFM_DEAL_CANCELLATION_STATUS } from '@ukef/dtfs2-common';
import api from '../../../api';
import { mockRes } from '../../../test-mocks';

import MOCKS from '../../../test-mocks/amendment-test-mocks';

import underwriterController from '.';

const mockGetDealSuccessBannerMessage = jest.fn();

jest.mock('../../helpers/get-success-banner-message.helper', () => ({
  getDealSuccessBannerMessage: (params) => mockGetDealSuccessBannerMessage(params),
}));

const mockSuccessBannerMessage = 'success message';

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
          teams: [TEAM_IDS.UNDERWRITER_MANAGERS],
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
      successMessage: mockSuccessBannerMessage,
    };

    const req = {
      params: {
        _id: dealId,
      },
      session: { user: MOCKS.MOCK_USER_UNDERWRITER_MANAGER, userToken: 'session' },
      flash: jest.fn(() => []),
    };

    beforeEach(() => {
      api.getDeal = () => Promise.resolve(MOCKS.MOCK_DEAL);
      api.getUser = apiGetUserSpy;
      api.getDealCancellation = () =>
        Promise.resolve({
          effectiveFrom: new Date().valueOf(),
          bankRequestDate: new Date().valueOf(),
          reason: 'a reason',
          status: TFM_DEAL_CANCELLATION_STATUS.COMPLETED,
        });
      mockGetDealSuccessBannerMessage.mockResolvedValue(mockSuccessBannerMessage);
    });

    it('should render template with data if amendment which is submittedByPim and requireUkefApproval', async () => {
      api.getAmendmentsByDealId = () => Promise.resolve({ data: [MOCKS.MOCK_AMENDMENT] });

      await underwriterController.getUnderwriterPage(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/underwriting.njk', {
        ...expectedBody,
        amendments: [MOCKS.MOCK_AMENDMENT],
        amendmentsInProgress: expect.any(Array),
        hasAmendmentInProgress: true,
      });
    });

    it('should render template with the amendment which is submittedByPim and requireUkefApproval (when 1 automatic amendment exists)', async () => {
      api.getAmendmentsByDealId = () => Promise.resolve({ data: [MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_AMENDMENT_AUTOMATIC_APPROVAL] });

      await underwriterController.getUnderwriterPage(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/underwriting.njk', {
        ...expectedBody,
        amendments: [MOCKS.MOCK_AMENDMENT],
        amendmentsInProgress: expect.any(Array),
        hasAmendmentInProgress: true,
      });
    });

    it('should render template with the amendment which is submittedByPim and requireUkefApproval (when unsubmitted amendment exists)', async () => {
      api.getAmendmentsByDealId = () =>
        Promise.resolve({
          data: [MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_AMENDMENT_AUTOMATIC_APPROVAL, MOCKS.MOCK_AMENDMENT_UNSUBMITTED],
        });

      await underwriterController.getUnderwriterPage(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/underwriting.njk', {
        ...expectedBody,
        amendments: [MOCKS.MOCK_AMENDMENT],
        amendmentsInProgress: expect.any(Array),
        hasAmendmentInProgress: true,
      });
    });

    it('should render template with 2 amendments which are submittedByPim and requireUkefApproval (when unsubmitted amendment exists)', async () => {
      api.getAmendmentsByDealId = () =>
        Promise.resolve({
          data: [MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_AMENDMENT_AUTOMATIC_APPROVAL, MOCKS.MOCK_AMENDMENT_UNSUBMITTED, MOCKS.MOCK_AMENDMENT],
        });

      await underwriterController.getUnderwriterPage(req, res);

      expect(res.render).toHaveBeenCalledWith('case/underwriting/underwriting.njk', {
        ...expectedBody,
        amendments: [MOCKS.MOCK_AMENDMENT, MOCKS.MOCK_AMENDMENT],
        amendmentsInProgress: expect.any(Array),
        hasAmendmentInProgress: true,
      });
    });

    it('should render problem with service page, when void request is send', async () => {
      const mockRequest = {
        params: {},
        session: {},
      };

      await underwriterController.getUnderwriterPage(mockRequest, res);

      expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });

    it('should render problem with service page, upon returning an empty deal object', async () => {
      const mockRequest = {
        params: {
          _id: dealId,
        },
        session: {},
      };

      await underwriterController.getUnderwriterPage(mockRequest, res);

      expect(res.render).toHaveBeenCalledWith('_partials/problem-with-service.njk');
    });
  });
});
