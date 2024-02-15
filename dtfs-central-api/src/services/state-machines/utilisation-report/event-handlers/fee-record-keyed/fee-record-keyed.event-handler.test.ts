import { MOCK_UTILISATION_REPORT_ENTITY } from '@ukef/dtfs2-common';
import { handleUtilisationReportFeeRecordKeyedEvent } from './fee-record-keyed.event-handler';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportFeeRecordKeyedEvent', () => {
  // TODO FN-1714 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    expect(() =>
      handleUtilisationReportFeeRecordKeyedEvent(MOCK_UTILISATION_REPORT_ENTITY, {
        feeRecordId: 1,
      }),
    ).toThrow(NotImplementedError);
  });
});
