/**
 * @openapi
 * definitions:
 *   FacilityBSS:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         example: 123abc
 *       dealId:
 *         type: string
 *         example: 456abc
 *       type:
 *         type: string
 *         example: Bond
 *       createdDate:
 *         type: string
 *         example: '1632392646415'
 *       updatedAt:
 *         type: integer
 *         example: 1632392778918
 *       status:
 *         type: string
 *         example: Acknowledged by UKEF
 *       previousStatus:
 *         type: string
 *         example: Completed
 *       ukefFacilityId:
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
 *       conversionRateDate-day:
 *         type: string
 *         example: '01'
 *       conversionRateDate-month:
 *         type: string
 *         example: '02'
 *       conversionRateDate-year:
 *         type: string
 *         example: '2021'
 *       coveredPercentage:
 *         type: string
 *         example: '24'
 *       currencySameAsSupplyContractCurrency:
 *         type: string
 *         example: true
 *       value:
 *         type: string
 *         example: '2400.00'
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
