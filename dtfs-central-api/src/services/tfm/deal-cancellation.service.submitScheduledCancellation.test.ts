import { AnyObject, AuditDetails, DEAL_STATUS, DEAL_TYPE, TfmActivity, TfmDealCancellation, TfmDealCancellationResponse, TfmUser } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { DealCancellationService } from './deal-cancellation.service';
import { aTfmUser } from '../../../test-helpers';

const dealType = DEAL_TYPE.GEF;

const mockCancellationResponse = {
  cancelledDeal: { dealSnapshot: { dealType } },
  riskExpiredFacilityUkefIds: ['1', '2'],
} as TfmDealCancellationResponse;

const submitDealCancellationMock = jest.fn(() => Promise.resolve(mockCancellationResponse)) as jest.Mock<Promise<TfmDealCancellationResponse>>;

const findOneUserByIdMock = jest.fn() as jest.Mock<Promise<TfmUser | null>>;

const updatePortalDealStatusMock = jest.fn() as jest.Mock<Promise<void>>;

jest.mock('../../repositories/tfm-deals-repo/tfm-deal-cancellation.repo', () => ({
  TfmDealCancellationRepo: {
    submitDealCancellation: (params: { dealId: string; cancellation: TfmDealCancellation; activity: TfmActivity; auditDetails: AuditDetails }) =>
      submitDealCancellationMock(params),
  },
}));

jest.mock('../../repositories/tfm-users-repo', () => ({
  TfmUsersRepo: {
    findOneUserById: (id: string | ObjectId) => findOneUserByIdMock(id),
  },
}));

jest.mock('../portal/deal.service', () => ({
  PortalDealService: {
    updateStatus: (params: AnyObject) => updatePortalDealStatusMock(params),
  },
}));

const mockUser = aTfmUser();

const dealId = 'dealId';

describe('DealCancellationService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('submitScheduledCancellation', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      findOneUserByIdMock.mockResolvedValue(mockUser);
    });

    const aDealCancellation = (): TfmDealCancellation => ({
      reason: 'a reason',
      bankRequestDate: new Date().valueOf(),
      effectiveFrom: new Date().valueOf(),
    });
    const auditDetails = generateTfmAuditDetails(aTfmUser()._id);

    it('calls submitDealCancellation with the correct params', async () => {
      // Arrange
      const cancellation = aDealCancellation();

      // Act
      await DealCancellationService.submitScheduledCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);
      expect(submitDealCancellationMock).toHaveBeenCalledWith({ dealId, cancellation, auditDetails });
    });

    it('returns the deal cancellation response object', async () => {
      // Arrange
      const cancellation = aDealCancellation();

      // Act
      const dealCancellationResponse = await DealCancellationService.submitScheduledCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(dealCancellationResponse).toEqual(mockCancellationResponse);
    });

    it('updates the deal status to cancelled', async () => {
      // Arrange
      const cancellation = aDealCancellation();

      // Act
      await DealCancellationService.submitScheduledCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(updatePortalDealStatusMock).toHaveBeenCalledTimes(1);
      expect(updatePortalDealStatusMock).toHaveBeenCalledWith({ dealId, dealType, auditDetails, status: DEAL_STATUS.CANCELLED });
    });
  });
});
