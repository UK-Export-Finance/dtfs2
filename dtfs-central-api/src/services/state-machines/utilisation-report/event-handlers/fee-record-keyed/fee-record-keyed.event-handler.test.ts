import { UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportFeeRecordKeyedEvent } from './fee-record-keyed.event-handler';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportFeeRecordKeyedEvent', () => {
  // TODO FN-1714 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_IN_PROGRESS').build();

    // Act / Assert
    expect(() =>
      handleUtilisationReportFeeRecordKeyedEvent(report, {
        feeRecordId: 1,
      }),
    ).toThrow(NotImplementedError);
  });
});
