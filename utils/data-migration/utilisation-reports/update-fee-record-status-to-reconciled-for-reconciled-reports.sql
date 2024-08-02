UPDATE FeeRecord
SET status = 'RECONCILED'
FROM FeeRecord
INNER JOIN UtilisationReport on FeeRecord.reportId = UtilisationReport.id
WHERE UtilisationReport.status = 'RECONCILIATION_COMPLETED';