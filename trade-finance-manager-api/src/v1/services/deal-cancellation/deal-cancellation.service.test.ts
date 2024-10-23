import { TfmDealCancellation } from '@ukef/dtfs2-common';
import { add, format } from 'date-fns';
import { CANCEL_DEAL_FUTURE_DATE, CANCEL_DEAL_PAST_DATE } from '../../../constants/email-template-ids';
import sendTfmEmail from '../send-tfm-email';
import { DealCancellationService } from './deal-cancellation.service';
import { formatFacilityIds } from './helpers/format-facility-ids';

const mockPimEmailAddress = 'pim@example.com';
const ukefDealId = 'ukefDealId';
const ukefFacilityIds = ['aFacilityId'];

jest.mock('../send-tfm-email');
jest.mock('../../api', () => ({
  findOneTeam: jest.fn(() => ({ email: mockPimEmailAddress })),
  findOneDeal: jest.fn(() => ({ dealSnapshot: { ukefDealId } })),
  findFacilitiesByDealId: jest.fn(() =>
    ukefFacilityIds.map((ukefFacilityId) => ({
      facilitySnapshot: {
        ukefFacilityId,
      },
    })),
  ),
}));

const dealId = 'dealId';

const today = new Date();
const tomorrow = add(new Date(), { days: 1 });

describe('deal cancellation service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitDealCancellation', () => {
    describe('when effective date is in the future', () => {
      const aDealCancellation = (): TfmDealCancellation => ({
        reason: 'a reason',
        bankRequestDate: today.valueOf(),
        effectiveFrom: tomorrow.valueOf(),
      });

      it('calls sendTfmEmail with the correct parameters', async () => {
        // Arrange
        const dealCancellation = aDealCancellation();

        // Act
        await DealCancellationService.submitDealCancellation(dealId, dealCancellation);

        // Assert
        expect(sendTfmEmail).toHaveBeenCalledTimes(1);
        expect(sendTfmEmail).toHaveBeenCalledWith(CANCEL_DEAL_FUTURE_DATE, mockPimEmailAddress, {
          cancelReason: dealCancellation.reason,
          bankRequestDate: format(today, 'dd MMMM yyyy'),
          effectiveFromDate: format(tomorrow, 'dd MMMM yyyy'),
          formattedFacilitiesList: formatFacilityIds(ukefFacilityIds),
          ukefDealId,
        });
      });
    });

    describe('when effective date is today', () => {
      const aDealCancellation = (): TfmDealCancellation => ({ reason: 'a reason', bankRequestDate: today.valueOf(), effectiveFrom: today.valueOf() });

      it('calls sendTfmEmail with the correct parameters', async () => {
        // Arrange
        const dealCancellation = aDealCancellation();

        // Act
        await DealCancellationService.submitDealCancellation(dealId, dealCancellation);
        // Assert
        expect(sendTfmEmail).toHaveBeenCalledTimes(1);
        expect(sendTfmEmail).toHaveBeenCalledWith(CANCEL_DEAL_PAST_DATE, mockPimEmailAddress, {
          cancelReason: dealCancellation.reason,
          bankRequestDate: format(today, 'dd MMMM yyyy'),
          effectiveFromDate: format(today, 'dd MMMM yyyy'),
          formattedFacilitiesList: formatFacilityIds(ukefFacilityIds),
          ukefDealId,
        });
      });
    });
  });

  describe('sendDealCancellationEmail', () => {
    describe('when effective date is in the future', () => {
      const aDealCancellation = (): TfmDealCancellation => ({
        reason: 'a reason',
        bankRequestDate: today.valueOf(),
        effectiveFrom: tomorrow.valueOf(),
      });

      it('calls sendTfmEmail with the correct parameters', async () => {
        // Arrange
        const dealCancellation = aDealCancellation();

        // Act
        await DealCancellationService.sendDealCancellationEmail(ukefDealId, aDealCancellation(), ukefFacilityIds);

        // Assert
        expect(sendTfmEmail).toHaveBeenCalledTimes(1);
        expect(sendTfmEmail).toHaveBeenCalledWith(CANCEL_DEAL_FUTURE_DATE, mockPimEmailAddress, {
          cancelReason: dealCancellation.reason,
          bankRequestDate: format(today, 'dd MMMM yyyy'),
          effectiveFromDate: format(tomorrow, 'dd MMMM yyyy'),
          formattedFacilitiesList: formatFacilityIds(ukefFacilityIds),
          ukefDealId,
        });
      });
    });

    describe('when effective date is today', () => {
      const aDealCancellation = (): TfmDealCancellation => ({ reason: 'a reason', bankRequestDate: today.valueOf(), effectiveFrom: today.valueOf() });

      it('calls sendTfmEmail with the correct parameters', async () => {
        // Arrange
        const dealCancellation = aDealCancellation();

        // Act
        await DealCancellationService.sendDealCancellationEmail(ukefDealId, aDealCancellation(), ukefFacilityIds);

        // Assert
        expect(sendTfmEmail).toHaveBeenCalledTimes(1);
        expect(sendTfmEmail).toHaveBeenCalledWith(CANCEL_DEAL_PAST_DATE, mockPimEmailAddress, {
          cancelReason: dealCancellation.reason,
          bankRequestDate: format(today, 'dd MMMM yyyy'),
          effectiveFromDate: format(today, 'dd MMMM yyyy'),
          formattedFacilitiesList: formatFacilityIds(ukefFacilityIds),
          ukefDealId,
        });
      });

      it('sends the reason as `-` when it is an empty string', async () => {
        // Arrange
        const dealCancellation = { ...aDealCancellation(), reason: '' };

        // Act
        await DealCancellationService.sendDealCancellationEmail(ukefDealId, dealCancellation, ukefFacilityIds);

        // Assert
        expect(sendTfmEmail).toHaveBeenCalledTimes(1);
        expect(sendTfmEmail).toHaveBeenCalledWith(
          CANCEL_DEAL_PAST_DATE,
          mockPimEmailAddress,
          expect.objectContaining({
            cancelReason: '-',
          }),
        );
      });
    });
  });
});
