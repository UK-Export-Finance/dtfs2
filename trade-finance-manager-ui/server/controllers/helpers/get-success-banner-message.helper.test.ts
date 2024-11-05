import { format } from 'date-fns';
import { AnyObject, DEAL_SUBMISSION_TYPE, TFM_DEAL_CANCELLATION_STATUS, TfmDealCancellationWithStatus, DATE_FORMATS } from '@ukef/dtfs2-common';
import { getSuccessBannerMessage } from './get-success-banner-message.helper';

const getDealCancellationMock = jest.fn() as jest.Mock<Promise<Partial<TfmDealCancellationWithStatus>>>;

jest.mock('../../api', () => ({
  getDealCancellation: (params: AnyObject) => getDealCancellationMock(params),
}));

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;

const userToken = 'userToken';
const dealId = 'dealId';
const ukefDealId = 'ukefDealId';

describe('getSuccessBannerMessage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe.each([AIN, MIN])('when the deal is %s', (submissionType) => {
    it('returns null if deal cancellation is in draft', async () => {
      // Arrange
      getDealCancellationMock.mockResolvedValueOnce({
        bankRequestDate: new Date().valueOf(),
        effectiveFrom: new Date().valueOf(),
        reason: '',
        status: TFM_DEAL_CANCELLATION_STATUS.DRAFT,
      });

      // Act
      const response = await getSuccessBannerMessage({ submissionType, userToken, dealId, ukefDealId });

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
      const response = await getSuccessBannerMessage({ submissionType, userToken, dealId, ukefDealId });

      // Assert
      expect(response).toEqual(null);
    });

    it('returns null if there is no deal cancellation', async () => {
      // Arrange
      getDealCancellationMock.mockResolvedValueOnce({});

      // Act
      const response = await getSuccessBannerMessage({ submissionType, userToken, dealId, ukefDealId });

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
      const response = await getSuccessBannerMessage({ submissionType, userToken, dealId, ukefDealId });

      // Assert
      const expectedFormattedDate = format(effectiveFromDate, DATE_FORMATS.D_MMMM_YYYY);
      expect(response).toEqual(`Deal ${ukefDealId} scheduled for cancellation on ${expectedFormattedDate}`);
    });
  });

  describe(`when the deal is ${MIA}`, () => {
    const submissionType = MIA;
    it('returns null', async () => {
      // Act
      const response = await getSuccessBannerMessage({ submissionType, userToken, dealId, ukefDealId });

      // Assert
      expect(response).toEqual(null);
    });
  });
});
