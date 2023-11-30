/**
 * @openapi
 * definitions:
 *   UtilisationReport:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         example: '9'
 *         description: Bank id. Separate MongoDB _id
 *       month:
 *         type: integer
 *         example: 1
 *         description: Month of utilisation report indexed at 1
 *       year:
 *         type: integer
 *         example: 2021
 *       dateUploaded:
 *         type: string
 *         example: 2021-01-01T00:00:00.000Z
 *       path:
 *         type: string
 *         example: 'document.pdf'
 *       uploadedBy:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             example: '9'
 *           firstname:
 *             type: string
 *             example: 'John'
 *           surname:
 *             type: string
 *             example: 'Smith'
 *       bank:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             example: '9'
 *           name:
 *             type: string
 *             example: 'UKEF test bank (Delegated)'
 *   ReportStatus:
 *     type: string
 *     enum: ['REPORT_NOT_RECEIVED', 'PENDING_RECONCILIATION']
 *     description: Status of the utilisation report
 *   ReportStatusWithReportId:
 *     type: object
 *     properties:
 *       status:
 *         type: ReportStatus
 *         example: 'REPORT_NOT_RECEIVED'
 *         description: Report status to set
 *       report:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             description: Mongo id of the report
 *   ReportStatusWithBankId:
 *     type: object
 *     properties:
 *       status:
 *         type: ReportStatus
 *         example: 'REPORT_NOT_RECEIVED'
 *         description: Report status to set
 *       report:
 *         type: object
 *         properties:
 *           month:
 *             type: number
 *             example: 1
 *             description: One-indexed month
 *           year:
 *             type: number
 *             example: 2023
 *             description: Full year
 *           bankId:
 *             type: string
 *             example: '123'
 *             description: Bank id
 */
