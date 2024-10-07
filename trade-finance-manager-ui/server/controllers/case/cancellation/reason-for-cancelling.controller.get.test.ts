import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../test-helpers';
import { getReasonForCancelling, GetReasonForCancellingRequest } from './reason-for-cancelling.controller';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { ReasonForCancellingViewModel } from '../../../types/view-models';
import api from '../../../api';

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  getDealCancellation: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';
const mockUser = aTfmSessionUser();
const defaultBackUrl = `/case/${dealId}/deal`;

describe('getReasonForCancelling', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<GetReasonForCancellingRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await getReasonForCancelling(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<GetReasonForCancellingRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await getReasonForCancelling(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/not-found`);
  });

  it('redirects to deal summary page if the submission type is invalid (MIA)', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });

    const { req, res } = createMocks<GetReasonForCancellingRequest>({
      params: { _id: dealId },
      session: {
        user: mockUser,
        userToken: 'a user token',
      },
    });

    // Act
    await getReasonForCancelling(req, res);

    // Assert
    expect(res._getRedirectUrl()).toBe(`/case/${dealId}/deal`);
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    it('renders the reason for cancelling page', async () => {
      // Arrange
      const reason = 'Existing reason';
      jest.mocked(api.getDealCancellation).mockResolvedValue({ reason });
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });

      const { req, res } = createMocks<GetReasonForCancellingRequest>({
        params: { _id: dealId },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
      });

      // Act
      await getReasonForCancelling(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/reason-for-cancelling.njk');
      expect(res._getRenderData() as ReasonForCancellingViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: mockUser,
        ukefDealId,
        dealId,
        reasonForCancelling: reason,
        backUrl: defaultBackUrl,
      });
    });

    it('renders the page with the back URL as the check details page when "change" is passed in as a query parameter', async () => {
      // Arrange
      const reason = 'Existing reason';
      jest.mocked(api.getDealCancellation).mockResolvedValue({ reason });
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });

      const { req, res } = createMocks<GetReasonForCancellingRequest>({
        params: { _id: dealId },
        query: { status: 'change' },
        session: {
          user: mockUser,
          userToken: 'a user token',
        },
      });

      // Act
      await getReasonForCancelling(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/reason-for-cancelling.njk');
      expect(res._getRenderData() as ReasonForCancellingViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: mockUser,
        ukefDealId,
        dealId,
        reasonForCancelling: reason,
        backUrl: `/case/${dealId}/cancellation/check-details`,
      });
    });
  });
});
