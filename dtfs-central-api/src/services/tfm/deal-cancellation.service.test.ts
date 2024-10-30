import {
  ACTIVITY_TYPES,
  AuditDetails,
  InvalidAuditDetailsError,
  TfmActivity,
  TfmDealCancellation,
  TfmDealCancellationResponse,
  TfmUser,
} from '@ukef/dtfs2-common';
import { aTfmUser } from '@ukef/dtfs2-common/mock-data-backend';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { add, getUnixTime, sub } from 'date-fns';
import { ObjectId } from 'mongodb';
import { DealCancellationService } from './deal-cancellation.service';

const submitDealCancellationMock = jest.fn(() => Promise.resolve({ cancelledDealUkefId: 'dealId' })) as jest.Mock<Promise<TfmDealCancellationResponse>>;

const findOneUserByIdMock = jest.fn() as jest.Mock<Promise<TfmUser | null>>;

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

const effectiveFromPresentAndPastTestCases = [
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

    describe('when effectiveFrom is the present or in the past', () => {
      const aDealCancellation = (): TfmDealCancellation => ({
        reason: 'a reason',
        bankRequestDate: new Date().valueOf(),
        effectiveFrom: new Date().valueOf(),
      });
      const auditDetails = generateTfmAuditDetails(aTfmUser()._id);

      it.each(effectiveFromPresentAndPastTestCases)(
        'calls submitDealCancellation with the correct params when effectiveFrom is $description',
        async ({ effectiveFrom }) => {
          // Arrange
          const cancellation = { ...aDealCancellation(), effectiveFrom };

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
          expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);
          expect(submitDealCancellationMock).toHaveBeenCalledWith({ dealId, cancellation, activity: expectedActivity, auditDetails });
        },
      );

      it('returns the deal cancellation response object', async () => {
        // Arrange
        const cancellation = aDealCancellation();

        // Act
        const dealCancellationResponse = await DealCancellationService.cancelDeal(dealId, cancellation, auditDetails);

        // Assert
        expect(dealCancellationResponse).toEqual({ cancelledDealUkefId: dealId });
      });

      it('throws InvalidAuditDetailsError when no user is found', async () => {
        // Arrange
        findOneUserByIdMock.mockResolvedValueOnce(null);

        const cancellation = aDealCancellation();

        // Assert
        await expect(() => DealCancellationService.cancelDeal(dealId, cancellation, auditDetails)).rejects.toThrow(
          new InvalidAuditDetailsError(`Supplied auditDetails 'id' ${auditDetails.id.toString()} does not correspond to a valid user`),
        );
      });
    });

    describe('when effectiveFrom is in the future', () => {
      const aDealCancellation = (): TfmDealCancellation => ({
        reason: 'a reason',
        bankRequestDate: new Date().valueOf(),
        effectiveFrom: add(new Date(), { days: 1 }).valueOf(),
      });
      const auditDetails = generateTfmAuditDetails(aTfmUser()._id);

      it('should not call submitDealCancellation', async () => {
        // Arrange
        const cancellation = aDealCancellation();

        // Act
        await DealCancellationService.cancelDeal(dealId, cancellation, auditDetails);

        // Assert
        expect(submitDealCancellationMock).toHaveBeenCalledTimes(0);
      });

      it('returns undefined', async () => {
        // TODO DTFS2-7429: Handle future effective from dates

        // Arrange
        const cancellation = aDealCancellation();

        // Act
        const dealCancellationResponse = await DealCancellationService.cancelDeal(dealId, cancellation, auditDetails);

        // Assert
        expect(dealCancellationResponse).toEqual(undefined);
      });
    });
  });
});
