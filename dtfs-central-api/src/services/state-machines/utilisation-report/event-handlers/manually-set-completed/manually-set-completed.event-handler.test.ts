import { MOCK_UTILISATION_REPORT_ENTITY } from '@ukef/dtfs2-common';
import { handleUtilisationReportManuallySetCompletedEvent } from './manually-set-completed.event-handler.ts';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportManuallySetCompletedEvent', () => {
  // TODO FN-1862 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    expect(() => handleUtilisationReportManuallySetCompletedEvent(MOCK_UTILISATION_REPORT_ENTITY)).toThrow(NotImplementedError);
  });
});
