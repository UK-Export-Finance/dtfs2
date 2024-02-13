import { MOCK_UTILISATION_REPORT_ENTITY } from '@ukef/dtfs2-common';
import { handleUtilisationReportManuallySetIncompleteEvent } from './manually-set-incomplete.event-handler.ts';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportManuallySetIncompleteEvent', () => {
  // TODO FN-1862 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    expect(() => handleUtilisationReportManuallySetIncompleteEvent(MOCK_UTILISATION_REPORT_ENTITY)).toThrow(NotImplementedError);
  });
});
