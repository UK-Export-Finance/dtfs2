import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotImplementedError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

// TODO FN-1714 - define payload
type FeeRecordKeyedEventPayload = {
  feeRecordId: number;
};

export type UtilisationReportFeeRecordKeyedEvent = BaseUtilisationReportEvent<
  'FEE_RECORD_KEYED',
  FeeRecordKeyedEventPayload
>;

export const handleUtilisationReportFeeRecordKeyedEvent = (): Promise<UtilisationReportEntity> => {
  throw new NotImplementedError('TODO FN-1714');
};
