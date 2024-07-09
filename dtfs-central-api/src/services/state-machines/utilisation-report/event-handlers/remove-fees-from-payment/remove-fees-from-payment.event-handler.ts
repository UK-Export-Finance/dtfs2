import { EntityManager } from 'typeorm';
import { DbRequestSource, FeeRecordEntity, UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotImplementedError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

type RemoveFeesFromPaymentEventPayload = {
  transactionEntityManager: EntityManager;
  selectedFeeRecords: FeeRecordEntity[];
  otherFeeRecords: FeeRecordEntity[];
  requestSource: DbRequestSource;
};

export type UtilisationReportRemoveFeesFromPaymentEvent = BaseUtilisationReportEvent<'REMOVE_PAYMENT_FEES', RemoveFeesFromPaymentEventPayload>;

export const handleUtilisationReportRemoveFeesFromPaymentEvent = (
  _report: UtilisationReportEntity,
  payload: RemoveFeesFromPaymentEventPayload,
): Promise<UtilisationReportEntity> => {
  console.error('Utilisation report remove fees from payment error, payload: %o', payload);

  // TODO: Call fee record state machine with a new REMOVE_FROM_PAYMENT event for selected fee records.
  // TODO: Call fee record state machine with a new OTHER_FEE_REMOVED_FROM_GROUP event for all other fee records.

  throw new NotImplementedError('TODO - FN-1719: Implement handling.');
};
