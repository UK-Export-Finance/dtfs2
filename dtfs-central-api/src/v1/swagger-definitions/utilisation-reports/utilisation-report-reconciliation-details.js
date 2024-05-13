/**
 * @openapi
 * definitions:
 *   UtilisationReportReconciliationDetailsFeeRecordItem:
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *       facilityId:
 *         type: string
 *       exporter:
 *         type: string
 *       reportedFees:
 *         $ref: '#/definitions/CurrencyAndAmount'
 *       reportedPayments:
 *         $ref: '#/definitions/CurrencyAndAmount'
 *       totalReportedPayments:
 *         $ref: '#/definitions/CurrencyAndAmount'
 *       paymentsReceived:
 *         nullable: true
 *         $ref: '#/definitions/CurrencyAndAmount'
 *       totalPaymentsReceived:
 *         nullable: true
 *         $ref: '#/definitions/CurrencyAndAmount'
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
 *           $ref: '#/definitions/UtilisationReportReconciliationFeeRecordItem'
 */
