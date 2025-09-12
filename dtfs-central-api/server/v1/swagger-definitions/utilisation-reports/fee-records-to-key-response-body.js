/**
 * @openapi
 * definitions:
 *   FeeRecordToKey:
 *     type: object
 *     properties:
 *       id:
 *         type: number
 *       facilityId:
 *         type: string
 *       exporter:
 *         type: string
 *       reportedFees:
 *         type: object
 *         $ref: '#/definitions/CurrencyAndAmount'
 *       reportedPayments:
 *         type: object
 *         $ref: '#/definitions/CurrencyAndAmount'
 *       paymentsReceived:
 *         type: array
 *         items:
 *           $ref: '#/definitions/CurrencyAndAmount'
 *   FeeRecordsToKeyResponseBody:
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
 *       reportPeriod:
 *         type: object
 *         $ref: '#/definitions/ReportPeriod'
 *       feeRecords:
 *         type: array
 *         items:
 *           $ref: '#/definitions/FeeRecordToKey'
 */
