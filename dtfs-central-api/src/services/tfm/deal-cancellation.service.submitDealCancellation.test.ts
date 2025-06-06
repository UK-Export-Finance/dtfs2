import {
  ACTIVITY_TYPES,
  AuditDetails,
  DEAL_STATUS,
  DEAL_TYPE,
  FACILITY_STAGE,
  InvalidAuditDetailsError,
  now,
  PortalActivity,
  TfmActivity,
  TfmDeal,
  TfmDealCancellation,
  TfmFacility,
  TfmUser,
} from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import { add, endOfDay, getUnixTime, startOfDay, sub, toDate } from 'date-fns';
import { ObjectId } from 'mongodb';
import { DealCancellationService } from './deal-cancellation.service';
import { aTfmFacility } from '../../../test-helpers';
import { PortalFacilityRepo } from '../../repositories/portal/facilities.repo';
import { PortalDealService } from '../portal/deal.service';

const dealType = DEAL_TYPE.GEF;

const portalActivities: PortalActivity[] = [];

const riskExpiredFacilityIds = [new ObjectId(), new ObjectId()];

const mockRepositoryResponse = {
  cancelledDeal: { dealSnapshot: { dealType, portalActivities } } as TfmDeal,
  riskExpiredFacilities: riskExpiredFacilityIds.map((_id) => ({ ...aTfmFacility(), _id })),
};

const submitDealCancellationMock = jest.fn(() => Promise.resolve(mockRepositoryResponse)) as jest.Mock<
  Promise<{
    cancelledDeal: TfmDeal;
    riskExpiredFacilities: TfmFacility[];
  }>
>;
const scheduleDealCancellationMock = jest.fn(() => Promise.resolve(mockRepositoryResponse)) as jest.Mock<
  Promise<{
    cancelledDeal: TfmDeal;
    riskExpiredFacilities: TfmFacility[];
  }>
>;

const findOneUserByIdMock = jest.fn() as jest.Mock<Promise<TfmUser | null>>;

const updatePortalDealStatusMock = jest.fn() as jest.Mock<Promise<void>>;
const updatePortalFacilitiesMock = jest.fn() as jest.Mock<Promise<void>>;
const addGefDealCancelledActivityMock = jest.fn() as jest.Mock<Promise<void>>;
const addGefDealCancellationPendingActivityMock = jest.fn() as jest.Mock<Promise<void>>;

jest.mock('../../repositories/tfm-deals-repo/tfm-deal-cancellation.repo', () => ({
  TfmDealCancellationRepo: {
    submitDealCancellation: (params: { dealId: string; cancellation: TfmDealCancellation; activity: TfmActivity; auditDetails: AuditDetails }) =>
      submitDealCancellationMock(params),
    scheduleDealCancellation: (params: { dealId: string; cancellation: TfmDealCancellation; activity: TfmActivity; auditDetails: AuditDetails }) =>
      scheduleDealCancellationMock(params),
  },
}));

jest.mock('../../repositories/tfm-users-repo', () => ({
  TfmUsersRepo: {
    findOneUserById: (id: string | ObjectId) => findOneUserByIdMock(id),
  },
}));

const mockUser = aTfmUser();
const dealId = new ObjectId();

const effectiveFromPresentAndPastTestCases = [
  {
    description: 'the end of today',
    effectiveFrom: endOfDay(now()).valueOf(),
  },
  {
    description: 'now',
    effectiveFrom: now().valueOf(),
  },
  {
    description: 'an hour ago',
    effectiveFrom: sub(now(), { hours: 1 }).valueOf(),
  },
  {
    description: 'a day ago',
    effectiveFrom: sub(now(), { days: 1 }).valueOf(),
  },
  {
    description: '3 months ago',
    effectiveFrom: sub(now(), { months: 3 }).valueOf(),
  },
  {
    description: '12 months ago',
    effectiveFrom: sub(now(), { months: 12 }).valueOf(),
  },
];

const effectiveFromFutureTestCases = [
  {
    description: 'the start of tomorrow',
    effectiveFrom: startOfDay(add(now(), { days: 1 })).valueOf(),
  },
  {
    description: 'tomorrow',
    effectiveFrom: add(now(), { days: 1 }).valueOf(),
  },
  {
    description: 'next month',
    effectiveFrom: add(now(), { months: 1 }).valueOf(),
  },
  {
    description: '12 months in the future',
    effectiveFrom: add(now(), { months: 12 }).valueOf(),
  },
];

describe('DealCancellationService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('submitDealCancellation', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      findOneUserByIdMock.mockResolvedValue(mockUser);
      jest.spyOn(PortalDealService, 'updateStatus').mockImplementation(updatePortalDealStatusMock);
      jest.spyOn(PortalFacilityRepo, 'updateManyByDealId').mockImplementation(updatePortalFacilitiesMock);
      jest.spyOn(PortalDealService, 'addGefDealCancelledActivity').mockImplementation(addGefDealCancelledActivityMock);
      jest.spyOn(PortalDealService, 'addGefDealCancellationPendingActivity').mockImplementation(addGefDealCancellationPendingActivityMock);
    });

    const aDealCancellation = (): TfmDealCancellation => ({
      reason: 'a reason',
      bankRequestDate: now().valueOf(),
      effectiveFrom: now().valueOf(),
    });

    const auditDetails = generateTfmAuditDetails(aTfmUser()._id);

    describe('when effectiveFrom is the present or in the past', () => {
      describe.each(effectiveFromPresentAndPastTestCases)('when effectiveFrom is $description', ({ effectiveFrom }) => {
        let cancellation: TfmDealCancellation;

        beforeEach(() => {
          cancellation = { ...aDealCancellation(), effectiveFrom };
        });

        it('should call submitDealCancellation with the correct params', async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);

          const expectedActivity: TfmActivity = {
            type: ACTIVITY_TYPES.CANCELLATION,
            timestamp: getUnixTime(now()),
            author: {
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              _id: mockUser._id.toString(),
            },
            ...cancellation,
          };

          expect(submitDealCancellationMock).toHaveBeenCalledWith({ dealId, cancellation, activity: expectedActivity, auditDetails });
        });

        it('should not call scheduleDealCancellation', async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          expect(scheduleDealCancellationMock).toHaveBeenCalledTimes(0);
        });

        it('should return the deal cancellation response object', async () => {
          // Act
          const dealCancellationResponse = await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          const expected = DealCancellationService.getTfmDealCancellationResponse(mockRepositoryResponse);

          expect(dealCancellationResponse).toEqual(expected);
        });

        it(`should call PortalDealService.updateStatus with ${DEAL_STATUS.CANCELLED} status`, async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          expect(updatePortalDealStatusMock).toHaveBeenCalledTimes(1);
          expect(updatePortalDealStatusMock).toHaveBeenCalledWith({ dealId, dealType, auditDetails, newStatus: DEAL_STATUS.CANCELLED });
        });

        it(`should call PortalFacilityRepo.updateManyByDealId with facilityStage ${DEAL_STATUS.CANCELLED} status for each facility`, async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          expect(updatePortalFacilitiesMock).toHaveBeenCalledTimes(1);
          expect(updatePortalFacilitiesMock).toHaveBeenCalledWith(dealId, { facilityStage: FACILITY_STAGE.RISK_EXPIRED }, auditDetails);
        });

        it('should not call PortalDealService.addGefDealCancellationPendingActivity', async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          expect(addGefDealCancellationPendingActivityMock).toHaveBeenCalledTimes(0);
        });

        it('should call PortalDealService.addGefDealCancelledActivity with relevant params', async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          const expectedAuthor = {
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            _id: mockUser._id.toString(),
          };

          expect(addGefDealCancelledActivityMock).toHaveBeenCalledTimes(1);
          expect(addGefDealCancelledActivityMock).toHaveBeenCalledWith({
            dealId,
            dealType,
            author: expectedAuthor,
            auditDetails,
            effectiveFrom: toDate(effectiveFrom),
          });
        });

        it('should throw InvalidAuditDetailsError when no user is found', async () => {
          // Arrange
          findOneUserByIdMock.mockResolvedValueOnce(null);

          // Assert
          await expect(() => DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails)).rejects.toThrow(
            new InvalidAuditDetailsError(`Supplied auditDetails 'id' ${auditDetails.id.toString()} does not correspond to a valid user`),
          );
        });
      });
    });

    describe('when effectiveFrom is in the future', () => {
      describe.each(effectiveFromFutureTestCases)('when effectiveFrom is $description', ({ effectiveFrom }) => {
        let cancellation: TfmDealCancellation;
        beforeEach(() => {
          cancellation = { ...aDealCancellation(), effectiveFrom };
        });

        it('should call scheduleDealCancellation with the correct params', async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          const expectedActivity: TfmActivity = {
            type: ACTIVITY_TYPES.CANCELLATION,
            timestamp: getUnixTime(now()),
            author: {
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              _id: mockUser._id.toString(),
            },
            ...cancellation,
          };

          expect(scheduleDealCancellationMock).toHaveBeenCalledTimes(1);
          expect(scheduleDealCancellationMock).toHaveBeenCalledWith({ dealId, cancellation, activity: expectedActivity, auditDetails });
        });

        it('should not call submitDealCancellation', async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          expect(submitDealCancellationMock).toHaveBeenCalledTimes(0);
        });

        it('should return the deal cancellation response object', async () => {
          // Act
          const dealCancellationResponse = await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          expect(dealCancellationResponse).toEqual(DealCancellationService.getTfmDealCancellationResponse(mockRepositoryResponse));
        });

        it(`should call PortalDealService.updateStatus with ${DEAL_STATUS.PENDING_CANCELLATION} status`, async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          expect(updatePortalDealStatusMock).toHaveBeenCalledTimes(1);
          expect(updatePortalDealStatusMock).toHaveBeenCalledWith({ dealId, dealType, auditDetails, newStatus: DEAL_STATUS.PENDING_CANCELLATION });
        });

        it('should not call PortalFacilityService.updateStatus', async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          expect(updatePortalFacilitiesMock).toHaveBeenCalledTimes(0);
        });

        it('should not call PortalDealService.addGefDealCancelledActivity', async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          expect(addGefDealCancelledActivityMock).toHaveBeenCalledTimes(0);
        });

        it('should call PortalDealService.addGefDealCancellationPendingActivity with the correct params', async () => {
          // Act
          await DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails);

          // Assert
          const expectedAuthor = {
            firstName: mockUser.firstName,
            lastName: mockUser.lastName,
            _id: mockUser._id.toString(),
          };

          expect(addGefDealCancellationPendingActivityMock).toHaveBeenCalledTimes(1);
          expect(addGefDealCancellationPendingActivityMock).toHaveBeenCalledWith({
            dealId,
            dealType,
            author: expectedAuthor,
            auditDetails,
            effectiveFrom: toDate(effectiveFrom),
          });
        });

        it('should throw InvalidAuditDetailsError when no user is found', async () => {
          // Arrange
          findOneUserByIdMock.mockResolvedValueOnce(null);

          // Assert
          await expect(() => DealCancellationService.submitDealCancellation(dealId, cancellation, auditDetails)).rejects.toThrow(
            new InvalidAuditDetailsError(`Supplied auditDetails 'id' ${auditDetails.id.toString()} does not correspond to a valid user`),
          );
        });
      });
    });
  });
});
