/**
 * @openapi
 * definitions:
 *   FeeRecordCorrectionResponse:
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
 *       reasons:
 *         type: array
 *         items:
 *           $ref: '#/definitions/RecordCorrectionReason'
 *       additionalInfo:
 *         type: string
 */
