/**
 * @openapi
 * definitions:
 *   UtilisationReportPendingCorrections:
 *     type: object
 *     properties:
 *       reportPeriod:
 *         type: object
 *         $ref: '#/definitions/ReportPeriod'
 *       uploadedByUserName:
 *         type: string
 *       dateUploaded:
 *         type: string
 *         format: date-time
 *       reportId:
 *         type: number
 *       nextDueReportPeriod:
 *         type: object
 *         $ref: '#/definitions/ReportPeriod'
 *       corrections:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             feeRecordId:
 *               type: number
 *             facilityId:
 *               type: string
 *             exporter:
 *               type: string
 *             additionalInfo:
 *               type: string
 */
