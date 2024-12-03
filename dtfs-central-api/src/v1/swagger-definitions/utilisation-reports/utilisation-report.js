/**
 * @openapi
 * definitions:
 *   UtilisationReport:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         example: '9'
 *         description: Bank id. Separate MongoDB _id
 *       reportPeriod:
 *         type: object
 *         properties:
 *           start:
 *             type: object
 *             properties:
 *               month:
 *                 type: integer
 *                 example: 1
 *                 description: Start month of utilisation report indexed at 1
 *               year:
 *                 type: integer
 *                 example: 2021
 *                 description: Start year of utilisation report
 *           end:
 *             type: object
 *             properties:
 *               month:
 *                 type: integer
 *                 example: 1
 *                 description: End month of utilisation report indexed at 1
 *               year:
 *                 type: integer
 *                 example: 2021
 *                 description: End year of utilisation report
 *       dateUploaded:
 *         type: string
 *         example: 2021-01-01T00:00:00.000Z
 *       path:
 *         type: string
 *         example: 'document.pdf'
 *       uploadedBy:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             example: '9'
 *           firstname:
 *             type: string
 *             example: 'John'
 *           surname:
 *             type: string
 *             example: 'Smith'
 *       bank:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             example: '9'
 *           name:
 *             type: string
 *             example: 'UKEF test bank (Delegated)'
 *   UtilisationReportStatus:
 *     type: string
 *     enum:
 *       - REPORT_NOT_RECEIVED
 *       - PENDING_RECONCILIATION
 *       - RECONCILIATION_IN_PROGRESS
 *       - RECONCILIATION_COMPLETED
 *     description: the reconciliation status of a utilisation report
 *   UtilisationReportStatusWithReportId:
 *     type: object
 *     properties:
 *       status:
 *         $ref: '#/definitions/UtilisationReportStatus'
 *       report:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             description: Mongo id of the report
 */
