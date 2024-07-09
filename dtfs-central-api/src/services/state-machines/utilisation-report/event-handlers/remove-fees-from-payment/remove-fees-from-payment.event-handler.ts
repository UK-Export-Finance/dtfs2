import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotImplementedError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';
import { FeeRecordStateMachine } from '../../../fee-record/fee-record.state-machine';

type RemoveFeesFromPaymentEventPayload = {
  transactionEntityManager: EntityManager;
  selectedFeeRecords: FeeRecordEntity[];
  otherFeeRecords: FeeRecordEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportRemoveFeesFromPaymentEvent = BaseUtilisationReportEvent<'REMOVE_PAYMENT_FEES', RemoveFeesFromPaymentEventPayload>;

export const handleUtilisationReportRemoveFeesFromPaymentEvent = async (
  _report: UtilisationReportEntity,
  { transactionEntityManager, selectedFeeRecords, requestSource }: RemoveFeesFromPaymentEventPayload,
): Promise<UtilisationReportEntity> => {
  const selectedFeeRecordStateMachines = selectedFeeRecords.map((feeRecord) => FeeRecordStateMachine.forFeeRecord(feeRecord));
  await Promise.all(
    selectedFeeRecordStateMachines.map((stateMachine) =>
      stateMachine.handleEvent({
        type: 'REMOVE_FROM_PAYMENT',
        payload: {
          transactionEntityManager,
          requestSource,
        },
      }),
    ),
  );

  // TODO: Call fee record state machine with a new OTHER_FEE_REMOVED_FROM_GROUP event for all other fee records.

  throw new NotImplementedError('TODO - FN-1719: Finish implementing handling.');
};
