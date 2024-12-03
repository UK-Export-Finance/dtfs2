import { add, sub } from 'date-fns';
import { ObjectId } from 'mongodb';
import { AuditDetails, TFM_DEAL_CANCELLATION_STATUS, TfmDeal, TfmDealCancellation, TfmDealCancellationResponse } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { cancelDealJob } from './cancel-deal-job';

const now = new Date();

const processPendingCancellationMock = jest.fn() as jest.Mock<Promise<TfmDealCancellationResponse>>;
const findPendingDealCancellationsMock = jest.fn() as jest.Mock<Promise<TfmDeal[]>>;

jest.mock('../../repositories/tfm-deals-repo', () => ({
  TfmDealCancellationRepo: {
    findPendingDealCancellations: () => findPendingDealCancellationsMock(),
  },
}));

jest.mock('../../services/tfm/deal-cancellation.service', () => ({
  DealCancellationService: {
    processPendingCancellation: (dealId: string, cancellation: TfmDealCancellation, auditDetails: AuditDetails) =>
      processPendingCancellationMock(dealId, cancellation, auditDetails),
  },
}));

const aDealWithPendingCancellation = ({ effectiveFrom }: { effectiveFrom: number }) =>
  ({
    _id: new ObjectId(),
    tfm: {
      cancellation: {
        status: TFM_DEAL_CANCELLATION_STATUS.PENDING,
        effectiveFrom,
        reason: '',
        bankRequestDate: sub(now, { days: 1 }).valueOf(),
      },
    },
  }) as TfmDeal;

describe('cancelDealJob', () => {
  const dealWithCancellationInFuture = aDealWithPendingCancellation({ effectiveFrom: add(now, { days: 1 }).valueOf() });
  const dealWithCancellationToday = aDealWithPendingCancellation({ effectiveFrom: now.valueOf() });
  const dealWithCancellationInPast = aDealWithPendingCancellation({ effectiveFrom: sub(now, { days: 1 }).valueOf() });

  beforeEach(() => {
    jest.resetAllMocks();
    findPendingDealCancellationsMock.mockResolvedValueOnce([dealWithCancellationInFuture, dealWithCancellationToday, dealWithCancellationInPast]);
  });

  it('should be scheduled to run', () => {
    expect(cancelDealJob.cronExpression).toEqual(process.env.DEAL_CANCELLATION_SCHEDULE);
  });

  it('should have the correct description', () => {
    expect(cancelDealJob.description).toEqual('Cancel deals in the database that are pending cancellation & the effective from date has passed');
  });

  it('should call findPendingDealCancellations', async () => {
    // Act
    await cancelDealJob.task('manual');

    // Assert
    expect(findPendingDealCancellationsMock).toHaveBeenCalledTimes(1);
  });

  it('should call processPendingCancellation with the correct arguments', async () => {
    // Act
    await cancelDealJob.task('manual');

    // Assert
    expect(processPendingCancellationMock).toHaveBeenCalledTimes(2);
    expect(processPendingCancellationMock).toHaveBeenCalledWith(
      dealWithCancellationToday._id,
      dealWithCancellationToday.tfm.cancellation,
      generateSystemAuditDetails(),
    );
    expect(processPendingCancellationMock).toHaveBeenCalledWith(
      dealWithCancellationInPast._id,
      dealWithCancellationInPast.tfm.cancellation,
      generateSystemAuditDetails(),
    );
  });
});
