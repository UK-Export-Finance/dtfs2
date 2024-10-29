import { add, sub } from 'date-fns';
import { ObjectId } from 'mongodb';
import { AnyObject, TFM_DEAL_CANCELLATION_STATUS, TfmDeal, TfmDealCancellationResponse } from '@ukef/dtfs2-common';
import { generateSystemAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { cancelDealJob } from './cancel-deal-job';

const now = new Date();

const submitDealCancellationMock = jest.fn() as jest.Mock<Promise<TfmDealCancellationResponse>>;
const findScheduledDealCancellationsMock = jest.fn() as jest.Mock<Promise<TfmDeal[]>>;

jest.mock('../../repositories/tfm-deals-repo', () => ({
  TfmDealCancellationRepo: {
    submitDealCancellation: (params: AnyObject) => submitDealCancellationMock(params),
    findScheduledDealCancellations: () => findScheduledDealCancellationsMock(),
  },
}));

const aDealWithScheduledCancellation = ({ effectiveFrom }: { effectiveFrom: number }) =>
  ({
    _id: new ObjectId(),
    tfm: {
      cancellation: {
        status: TFM_DEAL_CANCELLATION_STATUS.SCHEDULED,
        effectiveFrom,
        reason: '',
        bankRequestDate: sub(now, { days: 1 }).valueOf(),
      },
    },
  }) as TfmDeal;

describe('cancelDealJob', () => {
  const dealWithCancellationInFuture = aDealWithScheduledCancellation({ effectiveFrom: add(now, { days: 1 }).valueOf() });
  const dealWithCancellationToday = aDealWithScheduledCancellation({ effectiveFrom: now.valueOf() });
  const dealWithCancellationInPast = aDealWithScheduledCancellation({ effectiveFrom: sub(now, { days: 1 }).valueOf() });

  beforeEach(() => {
    jest.resetAllMocks();
    findScheduledDealCancellationsMock.mockResolvedValueOnce([dealWithCancellationInFuture, dealWithCancellationToday, dealWithCancellationInPast]);
  });

  it('is scheduled to run', () => {
    expect(cancelDealJob.cronExpression).toEqual(process.env.DEAL_CANCELLATION_SCHEDULE);
  });

  it('is has correct description', () => {
    expect(cancelDealJob.description).toEqual('Cancel deals in the database that have been scheduled & the effective from date has passed');
  });

  it('it calls findScheduledDealCancellations', async () => {
    // Act
    await cancelDealJob.task('manual');

    // Assert
    expect(findScheduledDealCancellationsMock).toHaveBeenCalledTimes(1);
  });

  it('it calls submitDealCancellation with the correct arguments', async () => {
    // Act
    await cancelDealJob.task('manual');

    // Assert
    expect(submitDealCancellationMock).toHaveBeenCalledTimes(2);
    expect(submitDealCancellationMock).toHaveBeenCalledWith({
      dealId: dealWithCancellationToday._id,
      cancellation: dealWithCancellationToday.tfm.cancellation,
      auditDetails: generateSystemAuditDetails(),
    });
    expect(submitDealCancellationMock).toHaveBeenCalledWith({
      dealId: dealWithCancellationInPast._id,
      cancellation: dealWithCancellationInPast.tfm.cancellation,
      auditDetails: generateSystemAuditDetails(),
    });
  });
});
