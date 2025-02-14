/**
 * @openapi
 * definitions:
 *   KeyingSheetRowStatus:
 *     type: string
 *     enum:
 *       - TO_DO
 *       - DONE
 *   KeyingSheetRow:
 *     type: object
 *     properties:
 *       feeRecordId:
 *         type: number
 *       status:
 *         $ref: '#/definitions/KeyingSheetRowStatus'
 *       facilityId:
 *         type: string
 *       exporter:
 *         type: string
 *       datePaymentReceived:
 *         type: string
 *         format: date
 *         nullable: true
 *       feePayments:
 *         type: array
 *         items:
 *           $ref: '#/definitions/CurrencyAndAmount'
 *       baseCurrency:
 *         $ref: '#/definitions/Currency'
 *   KeyingSheet:
 *     type: array
 *     items:
 *       $ref: '#/definitions/KeyingSheetRow'
 */
