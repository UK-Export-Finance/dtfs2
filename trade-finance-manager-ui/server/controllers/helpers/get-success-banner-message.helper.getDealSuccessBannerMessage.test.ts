import { Request } from 'express';
import { AnyObject, DEAL_SUBMISSION_TYPE, TfmDealCancellationWithStatus, Deal, DEAL_TYPE } from '@ukef/dtfs2-common';
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
  const flashedMessage = 'testMessage1';

  const mockFlashResponse = {
    successMessage: [flashedMessage],
  };

  const flash = ((key: 'successMessage') => mockFlashResponse[key]) as Request['flash'];

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
