/**
 * @openapi
 * definitions:
 *   UtilisationReportReconciliationSummaryItem:
 *     type: object
 *     required:
 *       - bank
 *       - status
 *     properties:
 *       reportId:
 *         type: string
 *         description: |
 *           The MongoDB '_id' of the associated report (if received)
 *           from the 'utilisationReports' collection
 *       bank:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *           name:
 *             type: string
 *       status:
 *         $ref: '#/definitions/UtilisationReportReconciliationStatus'
 *       dateUploaded:
 *         type: string
 *         example: 2021-01-01T00:00:00.000Z
 *       totalFacilitiesReported:
 *         type: number
 *       totalFeesReported:
 *         type: number
 *       reportedFeesLeftToReconcile:
 *         type: number
 *   UtilisationReportReportPeriodReconciliationSummary:
 *     type: object
 *     required:
 *       - submissionMonth
 *       - items
 *     properties:
 *       submissionMonth:
 *         type: string
 *         description: ISO 8601 format month (i.e. 'yyyy-MM')
 *         example: 2021-01
 *       items:
 *         type: array
 *         items:
 *           $ref: '#/definitions/UtilisationReportReconciliationSummaryItem'
 */
