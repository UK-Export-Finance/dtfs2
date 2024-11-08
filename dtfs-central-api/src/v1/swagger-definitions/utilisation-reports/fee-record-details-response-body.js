/**
 * @openapi
 * definitions:
 *   FeeRecordDetailsByIdResponse:
 *     type: object
 *     properties:
 *       id:
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
 *       facilityId:
 *         type: string
 *       exporter:
 *         type: string
 */
