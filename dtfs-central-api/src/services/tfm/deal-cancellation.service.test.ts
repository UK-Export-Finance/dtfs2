import { AuditDetails, TfmDealCancellation, TfmDealCancellationResponse } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { add, sub } from 'date-fns';
import { DealCancellationService } from './deal-cancellation.service';
import { aTfmUser } from '../../../test-helpers';

const submitDealCancellationMock = jest.fn(() => Promise.resolve({ cancelledDealUkefId: 'dealId' })) as jest.Mock<Promise<TfmDealCancellationResponse>>;

jest.mock('../../repositories/tfm-deals-repo/tfm-deal-cancellation.repo', () => ({
  TfmDealCancellationRepo: {
    submitDealCancellation: (dealId: string, cancellation: TfmDealCancellation, auditDetails: AuditDetails) =>
      submitDealCancellationMock(dealId, cancellation, auditDetails),
  },
}));

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
  describe('cancelDeal', () => {
    beforeEach(() => {
      jest.clearAllMocks();
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
          expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);
          expect(submitDealCancellationMock).toHaveBeenCalledWith(dealId, cancellation, auditDetails);
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
