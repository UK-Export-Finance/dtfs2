/**
 * @openapi
 * definitions:
 *   PaymentDetailsResponseBody:
 *     type: object
 *     properties:
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
 *       payment:
 *         type: object
 *         $ref: '#/definitions/Payment'
 *       feeRecords:
 *         type: array
 *         items:
 *           $ref: '#/definitions/FeeRecord'
 *       totalReportedPayments:
 *         type: object
 *         $ref: '#/definitions/CurrencyAndAmount'
 */
