import { AnyObject, DEAL_SUBMISSION_TYPE, TfmDealCancellationWithStatus, DEAL_TYPE, MappedDealSnapshot } from '@ukef/dtfs2-common';
import { getDealSuccessBannerMessage } from './get-success-banner-message.helper';

const getDealCancellationMock = jest.fn() as jest.Mock<Promise<Partial<TfmDealCancellationWithStatus>>>;

jest.mock('../../api', () => ({
  getDealCancellation: (params: AnyObject) => getDealCancellationMock(params),
}));

const { AIN, MIN, MIA } = DEAL_SUBMISSION_TYPE;

const userToken = 'userToken';
const dealId = 'dealId';
const ukefDealId = 'ukefDealId';

describe('getDealSuccessBannerMessage', () => {
  const flashedSuccessMessage = 'testMessage1';

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe.each([AIN, MIN, MIA])('when the deal is %s', (submissionType) => {
    const dealSnapshot = {
      dealType: DEAL_TYPE.GEF,
      submissionType,
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
