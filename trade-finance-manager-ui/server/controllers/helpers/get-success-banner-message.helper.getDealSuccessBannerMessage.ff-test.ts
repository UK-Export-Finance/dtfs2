import { Request } from 'express';
import { AnyObject, DEAL_SUBMISSION_TYPE, TFM_DEAL_CANCELLATION_STATUS, TfmDealCancellationWithStatus, Deal, DEAL_TYPE } from '@ukef/dtfs2-common';
import { getScheduledCancellationBannerMessage, getDealSuccessBannerMessage } from './get-success-banner-message.helper';

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

  describe.each([AIN, MIN])('when the deal is %s', (submissionType) => {
    const dealSnapshot = {
      dealType: DEAL_TYPE.GEF,
      submissionType,
      _id: dealId,
      ukefDealId,
    } as unknown as Deal;

    const flashedMessage = 'testMessage1';

    const mockFlashResponse = {
      successMessage: [flashedMessage],
    };

    const flash = ((key: 'successMessage') => mockFlashResponse[key]) as Request['flash'];

    it('returns flashed message if there is no scheduled cancellation message', async () => {
      // Arrange
      getDealCancellationMock.mockResolvedValue({});

      // Act
      const response = await getDealSuccessBannerMessage({ userToken, dealSnapshot, flash });

      // Assert
      expect(response).toEqual(flashedMessage);
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
      const response = await getDealSuccessBannerMessage({ userToken, dealSnapshot, flash });

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

    const flashedMessage = 'testMessage1';

    const mockFlashResponse = {
      successMessage: [flashedMessage],
    };

    const flash = ((key: 'successMessage') => mockFlashResponse[key]) as Request['flash'];

    it('returns flashed message', async () => {
      // Act
      const response = await getDealSuccessBannerMessage({ userToken, dealSnapshot, flash });

      // Assert
      expect(response).toEqual(flashedMessage);
    });

    it('does not call getDealCancellation', async () => {
      // Act
      await getDealSuccessBannerMessage({ userToken, dealSnapshot, flash });

      // Assert
      expect(getDealCancellationMock).toHaveBeenCalledTimes(0);
    });
  });
});
