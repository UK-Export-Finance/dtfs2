import { TfmDealCancellation } from '@ukef/dtfs2-common';
import { CANCEL_DEAL_FUTURE_DATE, CANCEL_DEAL_PAST_DATE } from '../../../constants/email-template-ids';
import sendTfmEmail from '../send-tfm-email';
import { DealCancellationService } from './deal-cancellation.service';

const mockPimEmailAddress = 'pim@example.com';
const mockFormattedFacilities = 'mock formatted facilities';
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

jest.mock('./helpers/format-facility-ids', () => ({
  formatFacilityIds: jest.fn(() => mockFormattedFacilities),
}));

const dealId = 'dealId';

describe('sendDealCancellationEmail', () => {
  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(1729089801730);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('when effective date is in the future', () => {
    const aDealCancellation = (): TfmDealCancellation => ({ reason: 'a reason', bankRequestDate: 1729089801730, effectiveFrom: 1729176201730 });
    it('calls sendTfmEmail with the correct parameters', async () => {
      // Arrange
      const dealCancellation = aDealCancellation();

      // Act
      await DealCancellationService.submitDealCancellation(dealId, dealCancellation);

      // Assert
      expect(sendTfmEmail).toHaveBeenCalledTimes(1);
      expect(sendTfmEmail).toHaveBeenCalledWith(CANCEL_DEAL_FUTURE_DATE, mockPimEmailAddress, {
        cancelReason: dealCancellation.reason,
        bankRequestDate: '16 October 2024',
        effectiveFromDate: '17 October 2024',
        formattedFacilitiesList: mockFormattedFacilities,
        ukefDealId,
      });
    });

    it('sends the reason as `-` when it is an empty string', async () => {
      // Arrange
      const dealCancellation = { ...aDealCancellation(), reason: '' };

      // Act
      await DealCancellationService.submitDealCancellation(dealId, dealCancellation);
      // Assert
      expect(sendTfmEmail).toHaveBeenCalledTimes(1);
      expect(sendTfmEmail).toHaveBeenCalledWith(
        CANCEL_DEAL_FUTURE_DATE,
        mockPimEmailAddress,
        expect.objectContaining({
          cancelReason: '-',
        }),
      );
    });
  });

  describe('when effective date is today', () => {
    const aDealCancellation = (): TfmDealCancellation => ({ reason: 'a reason', bankRequestDate: 1729089801730, effectiveFrom: 1729089801730 });

    it('calls sendTfmEmail with the correct parameters', async () => {
      // Arrange
      const dealCancellation = aDealCancellation();

      // Act
      await DealCancellationService.submitDealCancellation(dealId, dealCancellation);
      // Assert
      expect(sendTfmEmail).toHaveBeenCalledTimes(1);
      expect(sendTfmEmail).toHaveBeenCalledWith(CANCEL_DEAL_PAST_DATE, mockPimEmailAddress, {
        cancelReason: dealCancellation.reason,
        bankRequestDate: '16 October 2024',
        effectiveFromDate: '16 October 2024',
        formattedFacilitiesList: mockFormattedFacilities,
        ukefDealId,
      });
    });

    it('sends the reason as `-` when it is an empty string', async () => {
      // Arrange
      const dealCancellation = { ...aDealCancellation(), reason: '' };

      // Act
      await DealCancellationService.submitDealCancellation(dealId, dealCancellation);
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
