import {
  AnyObject,
  AuditDetails,
  DEAL_STATUS,
  DEAL_TYPE,
  FACILITY_STATUS,
  TfmActivity,
  TfmDeal,
  TfmDealCancellation,
  TfmFacility,
  TfmUser,
} from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { ObjectId } from 'mongodb';
import { DealCancellationService } from './deal-cancellation.service';
import { aTfmFacility, aTfmUser } from '../../../test-helpers';

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
const updatePortalFacilityStatusMock = jest.fn() as jest.Mock<Promise<void>>;

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

jest.mock('../portal/facility.service', () => ({
  PortalFacilityService: {
    updateStatus: (params: AnyObject) => updatePortalFacilityStatusMock(params),
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

    it(`it calls PortalFacilityService.updateStatus with ${DEAL_STATUS.CANCELLED} status for each facility`, async () => {
      // Arrange
      const cancellation = aDealCancellation();

      // Act
      await DealCancellationService.processScheduledCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(updatePortalFacilityStatusMock).toHaveBeenCalledTimes(2);
      expect(updatePortalFacilityStatusMock).toHaveBeenCalledWith({
        facilityId: riskExpiredFacilityIds[0],
        dealType,
        auditDetails,
        status: FACILITY_STATUS.RISK_EXPIRED,
      });

      expect(updatePortalFacilityStatusMock).toHaveBeenCalledWith({
        facilityId: riskExpiredFacilityIds[1],
        dealType,
        auditDetails,
        status: FACILITY_STATUS.RISK_EXPIRED,
      });
    });
  });
});
