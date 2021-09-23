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
 *       details:
 *         type: object
 *         properties:
 *           status:
 *             type: string
 *             example: Submitted
 *           bankSupplyContractID:
 *             type: string
 *             example: a1
 *           bankSupplyContractName:
 *             type: string
 *             example: Test
 *           submissionType:
 *             type: string
 *             example: Automatic Inclusion Notice
 *           owningBank:
 *             $ref: '#/definitions/Bank'
 *           maker:
 *             $ref: '#/definitions/User'
 *           created:
 *             type: string
 *             example: '1632389070727'
 *           dateOfLastAction:
 *             type: string
 *             example: '1632389070727'
 *           previousStatus:
 *             type: string
 *             example: Ready for Checker's approval
 *           submissionCount:
 *             type: integer
 *             emample: 1
 *           checker:
 *             $ref: '#/definitions/User'
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
 *   FacilityBSS:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         example: 123abc
 *       associatedDealId:
 *         type: string
 *         example: 456abc
 *       facilityType:
 *         type: string
 *         example: bond
 *       createdDate:
 *         type: string
 *         example: '1632392646415'
 *       lastEdited:
 *         type: string
 *         example: '1632392778918'
 *       status:
 *         type: string
 *         example: Acknowledged by UKEF
 *       previousStatus:
 *         type: string
 *         example: Completed
 *       ukefFacilityID:
 *         type: string
 *         example: '0030034644'
 *       facilityStage:
 *         type: string
 *         example: Issued
 *       requestedCoverStartDate:
 *         type: string
 *         example: 1632392644463.0
 *       requestedCoverStartDate-day:
 *         type: string
 *         example: 10
 *       requestedCoverStartDate-month:
 *         type: string
 *         example: 03
 *       requestedCoverStartDate-year:
 *         type: string
 *         example: 2021
 *       coverEndDate-day:
 *         type: string
 *         example: 23
 *       coverEndDate-month:
 *         type: string
 *         example: 10
 *       coverEndDate-year:
 *         type: string
 *         example: 2021
 *       issueFacilityDetailsSubmitted:
 *         type: boolean
 *         example: true
 *       issuedFacilitySubmittedToUkefTimestamp:
 *         type: string
 *         example: '1632392674598'
 *       issuedFacilitySubmittedToUkefBy:
 *         $ref: '#/definitions/User'
 *       hasBeenAcknowledged:
 *         type: boolean
 *         example: true
 *       conversionRate:
 *         type: string
 *         example: '100'
 *       coveredPercentage:
 *         type: string
 *         example: '24'
 *       currencySameAsSupplyContractCurrency:
 *         type: string
 *         example: true
 *       facilityValue:
 *         type: string
 *         eaxmple: '2400.00'
 *       currency:
 *         type: object
 *         properties:
 *           id:
 *             type: string
 *             example: USD
 *           text:
 *             type: string
 *             example: USD - US Dollars
 *       ukefGuaranteeInMonths:
 *         type: string
 *         example: '12'
 *       uniqueIdentificationNumber:
 *         type: string
 *         example: '1234'
 *       guaranteeFeePayableByBank:
 *         type: string
 *         example: '10.8000'
 *       minimumRiskMarginFee:
 *         type: string
 *         example: '10'
 *       riskMarginFee:
 *         type: string
 *         example: '12'
 *       ukefExposure:
 *         type: string
 *         example: '567.00'
 *       dayCountBasis:
 *         type: string
 *         example: '365'
 *       feeType:
 *         type: string
 *         example: 'In arrear'
 *       feeFrequency:
 *         type: string
 *         example: 'Monthly'
 *       bondType:
 *         type: string
 *         example: Advance payment guarantee
 *       bondBeneficiary:
 *         type: string
 *         example: The beneficiary
 *       bondIssuer:
 *         type: string
 *         example: An issuer
 *
 *   FacilitiesBSS:
 *     type: array
 *     items:
 *       type: object
 *       $ref: '#/definitions/FacilityBSS'
 */
