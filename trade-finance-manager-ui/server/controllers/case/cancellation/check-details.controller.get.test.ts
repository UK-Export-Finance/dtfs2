import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { format } from 'date-fns';
import { aRequestSession } from '../../../../test-helpers';
import { PRIMARY_NAVIGATION_KEYS } from '../../../constants';
import { CheckDetailsViewModel } from '../../../types/view-models';
import api from '../../../api';
import { getDealCancellationDetails, GetDealCancellationDetailsRequest } from './check-details.controller';

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  getDealCancellation: jest.fn(),
}));

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';

describe('getDealCancellationDetails', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<GetDealCancellationDetailsRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
    });

    // Act
    await getDealCancellationDetails(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<GetDealCancellationDetailsRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
    });

    // Act
    await getDealCancellationDetails(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  describe(`when the deal type is ${DEAL_SUBMISSION_TYPE.MIA}`, () => {
    beforeEach(() => {
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: DEAL_SUBMISSION_TYPE.MIA } });
    });

    it('redirects to deal summary page', async () => {
      // Arrange
      const { req, res } = createMocks<GetDealCancellationDetailsRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getDealCancellationDetails(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });

    it('does not get the cancellation', async () => {
      // Arrange
      const { req, res } = createMocks<GetDealCancellationDetailsRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getDealCancellationDetails(req, res);

      // Assert
      expect(api.getDealCancellation).toHaveBeenCalledTimes(0);
    });
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    beforeEach(() => {
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
    });

    it('redirects to deal summary page if the deal cancellation is empty', async () => {
      // Arrange
      jest.mocked(api.getDealCancellation).mockResolvedValue({});

      const { req, res } = createMocks<GetDealCancellationDetailsRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
      });

      // Act
      await getDealCancellationDetails(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });

    it('renders the check details page with deal cancellation details', async () => {
      const reason = 'test reaspn';
      const bankRequestDate = new Date('2024-01-01');
      const effectiveFromDate = new Date('2024-03-03');

      const session = aRequestSession();

      // Arrange
      jest
        .mocked(api.getDealCancellation)
        .mockResolvedValue({ reason, effectiveFrom: effectiveFromDate.valueOf(), bankRequestDate: bankRequestDate.valueOf() });

      const { req, res } = createMocks<GetDealCancellationDetailsRequest>({
        params: { _id: dealId },
        session,
      });

      // Act
      await getDealCancellationDetails(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('case/cancellation/check-details.njk');
      expect(res._getRenderData() as CheckDetailsViewModel).toEqual({
        activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.ALL_DEALS,
        user: session.user,
        ukefDealId,
        dealId,
        reason,
        bankRequestDate: format(bankRequestDate, 'd MMMM yyyy'),
        effectiveFromDate: format(effectiveFromDate, 'd MMMM yyyy'),
        cancellation: { reason, bankRequestDate, effectiveFrom: effectiveFromDate },
      });
    });
  });
});
