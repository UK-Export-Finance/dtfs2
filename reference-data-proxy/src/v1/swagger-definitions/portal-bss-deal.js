/**
 * @openapi
 * definitions:
 *   DealBSS:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         example: 123abc
 *       dealType:
 *         type: string
 *         example: 'BSS/EWCS'
 *       updatedAt:
 *         type: integer
 *         example: 1639675204629.0
 *       bankInternalRefName:
 *         type: string
 *         example: a1
 *       additionalRefName:
 *         type: string
 *         example: Test
 *       status:
 *         type: string
 *         example: Submitted
 *       previousStatus:
 *         type: string
 *         example: Ready for Checker's approval
 *       bank:
 *         $ref: '#/definitions/Bank'
 *       details:
 *         type: object
 *         properties:
 *           submissionType:
 *             type: string
 *             example: Automatic Inclusion Notice
 *           maker:
 *             type: object
 *           created:
 *             type: string
 *             example: '1632389070727'
 *           submissionCount:
 *             type: integer
 *             emample: 1
 *           checker:
 *             type: object
 *           submissionDate:
 *             type: string
 *             example: '1632389070727'
 *           ukefDealId:
 *             type: string
 *             example: '0030034426'
 *       eligibility:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: 'Completed'
 *           criteria:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 123abc
 *                 id:
 *                   type: integer
 *                   example: 11
 *                 description:
 *                   type: string
 *                   example: The Supplier has confirmed in its Supplier Declaration that....
 *                 answer:
 *                   type: boolean
 *                   example: true
 *           agentName:
 *             type: string
 *             example: Joe Bloggs
 *           agentAddressLine1:
 *             type: string
 *             example: 27a
 *           agentAddressLine2:
 *             type: string
 *             example: Maxwell Road
 *           agentAddressLine3:
 *             type: string
 *             example: 'Line 3'
 *           agentAddressTown:
 *             type: string
 *             example: Northwood
 *           agentAddressPostcode:
 *             type: string
 *             example: HA6 2XY
 *           agentAddressCountry:
 *             type: object
 *             properties:
 *              code:
 *                type: string
 *                example: GBR
 *              name:
 *                type: string
 *                example: United Kingdom
 *       submissionDetails:
 *         type: object
 *         properties:
 *           indemnifier-address-line-1:
 *             type: string
 *             example: 27a
 *           indemnifier-address-line-2:
 *             type: string
 *             example: Maxwell Road
 *           indemnifier-address-line-3:
 *             type: string
 *             example: 'Line 3'
 *           indemnifier-address-town:
 *             type: string
 *             example: Northwood
 *           indemnifier-address-postcode:
 *             type: string
 *             example: HA6 2XY
 *           indemnifier-address-country:
 *             type: object
 *             properties:
 *              code:
 *                type: string
 *                example: GBR
 *              name:
 *                type: string
 *                example: United Kingdom
 *           indemnifier-companies-house-registration-number:
 *             type: string
 *             example: '08547313'
 *           indemnifier-correspondence-address-line-1:
 *             type: string
 *             example: 27 Petersfield
 *           indemnifier-correspondence-address-line-2:
 *             type: string
 *             example: Maxwell Road
 *           indemnifier-correspondence-address-line-3:
 *             type: string
 *             example: Essex
 *           indemnifier-correspondence-address-town:
 *             type: string
 *             example: Northwood
 *           indemnifier-correspondence-address-postcode:
 *             type: string
 *             example: HA6 2XY
 *           indemnifier-correspondence-address-country:
 *             type: object
 *             properties:
 *              code:
 *                type: string
 *                example: GBR
 *              name:
 *                type: string
 *                example: United Kingdom
 *           indemnifier-name:
 *             type: string
 *             example: COMPANY TRADING LTD
 *           indemnifierCorrespondenceAddressDifferent:
 *             type: string
 *             example: 'true'
 *           industry-sector:
 *             type: object
 *             properties:
 *              code:
 *                type: string
 *                example: '1008'
 *              name:
 *                type: string
 *                example: Accommodation and food service activities
 *           industry-class:
 *             type: object
 *             properties:
 *              code:
 *                type: string
 *                example: '56101'
 *              name:
 *                type: string
 *                example: Licensed restaurants
 *           legallyDistinct:
 *             type: string
 *             example: 'true'
 *           sme-type:
 *             type: string
 *             example: Small
 *           supplier-address-line-1:
 *             type: string
 *             example: 27 Petersfield
 *           supplier-address-line-2:
 *             type: string
 *             example: Maxwell Road
 *           supplier-address-line-3:
 *             type: string
 *             example: Essex
 *           supplier-address-town:
 *             type: string
 *             example: Northwood
 *           supplier-address-postcode:
 *             type: string
 *             example: HA6 2XY
 *           supplier-address-country:
 *             type: object
 *             properties:
 *              code:
 *                type: string
 *                example: 'GBR'
 *              name:
 *                type: string
 *                example: United Kingdom
 *           supplier-companies-house-registration-number:
 *             type: string
 *             example: '08547313'
 *           supplier-correspondence-line-1:
 *             type: string
 *             example: 27 Petersfield
 *           supplier-correspondence-line-2:
 *             type: string
 *             example: Maxwell Road
 *           supplier-correspondence-line-3:
 *             type: string
 *             example: Essex
 *           supplier-correspondence-town:
 *             type: string
 *             example: Northwood
 *           supplier-correspondence-postcode:
 *             type: string
 *             example: HA6 2XY
 *           supplier-correspondence-country:
 *             type: object
 *             properties:
 *              code:
 *                type: string
 *                example: 'GBR'
 *              name:
 *                type: string
 *                example: United Kingdom
 *           supplier-name:
 *             type: string
 *             example: Mock Supplier
 *           supplier-type:
 *             type: string
 *             example: Exporter
 *           supplier-correspondence-address-is-different:
 *             type: string
 *             example: 'true'
 *           supply-contract-description:
 *             type: string
 *             example: Mock free text
 *           buyer-address-line-1:
 *             type: string
 *             example: 27 Petersfield
 *           buyer-address-line-2:
 *             type: string
 *             example: Maxwell Road
 *           buyer-address-line-3:
 *             type: string
 *             example: Essex
 *           buyer-address-town:
 *             type: string
 *             example: Northwood
 *           buyer-address-postcode:
 *             type: string
 *             example: HA6 2XY
 *           buyer-address-country:
 *             type: object
 *             properties:
 *              code:
 *                type: string
 *                example: 'USA'
 *              name:
 *                type: string
 *                example: United States
 *           buyer-name:
 *             type: string
 *             example: Huggy Bear
 *           destinationOfGoodsAndServices:
 *             type: object
 *             properties:
 *              code:
 *                type: string
 *                example: 'USA'
 *              name:
 *                type: string
 *                example: United States
 *           viewedPreviewPage:
 *             type: boolean
 *             example: true
 *           supplyContractConversionRateToGBP:
 *             type: string
 *             example: '1.123456'
 *           supplyContractCurrency:
 *             type: object
 *             properties:
 *              id:
 *                type: string
 *                example: 'USD'
 *              text:
 *                type: string
 *                example: 'USD - US Dollars'
 *           supplyContractValue:
 *             type: string
 *             example: '10,000'
 *           supplyContractConversionDate-day:
 *             type: string
 *             example: '23'
 *           supplyContractConversionDate-month:
 *             type: string
 *             example: '09'
 *           supplyContractConversionDate-year:
 *             type: string
 *             example: '2021'
 *       facilities:
 *         type: array
 *         items:
 *           type: string
 *           example: 123abc
 *       bondTransactions:
 *         type: object
 *         properties:
 *           items:
 *             type: array
 *       loanTransactions:
 *         type: object
 *         properties:
 *           items:
 *             type: array
 *       summary:
 *         type: object
 *         properties:
 *           totalValue:
 *             type: object
 *             properties:
 *               dealInDealCurrency:
 *                 type: string
 *                 example: '10,000'
 *               dealInGbp:
 *                 type: string
 *                 example: '12,000'
 *               bondInDealCurrency:
 *                 type: string
 *                 example: '8,000'
 *               bondInGbp:
 *                 type: string
 *                 example: '16,000'
 *               loanInDealCurrency:
 *                 type: string
 *                 example: '4,000'
 *               loanInGbp:
 *                 type: string
 *                 example: '8,000'
 *       comments:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             text:
 *               type: string
 *               example: Amazing comment
 *             timestamp:
 *               type: string
 *               example: '1632763411621'
 *             user:
 *               type: object
 *       editedBy:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             date:
 *               type: string
 *               example: '1632233768694'
 *             username:
 *               type: string
 *               example: BANK1_MAKER1
 *             roles:
 *               type: array
 *               items:
 *                 type: string
 *               example: ['maker']
 *             bank:
 *               $ref: '#/definitions/Bank'
 *             userId:
 *               type: string
 *               example: 123abc
 */
