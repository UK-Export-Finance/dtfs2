/**
 * @openapi
 * definitions:
 *   KeyingSheetRowStatus:
 *     type: string
 *     enum:
 *       - TO_DO
 *       - DONE
 *   KeyingSheetAdjustment:
 *     type: object
 *     properties:
 *       change:
 *         type: string
 *         enum:
 *           - INCREASE
 *           - DECREASE
 *           - NONE
 *       amount:
 *         type: number
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
 *       fixedFeeAdjustment:
 *         $ref: '#/definitions/KeyingSheetAdjustment'
 *         nullable: true
 *       principalBalanceAdjustment:
 *         $ref: '#/definitions/KeyingSheetAdjustment'
 *         nullable: true
 *   KeyingSheet:
 *     type: array
 *     items:
 *       $ref: '#/definitions/KeyingSheetRow'
 */
