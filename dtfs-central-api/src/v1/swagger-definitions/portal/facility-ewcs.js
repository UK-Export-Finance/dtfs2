/**
 * @openapi
 * definitions:
 *   FacilityEWCS:
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
 *         example: loan
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
 *       bankReferenceNumber:
 *         type: string
 *         example: 123-reference
 *       disbursementAmount:
 *         type: string
 *         example: '80'
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
 *       guaranteeFeePayableByBank:
 *         type: string
 *         example: '10.8000'
 *       interestMarginFee:
 *         type: string
 *         example: '12'
 *       ukefExposure:
 *         type: string
 *         example: '567.00'
 *       minimumQuarterlyFee:
 *         type: string
 *         example: '20'
 *       dayCountBasis:
 *         type: string
 *         example: '365'
 *       premiumType:
 *         type: string
 *         example: 'In advance'
 *       oremiumFrequency:
 *         type: string
 *         example: 'Monthly'
 */
