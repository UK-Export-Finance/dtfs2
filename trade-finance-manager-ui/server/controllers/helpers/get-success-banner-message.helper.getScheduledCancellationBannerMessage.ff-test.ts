import { format } from 'date-fns';
import {
  AnyObject,
  DEAL_SUBMISSION_TYPE,
  TFM_DEAL_CANCELLATION_STATUS,
  TfmDealCancellationWithStatus,
  DATE_FORMATS,
  Deal,
  DEAL_TYPE,
} from '@ukef/dtfs2-common';
import { getScheduledCancellationBannerMessage } from './get-success-banner-message.helper';

const getDealCancellationMock = jest.fn() as jest.Mock<Promise<Partial<TfmDealCancellationWithStatus>>>;

jest.mock('../../api', () => ({
  getDealCancellation: (params: AnyObject) => getDealCancellationMock(params),
}));

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;

const userToken = 'userToken';
const dealId = 'dealId';
const ukefDealId = 'ukefDealId';

describe('getScheduledCancellationBannerMessage', () => {
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

    it('returns null if deal cancellation is in draft', async () => {
      // Arrange
      getDealCancellationMock.mockResolvedValueOnce({
        bankRequestDate: new Date().valueOf(),
        effectiveFrom: new Date().valueOf(),
        reason: '',
        status: TFM_DEAL_CANCELLATION_STATUS.DRAFT,
      });

      // Act
      const response = await getScheduledCancellationBannerMessage({ userToken, dealSnapshot });

      // Assert
      expect(response).toEqual(null);
    });

    it('returns null if deal cancellation is completed', async () => {
      // Arrange
      getDealCancellationMock.mockResolvedValueOnce({
        bankRequestDate: new Date().valueOf(),
        effectiveFrom: new Date().valueOf(),
        reason: '',
        status: TFM_DEAL_CANCELLATION_STATUS.COMPLETED,
      });

      // Act
      const response = await getScheduledCancellationBannerMessage({ userToken, dealSnapshot });

      // Assert
      expect(response).toEqual(null);
    });

    it('returns null if there is no deal cancellation', async () => {
      // Arrange
      getDealCancellationMock.mockResolvedValueOnce({});

      // Act
      const response = await getScheduledCancellationBannerMessage({ userToken, dealSnapshot });

      // Assert
      expect(response).toEqual(null);
    });

    it('returns correct message if deal is scheduled for cancellation', async () => {
      // Arrange
      const effectiveFromDate = new Date();
      getDealCancellationMock.mockResolvedValueOnce({
        bankRequestDate: new Date().valueOf(),
        effectiveFrom: effectiveFromDate.valueOf(),
        reason: '',
        status: TFM_DEAL_CANCELLATION_STATUS.SCHEDULED,
      });

      // Act
      const response = await getScheduledCancellationBannerMessage({ userToken, dealSnapshot });

      // Assert
      const expectedFormattedDate = format(effectiveFromDate, DATE_FORMATS.D_MMMM_YYYY);
      const expected = `Deal ${ukefDealId} scheduled for cancellation on ${expectedFormattedDate}`;

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

    it('returns null', async () => {
      // Act
      const response = await getScheduledCancellationBannerMessage({ userToken, dealSnapshot });

      // Assert
      expect(response).toEqual(null);
    });

    it('does not call getDealCancellation', async () => {
      // Act
      await getScheduledCancellationBannerMessage({ userToken, dealSnapshot });

      // Assert
      expect(getDealCancellationMock).toHaveBeenCalledTimes(0);
    });
  });
});
