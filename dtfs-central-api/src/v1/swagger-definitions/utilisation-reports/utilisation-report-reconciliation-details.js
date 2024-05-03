/**
 * @openapi
 * definitions:
 *   UtilisationReportReconciliationDetailsFeeRecord:
 *     type: object
 *     properties:
 *       facilityId:
 *         type: string
 *   UtilisationReportReconciliationDetails:
 *     type: object
 *     properties:
 *       reportId:
 *         type: number
 *       bank:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *           name:
 *             type: string
 *       status:
 *         $ref: '#/definitions/UtilisationReportReconciliationStatus'
 *       reportPeriod:
 *         $ref: '#/definitions/ReportPeriod'
 *       dateUploaded:
 *         type: Date
 *       feeRecords:
 *         type: array
 *         items:
 *           $ref: '#/definitions/UtilisationReportReconciliationFeeRecord'
 */
