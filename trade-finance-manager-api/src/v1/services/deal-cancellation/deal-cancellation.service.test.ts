import { AnyObject, DATE_FORMATS, DEAL_TYPE, TfmDeal, TfmDealCancellation, TfmFacility } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { add, format } from 'date-fns';
import { CANCEL_DEAL_FUTURE_DATE, CANCEL_DEAL_PAST_DATE } from '../../../constants/email-template-ids';
import sendTfmEmail from '../send-tfm-email';
import { DealCancellationService } from './deal-cancellation.service';
import { formatFacilityIds } from './helpers/format-facility-ids';
import { MOCK_TFM_SESSION_USER } from '../../__mocks__/mock-tfm-session-user';

const mockPimEmailAddress = 'pim@example.com';
const ukefDealId = 'ukefDealId';
const ukefFacilityIds = ['aFacilityId'];

const submitDealCancellationMock = jest.fn() as jest.Mock<Promise<{ cancelledDeal: TfmDeal; riskExpiredFacilities: TfmFacility[] }>>;

jest.mock('../send-tfm-email');
jest.mock('../../api', () => ({
  findOneTeam: jest.fn(() => ({ email: mockPimEmailAddress })),
  submitDealCancellation: jest.fn((params: AnyObject) => submitDealCancellationMock(params)),
}));

const dealId = 'dealId';

const today = new Date();
const tomorrow = add(new Date(), { days: 1 });

describe('deal cancellation service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitDealCancellation', () => {
    beforeEach(() => {
      submitDealCancellationMock.mockResolvedValueOnce({
        cancelledDeal: { dealSnapshot: { dealType: DEAL_TYPE.GEF, ukefDealId } } as TfmDeal,
        riskExpiredFacilities: ukefFacilityIds.map((ukefFacilityId) => ({ facilitySnapshot: { ukefFacilityId } }) as TfmFacility),
      });
    });

    describe('when effective date is in the future', () => {
      const aDealCancellation = (): TfmDealCancellation => ({
        reason: 'a reason',
        bankRequestDate: today.valueOf(),
        effectiveFrom: tomorrow.valueOf(),
      });

      it('calls submitDealCancellation', async () => {
        // Arrange
        const cancellation = aDealCancellation();
        const auditDetails = generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id);

        // Act
        await DealCancellationService.submitDealCancellation({ dealId, cancellation, auditDetails });

        // Assert
        expect(submitDealCancellationMock).toHaveBeenCalledTimes(1);
        expect(submitDealCancellationMock).toHaveBeenCalledWith({ dealId, cancellation, auditDetails });
      });

      it('calls sendTfmEmail with the correct parameters', async () => {
        // Arrange
        const cancellation = aDealCancellation();
        const auditDetails = generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id);

        // Act
        await DealCancellationService.submitDealCancellation({ dealId, cancellation, auditDetails });

        // Assert
        expect(sendTfmEmail).toHaveBeenCalledTimes(1);
        expect(sendTfmEmail).toHaveBeenCalledWith(CANCEL_DEAL_FUTURE_DATE, mockPimEmailAddress, {
          cancelReason: cancellation.reason,
          bankRequestDate: format(today, DATE_FORMATS.D_MMMM_YYYY),
          effectiveFromDate: format(tomorrow, DATE_FORMATS.D_MMMM_YYYY),
          formattedFacilitiesList: formatFacilityIds(ukefFacilityIds),
          ukefDealId,
        });
      });
    });

    describe('when effective date is today', () => {
      const aDealCancellation = (): TfmDealCancellation => ({ reason: 'a reason', bankRequestDate: today.valueOf(), effectiveFrom: today.valueOf() });

      it('calls sendTfmEmail with the correct parameters', async () => {
        // Arrange
        const cancellation = aDealCancellation();
        const auditDetails = generateTfmAuditDetails(MOCK_TFM_SESSION_USER._id);

        // Act
        await DealCancellationService.submitDealCancellation({ dealId, cancellation, auditDetails });
        // Assert
        expect(sendTfmEmail).toHaveBeenCalledTimes(1);
        expect(sendTfmEmail).toHaveBeenCalledWith(CANCEL_DEAL_PAST_DATE, mockPimEmailAddress, {
          cancelReason: cancellation.reason,
          bankRequestDate: format(today, DATE_FORMATS.D_MMMM_YYYY),
          effectiveFromDate: format(today, DATE_FORMATS.D_MMMM_YYYY),
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
          bankRequestDate: format(today, DATE_FORMATS.D_MMMM_YYYY),
          effectiveFromDate: format(tomorrow, DATE_FORMATS.D_MMMM_YYYY),
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
          bankRequestDate: format(today, DATE_FORMATS.D_MMMM_YYYY),
          effectiveFromDate: format(today, DATE_FORMATS.D_MMMM_YYYY),
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
