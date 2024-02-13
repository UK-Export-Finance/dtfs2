import { UtilisationReportEntity } from '@ukef/dtfs2-common';
import { NotImplementedError } from '../../../../../errors';
import { BaseUtilisationReportEvent } from '../../event/base-utilisation-report.event';

export type UtilisationReportManuallySetCompletedEvent = BaseUtilisationReportEvent<'MANUALLY_SET_COMPLETED', undefined>;

export const handleUtilisationReportManuallySetCompletedEvent = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  report: UtilisationReportEntity,
): Promise<UtilisationReportEntity> => {
  throw new NotImplementedError('TODO FN-1862');
};
