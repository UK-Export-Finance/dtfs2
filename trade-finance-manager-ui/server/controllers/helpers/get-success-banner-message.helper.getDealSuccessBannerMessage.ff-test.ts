import { Request } from 'express';
import { createMocks } from 'node-mocks-http';
import { AnyObject, DEAL_SUBMISSION_TYPE, TFM_DEAL_CANCELLATION_STATUS, TfmDealCancellationWithStatus, Deal, DEAL_TYPE, FlashTypes } from '@ukef/dtfs2-common';
import { getScheduledCancellationBannerMessage, getDealSuccessBannerMessage } from './get-success-banner-message.helper';
import { getFlashSuccessMessage } from '../../helpers/get-flash-success-message';

const getDealCancellationMock = jest.fn() as jest.Mock<Promise<Partial<TfmDealCancellationWithStatus>>>;

jest.mock('../../api', () => ({
  getDealCancellation: (params: AnyObject) => getDealCancellationMock(params),
}));

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;

const userToken = 'userToken';
const dealId = 'dealId';
const ukefDealId = 'ukefDealId';

describe('getDealSuccessBannerMessage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const flashedMessage = 'testMessage1';

  const mockFlashResponse = {
    successMessage: [flashedMessage],
  };

  const mockFlash = ((key: FlashTypes) => mockFlashResponse[key]) as Request['flash'];

  const { req } = createMocks({
    flash: mockFlash,
  });

  describe.each([AIN, MIN])('when the deal is %s', (submissionType) => {
    const dealSnapshot = {
      dealType: DEAL_TYPE.GEF,
      submissionType,
      _id: dealId,
      ukefDealId,
    } as unknown as Deal;

    it('returns flashed message if there is no scheduled cancellation message', async () => {
      // Arrange
      getDealCancellationMock.mockResolvedValue({});

      // Act
      const response = await getDealSuccessBannerMessage({ userToken, dealSnapshot, req });

      // Assert
      expect(response).toEqual(getFlashSuccessMessage(req));
    });

    it('returns scheduled cancellation message if deal is scheduled for cancellation', async () => {
      // Arrange
      const effectiveFromDate = new Date();
      getDealCancellationMock.mockResolvedValue({
        bankRequestDate: new Date().valueOf(),
        effectiveFrom: effectiveFromDate.valueOf(),
        reason: '',
        status: TFM_DEAL_CANCELLATION_STATUS.SCHEDULED,
      });

      // Act
      const response = await getDealSuccessBannerMessage({ userToken, dealSnapshot, req });

      // Assert
      const expected = await getScheduledCancellationBannerMessage({ dealSnapshot, userToken });

      expect(response).toEqual(expected);
    });
  });

  describe(`when the deal is ${MIA}`, () => {
    const dealSnapshot = {
      dealType: DEAL_TYPE.GEF,
      submissionType: MIA,
      _id: dealId,
      ukefDealId,
    } as unknown as Deal;

    it('returns flashed message', async () => {
      // Act
      const response = await getDealSuccessBannerMessage({ userToken, dealSnapshot, req });

      // Assert
      expect(response).toEqual(getFlashSuccessMessage(req));
    });

    it('does not call getDealCancellation', async () => {
      // Act
      await getDealSuccessBannerMessage({ userToken, dealSnapshot, req });

      // Assert
      expect(getDealCancellationMock).toHaveBeenCalledTimes(0);
    });
  });
});
