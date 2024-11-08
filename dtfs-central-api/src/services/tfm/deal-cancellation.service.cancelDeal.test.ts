import {
  ACTIVITY_TYPES,
  AnyObject,
  AuditDetails,
  DEAL_STATUS,
  DEAL_TYPE,
  InvalidAuditDetailsError,
  TfmActivity,
  TfmDealCancellation,
  TfmDealCancellationResponse,
  TfmUser,
} from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { add, endOfDay, getUnixTime, startOfDay, sub } from 'date-fns';
import { ObjectId } from 'mongodb';
import { DealCancellationService } from './deal-cancellation.service';
import { aTfmUser } from '../../../test-helpers';

const dealType = DEAL_TYPE.GEF;

const mockCancellationResponse = {
  cancelledDeal: { dealSnapshot: { dealType } },
  riskExpiredFacilityUkefIds: ['1', '2'],
} as TfmDealCancellationResponse;

const submitDealCancellationMock = jest.fn(() => Promise.resolve(mockCancellationResponse)) as jest.Mock<Promise<TfmDealCancellationResponse>>;
const scheduleDealCancellationMock = jest.fn(() => Promise.resolve(mockCancellationResponse)) as jest.Mock<Promise<TfmDealCancellationResponse>>;

const findOneUserByIdMock = jest.fn() as jest.Mock<Promise<TfmUser | null>>;

const updatePortalDealStatusMock = jest.fn() as jest.Mock<Promise<void>>;

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

jest.mock('../portal/update-deal-status.service', () => ({
  PortalDealService: {
    updatePortalDealStatus: (params: AnyObject) => updatePortalDealStatusMock(params),
  },
}));

const mockUser = aTfmUser();

const dealId = 'dealId';

const effectiveFromPresentAndPastTestCases = [
  {
    description: 'the end of today',
    effectiveFrom: endOfDay(new Date()).valueOf(),
  },
  {
    description: 'now',
    effectiveFrom: new Date().valueOf(),
  },
  {
    description: 'an hour ago',
    effectiveFrom: sub(new Date(), { hours: 1 }).valueOf(),
  },
  {
    description: 'a day ago',
    effectiveFrom: sub(new Date(), { days: 1 }).valueOf(),
  },
  {
    description: '3 months ago',
    effectiveFrom: sub(new Date(), { months: 3 }).valueOf(),
  },
  {
    description: '12 months ago',
    effectiveFrom: sub(new Date(), { months: 12 }).valueOf(),
  },
];

const effectiveFromFutureTestCases = [
  {
    description: 'the start of tomorrow',
    effectiveFrom: startOfDay(add(new Date(), { days: 1 })).valueOf(),
  },
  {
    description: 'tomorrow',
    effectiveFrom: add(new Date(), { days: 1 }).valueOf(),
  },
  {
    description: 'next month',
    effectiveFrom: add(new Date(), { months: 1 }).valueOf(),
  },
  {
    description: '12 months in the future',
    effectiveFrom: add(new Date(), { months: 12 }).valueOf(),
  },
];

describe('DealCancellationService', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('cancelDeal', () => {
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

    describe('when effectiveFrom is the present or in the past', () => {
      describe.each(effectiveFromPresentAndPastTestCases)('when effectiveFrom is $description', ({ effectiveFrom }) => {
        let cancellation: TfmDealCancellation;

        beforeEach(() => {
          cancellation = { ...aDealCancellation(), effectiveFrom };
        });

        it('calls submitDealCancellation with the correct params', async () => {
          // Act
          await DealCancellationService.cancelDeal(dealId, cancellation, auditDetails);

          // Assert
          const expectedActivity: TfmActivity = {
            type: ACTIVITY_TYPES.CANCELLATION,
            timestamp: getUnixTime(new Date()),
            author: {
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              _id: mockUser._id.toString(),
            },
            ...cancellation,
          };

          expect(scheduleDealCancellationMock).toHaveBeenCalledTimes(0);

          expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);
          expect(submitDealCancellationMock).toHaveBeenCalledWith({ dealId, cancellation, activity: expectedActivity, auditDetails });
        });

        it('returns the deal cancellation response object', async () => {
          // Act
          const dealCancellationResponse = await DealCancellationService.cancelDeal(dealId, cancellation, auditDetails);

          // Assert
          expect(dealCancellationResponse).toEqual(mockCancellationResponse);
        });

        it('updates the deal status to cancelled', async () => {
          // Act
          await DealCancellationService.cancelDeal(dealId, cancellation, auditDetails);

          // Assert
          expect(updatePortalDealStatusMock).toHaveBeenCalledTimes(1);
          expect(updatePortalDealStatusMock).toHaveBeenCalledWith({ dealId, dealType, auditDetails, status: DEAL_STATUS.CANCELLED });
        });

        it('throws InvalidAuditDetailsError when no user is found', async () => {
          // Arrange
          findOneUserByIdMock.mockResolvedValueOnce(null);

          // Assert
          await expect(() => DealCancellationService.cancelDeal(dealId, cancellation, auditDetails)).rejects.toThrow(
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

        it('calls scheduleDealCancellation with the correct params', async () => {
          // Act
          await DealCancellationService.cancelDeal(dealId, cancellation, auditDetails);

          // Assert
          const expectedActivity: TfmActivity = {
            type: ACTIVITY_TYPES.CANCELLATION,
            timestamp: getUnixTime(new Date()),
            author: {
              firstName: mockUser.firstName,
              lastName: mockUser.lastName,
              _id: mockUser._id.toString(),
            },
            ...cancellation,
          };

          expect(submitDealCancellationMock).toHaveBeenCalledTimes(0);

          expect(scheduleDealCancellationMock).toHaveBeenCalledTimes(1);
          expect(scheduleDealCancellationMock).toHaveBeenCalledWith({ dealId, cancellation, activity: expectedActivity, auditDetails });
        });

        it('returns the deal cancellation response object', async () => {
          // Act
          const dealCancellationResponse = await DealCancellationService.cancelDeal(dealId, cancellation, auditDetails);

          // Assert
          expect(dealCancellationResponse).toEqual(mockCancellationResponse);
        });

        it('does not update the deal status', async () => {
          // Act
          await DealCancellationService.cancelDeal(dealId, cancellation, auditDetails);

          // Assert
          expect(updatePortalDealStatusMock).toHaveBeenCalledTimes(0);
        });

        it('throws InvalidAuditDetailsError when no user is found', async () => {
          // Arrange
          findOneUserByIdMock.mockResolvedValueOnce(null);

          // Assert
          await expect(() => DealCancellationService.cancelDeal(dealId, cancellation, auditDetails)).rejects.toThrow(
            new InvalidAuditDetailsError(`Supplied auditDetails 'id' ${auditDetails.id.toString()} does not correspond to a valid user`),
          );
        });
      });
    });
  });
});
