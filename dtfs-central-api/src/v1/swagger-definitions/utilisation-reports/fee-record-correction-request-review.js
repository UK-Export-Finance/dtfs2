/**
 * @openapi
 * definitions:
 *   FeeRecordResponse:
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
 *       correctionRequestDetails:
 *         type: object
 *         properties:
 *           facilityId:
 *             type: string
 *           exporter:
 *             type: string
 *           reasons:
 *             type: array
 *             items:
 *               $ref: '#/definitions/RecordCorrectionReason'
 *           additionalInfo:
 *             type: string
 *           contactEmailAddresses:
 *             type: array
 *             items:
 *               type: string
 */
