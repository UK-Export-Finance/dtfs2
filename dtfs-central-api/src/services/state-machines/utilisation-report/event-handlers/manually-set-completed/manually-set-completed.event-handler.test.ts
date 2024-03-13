import { UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportManuallySetCompletedEvent } from './manually-set-completed.event-handler';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportManuallySetCompletedEvent', () => {
  // TODO FN-1862 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('REPORT_NOT_RECEIVED').build();

    // Act / Assert
    expect(() => handleUtilisationReportManuallySetCompletedEvent(report)).toThrow(NotImplementedError);
  });
});
