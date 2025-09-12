/**
 * @openapi
 * definitions:
 *   FeeRecordCorrectionReview:
 *     type: object
 *     properties:
 *       correctionId:
 *         type: number
 *       feeRecord:
 *         type: object
 *         properties:
 *           exporter:
 *             type: string
 *           reportedFees:
 *             type: object
 *             $ref: '#/definitions/CurrencyAndAmount'
 *       reasons:
 *         type: array
 *         items:
 *           $ref: '#/definitions/RecordCorrectionReason'
 *       errorSummary:
 *          type: string
 *       formattedOldValues:
 *          type: string
 *       formattedNewValues:
 *          type: string
 *       bankCommentary:
 *          type: string
 *          required: false
 */
