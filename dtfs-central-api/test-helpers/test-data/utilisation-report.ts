import { UTILISATION_REPORT_RECONCILIATION_STATUS, UtilisationReportEntity, UtilisationReportEntityMockBuilder } from '@ukef/dtfs2-common';

/**
 * Test helper which returns a utilisation report entity.
 *
 * This is to be used when the test just requires a utilisation report but does not care what the values of any fields are.
 * To build a report for a test where it does matter what the fields are then you should use the entity mock builder directly.
 *
 * @returns a utilisation report entity
 */
export const aUtilisationReport = (): UtilisationReportEntity =>
  UtilisationReportEntityMockBuilder.forStatus(UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS).build();
