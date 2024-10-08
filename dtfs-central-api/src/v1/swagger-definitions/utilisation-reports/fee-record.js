/**
 * @openapi
 * definitions:
 *   FeeRecordStatus:
 *     type: string
 *     enum:
 *       - TO_DO
 *       - MATCH
 *       - DOES_NOT_MATCH
 *       - READY_TO_KEY
 *       - RECONCILIATION_COMPLETED
 *   FeeRecord:
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
 */
