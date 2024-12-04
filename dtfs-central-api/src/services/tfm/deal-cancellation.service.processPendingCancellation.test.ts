import {
  AuditDetails,
  DEAL_STATUS,
  DEAL_TYPE,
  FACILITY_STAGE,
  TfmActivity,
  TfmDeal,
  TfmDealCancellation,
  TfmFacility,
  TfmUser,
  UKEF,
} from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import { ObjectId } from 'mongodb';
import { DealCancellationService } from './deal-cancellation.service';
import { aTfmFacility } from '../../../test-helpers';
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
const addGefDealCancelledActivityMock = jest.fn() as jest.Mock<Promise<void>>;

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

  describe('processPendingCancellation', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      findOneUserByIdMock.mockResolvedValue(mockUser);

      jest.spyOn(PortalDealService, 'updateStatus').mockImplementation(updatePortalDealStatusMock);
      jest.spyOn(PortalFacilityRepo, 'updateManyByDealId').mockImplementation(updatePortalFacilitiesMock);
      jest.spyOn(PortalDealService, 'addGefDealCancelledActivity').mockImplementation(addGefDealCancelledActivityMock);
    });

    const aDealCancellation = (): TfmDealCancellation => ({
      reason: 'a reason',
      bankRequestDate: new Date().valueOf(),
      effectiveFrom: new Date().valueOf(),
    });

    const cancellation = aDealCancellation();

    const auditDetails = generateTfmAuditDetails(aTfmUser()._id);

    it('should call submitDealCancellation with the correct params', async () => {
      // Act
      await DealCancellationService.processPendingCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);
      expect(submitDealCancellationMock).toHaveBeenCalledWith({ dealId, cancellation, auditDetails });
    });

    it(`should call PortalDealService.updateStatus with ${DEAL_STATUS.CANCELLED} status`, async () => {
      // Act
      await DealCancellationService.processPendingCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(updatePortalDealStatusMock).toHaveBeenCalledTimes(1);
      expect(updatePortalDealStatusMock).toHaveBeenCalledWith({ dealId, dealType, auditDetails, newStatus: DEAL_STATUS.CANCELLED });
    });

    it(`should call PortalFacilityRepo.updateManyByDealId with facilityStage ${DEAL_STATUS.CANCELLED} status for each facility`, async () => {
      // Act
      await DealCancellationService.processPendingCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(updatePortalFacilitiesMock).toHaveBeenCalledTimes(1);
      expect(updatePortalFacilitiesMock).toHaveBeenCalledWith(dealId, { facilityStage: FACILITY_STAGE.RISK_EXPIRED }, auditDetails);
    });

    it('should call PortalDealService.addGefDealCancelledActivity with the correct params', async () => {
      // Act
      await DealCancellationService.processPendingCancellation(dealId, cancellation, auditDetails);

      // Assert
      const expectedAuthor = {
        firstName: UKEF.ACRONYM,
      };

      expect(addGefDealCancelledActivityMock).toHaveBeenCalledTimes(1);
      expect(addGefDealCancelledActivityMock).toHaveBeenCalledWith({
        deal: mockRepositoryResponse.cancelledDeal,
        author: expectedAuthor,
        auditDetails,
      });
    });

    it('should return the deal cancellation response object', async () => {
      // Act
      const dealCancellationResponse = await DealCancellationService.processPendingCancellation(dealId, cancellation, auditDetails);

      // Assert
      expect(dealCancellationResponse).toEqual(DealCancellationService.getTfmDealCancellationResponse(mockRepositoryResponse));
    });
  });
});
