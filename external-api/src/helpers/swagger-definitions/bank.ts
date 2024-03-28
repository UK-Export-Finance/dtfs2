/**
 * @openapi
 * definitions:
 *   Bank:
 *     type: object
 *     properties:
 *       id:
 *         type: string
 *         example: '9'
 *         description: Bank id. Separate MongoDB _id
 *       name:
 *         type: string
 *         example: UKEF test bank (Delegated)
 *       emails:
 *         type: array
 *         items:
 *           type: string
 *           example: maker1@ukexportfinance.gov.uk
 *       mga:
 *         type: array
 *         items:
 *           type: string
 *           example: 'document.pdf'
 *       companiesHouseNo:
 *         type: string
 *         example: UKEF0001
 *       partyUrn:
 *         type: string
 *         example: '00318345'
 */
