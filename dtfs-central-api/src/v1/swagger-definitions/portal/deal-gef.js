/**
 * @openapi
 * definitions:
 *   DealGEF:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         example: 123abc
 *       dealType:
 *         type: string
 *         example: GEF
 *       status:
 *         type: string
 *         example: DRAFT
 *       bank:
 *         $ref: '#/definitions/Bank'
 *       maker:
 *         $ref: '#/definitions/User'
 *       exporter:
 *         type: object
 *         example: {}
 *       bankInternalRefName:
 *         type: string
 *         example: Example name
 *       additionalRefName:
 *         type: string
 *         example: Hello World
 *       mandatoryVersionId:
 *         type: string
 *         example: '123'
 *       createdAt:
 *         type: integer
 *         example: 1632743099128.0
 *       updatedAt:
 *         type: integer
 *         example: 1632743099128.0
 *       submissionType:
 *         type: string
 *         example: Automatic Inclusion Notice
 *       submissionCount:
 *         type: integer
 *         example: 0
 *       submissionDate:
 *         type: string
 *         example: '1632749543144'
 *       supportingInformation:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: NOT_STARTED
 *       ukefDealId:
 *         type: string
 *         example: '0030034426'
 *       checkerId:
 *         type: string
 *         example: 123abc
 *       comments:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             role:
 *               type: string
 *               example: maker
 *             userName:
 *               type: string
 *               example: BANK1_MAKER1
 *             createdAt:
 *               type: integer
 *               example: 1632477910819
 *             comment:
 *               type: string
 *               example: LGTM
 */
