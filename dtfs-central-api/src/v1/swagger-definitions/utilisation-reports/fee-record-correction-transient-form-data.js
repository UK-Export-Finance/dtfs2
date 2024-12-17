/**
 * @openapi
 * definitions:
 *   FeeRecordCorrectionTransientFormData:
 *     type: object
 *     properties:
 *       reasons:
 *         description: The fee record correction reasons
 *         type: array
 *         items:
 *           $ref: '#/definitions/FeeRecordCorrectionReason'
 *       additionalInfo:
 *         description: Additional record correction information
 *         type: string
 */
