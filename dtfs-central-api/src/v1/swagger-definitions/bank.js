/**
 * @openapi
 * definitions:
 *   Bank:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *       id:
 *         type: string
 *         example: '9'
 *         description: Bank id. Separate MongoDB _id
 *       name:
 *         type: string
 *         example: UKEF test bank (Delegated)
 *       mga:
 *         type: array
 *         items:
 *           type: string
 *       emails:
 *         type: array
 *         items:
 *           type: string
 *           format: email
 *           example: 'test-user@test.com'
 *       companiesHouseNo:
 *         type: string
 *         example: UKEF0001
 *       partyUrn:
 *         type: string
 *         example: '00318345'
 *       hasGefAccessOnly:
 *         type: boolean
 *       paymentOfficerTeam:
 *         type: object
 *         properties:
 *           teamName:
 *             type: string
 *           emails:
 *             type: array
 *             items:
 *               - type: string
 *                 format: email
 *                 example: 'test-user@test.com'
 *       utilisationReportPeriodSchedule:
 *         - $ref: '#/definitions/BankReportPeriodSchedule'
 *       isVisibleInTfmUtilisationReports:
 *         type: boolean
 *   BankWithReportingYears:
 *     allOf:
 *       - $ref: '#/definitions/Bank'
 *       - type: object
 *         properties:
 *           reportingYears:
 *             type: array
 *             items:
 *               type: number
 */
