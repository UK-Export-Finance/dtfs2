/**
 * @openapi
 * definitions:
 *   UtilisationReportReconciliationDetailsFeeRecord:
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
 *   UtilisationReportReconciliationDetailsPayment:
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *       currency:
 *         $ref: '#/definitions/Currency'
 *       amount:
 *         type: number
 *   UtilisationReportReconciliationDetailsFeeRecordPaymentGroup:
 *     type: object
 *     properties:
 *       required:
 *         - feeRecords
 *         - totalReportedPayments
 *         - paymentsReceived
 *         - totalPaymentsReceived
 *         - status
 *       feeRecords:
 *         type: array
 *         items:
 *           $ref: '#/definitions/UtilisationReportReconciliationDetailsFeeRecord'
 *       totalReportedPayments:
 *         $ref: '#/definitions/CurrencyAndAmount'
 *       paymentsReceived:
 *         type: array
 *         nullable: true
 *         items:
 *           $ref: '#/definitions/UtilisationReportReconciliationDetailsPayment'
 *       totalPaymentsReceived:
 *         $ref: '#/definitions/CurrencyAndAmount'
 *         nullable: true
 *       status:
 *         $ref: '#/definitions/FeeRecordStatus'
 *       reconciledByUser:
 *         type: object
 *         properties:
 *           firstName:
 *             type: string
 *           lastName:
 *             type: string
 *       dateReconciled:
 *         type: string
 *         format: date
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
 *         type: string
 *         format: date-time
 *       premiumPayments:
 *         type: array
 *         items:
 *           $ref: '#/definitions/UtilisationReportReconciliationDetailsFeeRecordPaymentGroup'
 *       paymentDetails:
 *         type: array
 *         items:
 *           $ref: '#/definitions/UtilisationReportReconciliationDetailsFeeRecordPaymentGroup'
 *       keyingSheet:
 *         $ref: '#/definitions/KeyingSheet'
 *   PremiumPaymentsFilters:
 *     type: object
 *     properties:
 *       facilityId:
 *         type: string
 */
