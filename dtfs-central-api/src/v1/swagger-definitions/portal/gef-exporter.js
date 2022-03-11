/**
 * @openapi
 * definitions:
 *   GEFAddress:
 *     type: object
 *     properties:
 *       organisationName:
 *         type: string
 *         example: A Company
 *       addressLine1:
 *         type: string
 *         example: Line 1
 *       addressLine2:
 *         type: string
 *         example: Line 2
 *       addressLine3:
 *         type: string
 *         example: Line 3
 *       locality:
 *         type: string
 *         example: ABERTAWE
 *       postalCode:
 *         type: string
 *         example: W1A
 *       country:
 *         type: string
 *         example: United Kingdom
 *   GEFIndustry:
 *     type: object
 *     properties:
 *       code:
 *         type: string
 *         example: '1003'
 *       name:
 *         type: string
 *         example: Manufacturing
 *       class:
 *         type: object
 *         properties:
 *           code:
 *             type: string
 *             example: '25620'
 *           name:
 *             type: string
 *             example: Machining
 *   GEFExporter:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         example: 123abc
 *       companiesHouseRegistrationNumber:
 *         type: string
 *         example: '123456789'
 *       companyName:
 *         type: string
 *         example: A Company, Inc.
 *       registeredAddress:
 *         type: object
 *         $ref: '#/definitions/GEFAddress'
 *       correspondenceAddress:
 *         type: object
 *         $ref: '#/definitions/GEFAddress'
 *       selectedIndustry:
 *         type: object
 *         $ref: '#/definitions/GEFIndustry'
 *       industries:
 *         type: array
 *         items:
 *           $ref: '#/definitions/GEFIndustry'
 *       smeType:
 *         type: string
 *         example: Micro
 *       probabilityOfDefault:
 *         type: integer
 *         example: 45.5
 *       isFinanceIncreasing:
 *         type: boolean
 *         example: true
 *       createdAt:
 *         type: integer
 *         example: 1632743067563.0
 *       updatedAt:
 *         type: integer
 *         example: 1632743067680.0
 */
