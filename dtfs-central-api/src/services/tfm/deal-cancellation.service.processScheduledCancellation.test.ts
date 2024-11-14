import { AuditDetails, DEAL_STATUS, DEAL_TYPE, FACILITY_STAGE, TfmActivity, TfmDeal, TfmDealCancellation, TfmFacility, TfmUser } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { DealCancellationService } from './deal-cancellation.service';
import { aTfmFacility, aTfmUser } from '../../../test-helpers';
import { PortalFacilityRepo } from '../../repositories/portal/facilities.repo';
import { PortalDealService } from '../portal/deal.service';

const dealType = DEAL_TYPE.GEF;

const riskExpiredFacilityIds = [new ObjectId(), new ObjectId()];

const mockRepositoryResponse = {
  cancelledDeal: { dealSnapshot: { dealType } } as TfmDeal,
  riskExpiredFacilities: riskExpiredFacilityIds.map((_id) => ({ ...aTfmFacility(), _id })),
};

const submitDealCancellationMock = jest.fn(() => Promise.resolve(mockRepositoryResponse)) as jest.Mock<
  Promise<{
    cancelledDeal: TfmDeal;
    riskExpiredFacilities: TfmFacility[];
  }>
>;

const findOneUserByIdMock = jest.fn() as jest.Mock<Promise<TfmUser | null>>;

const updatePortalDealStatusMock = jest.fn() as jest.Mock<Promise<void>>;
const updatePortalFacilitiesMock = jest.fn() as jest.Mock<Promise<void>>;

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

const mockUser = aTfmUser();

const dealId = 'dealId';

describe('DealCancellationService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('processScheduledCancellation', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      findOneUserByIdMock.mockResolvedValue(mockUser);

      jest.spyOn(PortalDealService, 'updateStatus').mockImplementation(updatePortalDealStatusMock);
      jest.spyOn(PortalFacilityRepo, 'updateByDealId').mockImplementation(updatePortalFacilitiesMock);
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
      await DealCancellationService.processScheduledCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);
      expect(submitDealCancellationMock).toHaveBeenCalledWith({ dealId, cancellation, auditDetails });
    });

    it('returns the deal cancellation response object', async () => {
      // Arrange
      const cancellation = aDealCancellation();

      // Act
      const dealCancellationResponse = await DealCancellationService.processScheduledCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(dealCancellationResponse).toEqual(DealCancellationService.getTfmDealCancellationResponse(mockRepositoryResponse));
    });

    it(`it calls PortalDealService.updateStatus with ${DEAL_STATUS.CANCELLED} status`, async () => {
      // Arrange
      const cancellation = aDealCancellation();

      // Act
      await DealCancellationService.processScheduledCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(updatePortalDealStatusMock).toHaveBeenCalledTimes(1);
      expect(updatePortalDealStatusMock).toHaveBeenCalledWith({ dealId, dealType, auditDetails, newStatus: DEAL_STATUS.CANCELLED });
    });

    it(`it calls PortalFacilityRepo.updateByDealId with facilityStage ${DEAL_STATUS.CANCELLED} status for each facility`, async () => {
      // Arrange
      const cancellation = aDealCancellation();

      // Act
      await DealCancellationService.processScheduledCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(updatePortalFacilitiesMock).toHaveBeenCalledTimes(1);
      expect(updatePortalFacilitiesMock).toHaveBeenCalledWith(dealId, { facilityStage: FACILITY_STAGE.RISK_EXPIRED }, auditDetails);
    });
  });
});
