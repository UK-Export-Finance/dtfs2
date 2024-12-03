/**
 * @openapi
 * definitions:
 *   SelectedFeeRecordDetails:
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *       facilityId:
 *         type: string
 *       exporter:
 *         type: string
 *       reportedFee:
 *         $ref: '#/definitions/CurrencyAndAmount'
 *       reportedPayments:
 *         $ref: '#/definitions/CurrencyAndAmount'
 *   SelectedFeeRecordsAvailablePaymentDetails:
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *       currency:
 *         $ref: '#/definitions/Currency'
 *       amount:
 *         type: number
 *       reference:
 *         type: string
 *         nullable: true
 *   SelectedFeeRecordsAvailablePaymentsGroup:
 *     type: array
 *     items:
 *       $ref: '#/definitions/SelectedFeeRecordsAvailablePaymentDetails'
 *   SelectedFeeRecordsDetailsWithAvailablePaymentGroupsResponseBody:
 *     type: object
 *     properties:
 *       totalReportedPayments:
 *         $ref: '#/definitions/CurrencyAndAmount'
 *       bank:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *       reportPeriod:
 *         $ref: '#/definitions/ReportPeriod'
 *       feeRecords:
 *         type: array
 *         items:
 *           $ref: '#/definitions/SelectedFeeRecordDetails'
 *       payments:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             dateReceived:
 *               type: string
 *             currency:
 *                 $ref: '#/definitions/Currency'
 *             amount:
 *                 type: number
 *             reference:
 *               type: string
 *               nullable: true
 *       canAddToExistingPayment:
 *         type: boolean
 *       availablePaymentGroups:
 *         type: array
 *         items:
 *           $ref: '#/definitions/SelectedFeeRecordsAvailablePaymentsGroup'
 *   SelectedFeeRecordsDetailsWithoutAvailablePaymentGroupsResponseBody:
 *     type: object
 *     properties:
 *       totalReportedPayments:
 *         $ref: '#/definitions/CurrencyAndAmount'
 *       bank:
 *         type: object
 *         properties:
 *           name:
 *             type: string
 *       reportPeriod:
 *         $ref: '#/definitions/ReportPeriod'
 *       feeRecords:
 *         type: array
 *         items:
 *           $ref: '#/definitions/SelectedFeeRecordDetails'
 *       payments:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             dateReceived:
 *               type: string
 *             currency:
 *                 $ref: '#/definitions/Currency'
 *             amount:
 *                 type: number
 *             reference:
 *               type: string
 *               nullable: true
 *       canAddToExistingPayment:
 *         type: boolean
 */
