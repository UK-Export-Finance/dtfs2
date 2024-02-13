import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotImplementedError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

// TODO FN-1714 - defined payload
type FeeRecordKeyedEventPayload = {
  feeRecordId: number;
};

export type UtilisationReportFeeRecordKeyedEvent = BaseUtilisationReportEvent<'FEE_RECORD_KEYED', FeeRecordKeyedEventPayload>;

export const handleUtilisationReportFeeRecordKeyedEvent = (
  /* eslint-disable @typescript-eslint/no-unused-vars */
  report: UtilisationReportEntity,
  payload: FeeRecordKeyedEventPayload,
  /* eslint-enable @typescript-eslint/no-unused-vars */
): Promise<UtilisationReportEntity> => {
  throw new NotImplementedError('TODO FN-1714');
};
