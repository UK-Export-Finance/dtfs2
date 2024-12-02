import {
  AnyObject,
  DEAL_SUBMISSION_TYPE,
  TFM_DEAL_CANCELLATION_STATUS,
  TfmDealCancellationWithStatus,
  DEAL_TYPE,
  MappedDealSnapshot,
} from '@ukef/dtfs2-common';
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

  const flashedSuccessMessage = 'testMessage1';

  describe.each([AIN, MIN])('when the deal is %s', (submissionType) => {
    const dealSnapshot = { dealType: DEAL_TYPE.GEF, submissionType, _id: dealId, details: { ukefDealId } } as unknown as MappedDealSnapshot;

    it('returns flashed message if there is no scheduled cancellation message', async () => {
      // Arrange
      getDealCancellationMock.mockResolvedValue({});

      // Act
      const response = await getDealSuccessBannerMessage({ userToken, dealSnapshot, flashedSuccessMessage });

      // Assert
      expect(response).toEqual(flashedSuccessMessage);
    });

    it('returns scheduled cancellation message if deal is pending cancellation', async () => {
      // Arrange
      const effectiveFromDate = new Date();
      getDealCancellationMock.mockResolvedValue({
        bankRequestDate: new Date().valueOf(),
        effectiveFrom: effectiveFromDate.valueOf(),
        reason: '',
        status: TFM_DEAL_CANCELLATION_STATUS.PENDING,
      });

      // Act
      const response = await getDealSuccessBannerMessage({ userToken, dealSnapshot, flashedSuccessMessage });

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
      details: { ukefDealId },
    } as unknown as MappedDealSnapshot;

    it('returns flashed message', async () => {
      // Act
      const response = await getDealSuccessBannerMessage({ userToken, dealSnapshot, flashedSuccessMessage });

      // Assert
      expect(response).toEqual(flashedSuccessMessage);
    });

    it('does not call getDealCancellation', async () => {
      // Act
      await getDealSuccessBannerMessage({ userToken, dealSnapshot, flashedSuccessMessage });

      // Assert
      expect(getDealCancellationMock).toHaveBeenCalledTimes(0);
    });
  });
});
