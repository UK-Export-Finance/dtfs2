import { MOCK_UTILISATION_REPORT_ENTITY } from '@ukef/dtfs2-common';
import { handleUtilisationReportReportUploadedEvent } from './report-uploaded.event-handler.ts';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportReportUploadedEvent', () => {
  // TODO FN-1697 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    expect(() =>
      handleUtilisationReportReportUploadedEvent(MOCK_UTILISATION_REPORT_ENTITY, {
        csvData: [],
      }),
    ).toThrow(NotImplementedError);
  });
});
