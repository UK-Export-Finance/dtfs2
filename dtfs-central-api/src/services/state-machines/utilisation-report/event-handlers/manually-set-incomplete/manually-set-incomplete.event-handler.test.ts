import { UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';
import { handleUtilisationReportManuallySetIncompleteEvent } from './manually-set-incomplete.event-handler';
import { NotImplementedError } from '../../../../../errors';

describe('handleUtilisationReportManuallySetIncompleteEvent', () => {
  // TODO FN-1862 - update tests when functionality implemented
  it('throws a NotImplementedError', () => {
    // Arrange
    const report = UtilisationReportEntityMockBuilder.forStatus('RECONCILIATION_COMPLETED').build();

    // Act / Assert
    expect(() => handleUtilisationReportManuallySetIncompleteEvent(report)).toThrow(NotImplementedError);
  });
});
