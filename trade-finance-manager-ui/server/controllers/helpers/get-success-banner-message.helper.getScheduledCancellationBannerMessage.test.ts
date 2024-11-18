import { AnyObject, DEAL_SUBMISSION_TYPE, TfmDealCancellationWithStatus, Deal, DEAL_TYPE } from '@ukef/dtfs2-common';
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

  describe.each([AIN, MIN, MIA])('when the deal is %s', (submissionType) => {
    const dealSnapshot = {
      dealType: DEAL_TYPE.GEF,
      submissionType,
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
