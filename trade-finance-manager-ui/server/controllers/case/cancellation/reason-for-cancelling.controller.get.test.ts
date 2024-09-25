import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { aTfmSessionUser } from '../../../../test-helpers';
import { getReasonForCancelling, GetReasonForCancellingRequest } from './reason-for-cancelling.controller';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { ReasonForCancellingViewModel } from '../../../types/view-models';
import api from '../../../api';
import { canSubmissionTypeBeCancelled } from '../../helpers';

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  getDealCancellation: jest.fn(),
}));

jest.mock('../../helpers', () => ({
  canSubmissionTypeBeCancelled: jest.fn(() => true),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';
const mockUser = aTfmSessionUser();

describe('getReasonForCancelling', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.mocked(canSubmissionTypeBeCancelled).mockReturnValue(true);
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

  it('redirects to deal summary page if the submission type is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.AIN } });
    jest.mocked(canSubmissionTypeBeCancelled).mockReturnValueOnce(false);

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

  it('renders the reason for cancelling page', async () => {
    // Arrange
    const reason = 'Existing reason';
    jest.mocked(api.getDealCancellation).mockResolvedValue({ reason });
    jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.AIN } });

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
    });
  });
});
