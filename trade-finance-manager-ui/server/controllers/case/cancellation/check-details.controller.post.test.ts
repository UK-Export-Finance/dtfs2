import { createMocks } from 'node-mocks-http';
import { DEAL_SUBMISSION_TYPE } from '@ukef/dtfs2-common';
import { add, sub } from 'date-fns';
import { aRequestSession } from '../../../../test-helpers';
import api from '../../../api';
import { postDealCancellationDetails, PostDealCancellationDetailsRequest } from './check-details.controller';

jest.mock('../../../api', () => ({
  getDeal: jest.fn(),
  submitDealCancellation: jest.fn(),
}));

const flashMock = jest.fn();

const dealId = 'dealId';
const ukefDealId = 'ukefDealId';

const reason = 'reason';
const bankRequestDate = new Date().valueOf().toString();
const effectiveFrom = new Date().valueOf().toString();

describe('postDealCancellationDetails', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('redirects to not found if the deal does not exist', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue(undefined);

    const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
      body: { reason, bankRequestDate, effectiveFrom },
      flash: flashMock,
    });

    // Act
    await postDealCancellationDetails(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  it('redirects to not found if the dealId is invalid', async () => {
    // Arrange
    jest.mocked(api.getDeal).mockResolvedValue({ status: 400, data: 'Invalid deal id' });

    const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
      params: { _id: dealId },
      session: aRequestSession(),
      body: { reason, bankRequestDate, effectiveFrom },
      flash: flashMock,
    });

    // Act
    await postDealCancellationDetails(req, res);

    // Assert
    expect(res._getRedirectUrl()).toEqual(`/not-found`);
  });

  describe.each([DEAL_SUBMISSION_TYPE.AIN, DEAL_SUBMISSION_TYPE.MIN])('when the deal type is %s', (validDealType) => {
    beforeEach(() => {
      jest.mocked(api.getDeal).mockResolvedValue({ dealSnapshot: { details: { ukefDealId }, submissionType: validDealType } });
    });

    it('submits the deal cancellation', async () => {
      // Arrange
      const session = aRequestSession();

      const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
        params: { _id: dealId },
        session,
        body: { reason, bankRequestDate, effectiveFrom },
        flash: flashMock,
      });

      // Act
      await postDealCancellationDetails(req, res);

      // Assert
      expect(api.submitDealCancellation).toHaveBeenCalledTimes(1);
      expect(api.submitDealCancellation).toHaveBeenCalledWith(
        dealId,
        { reason, bankRequestDate: Number(bankRequestDate), effectiveFrom: Number(effectiveFrom) },
        session.userToken,
      );
    });

    describe('when effective from date is in the past', () => {
      it('adds a successMessage to req.flash', async () => {
        // Arrange
        const session = aRequestSession();

        const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
          params: { _id: dealId },
          session,
          body: { reason, bankRequestDate, effectiveFrom: sub(new Date(), { days: 1 }).valueOf() },
          flash: flashMock,
        });

        // Act
        await postDealCancellationDetails(req, res);

        // Assert
        expect(flashMock).toHaveBeenCalledTimes(1);
        expect(flashMock).toHaveBeenCalledWith('successMessage', `Deal ${ukefDealId} cancelled`);
      });
    });

    describe('when effective from date is in the present', () => {
      it('adds a successMessage to req.flash', async () => {
        // Arrange
        const session = aRequestSession();

        const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
          params: { _id: dealId },
          session,
          body: { reason, bankRequestDate, effectiveFrom: new Date().valueOf() },
          flash: flashMock,
        });

        // Act
        await postDealCancellationDetails(req, res);

        // Assert
        expect(flashMock).toHaveBeenCalledTimes(1);
        expect(flashMock).toHaveBeenCalledWith('successMessage', `Deal ${ukefDealId} cancelled`);
      });
    });

    describe('when effective from date is in the future', () => {
      it('does not add a successMessage to req.flash', async () => {
        // Arrange
        const session = aRequestSession();

        const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
          params: { _id: dealId },
          session,
          body: { reason, bankRequestDate, effectiveFrom: add(new Date(), { days: 1 }).valueOf() },
          flash: flashMock,
        });

        // Act
        await postDealCancellationDetails(req, res);

        // Assert
        expect(flashMock).toHaveBeenCalledTimes(0);
      });
    });

    it('redirects to the deal summary', async () => {
      // Arrange
      const { req, res } = createMocks<PostDealCancellationDetailsRequest>({
        params: { _id: dealId },
        session: aRequestSession(),
        body: { reason, bankRequestDate, effectiveFrom },
        flash: flashMock,
      });

      // Act
      await postDealCancellationDetails(req, res);

      // Assert
      expect(res._getRedirectUrl()).toEqual(`/case/${dealId}/deal`);
    });
  });
});
