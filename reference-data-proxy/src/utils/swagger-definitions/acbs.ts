/**
 * @openapi
 * definitions:
 *   ACBSCreateRecordRequestBody:
 *     type: object
 *     properties:
 *       deal:
 *         $ref: '#/definitions/DealBSS'
 *       bank:
 *         $ref: '#/definitions/Bank'
 *   ACBSCreateRecordResponseBody:
 *     type: object
 *     properties:
 *       portalDealId:
 *         type: string
 *         example: 123abc
 *       ukefDealId:
 *         type: string
 *         example: '20010739'
 *       deal:
 *         type: object
 *         properties:
 *           parties:
 *             type: object
 *           deal:
 *             type: object
 *           investor:
 *             type: object
 *           guarantee:
 *             type: object
 *       facilities:
 *         type: array
 *   ACBSIssueFacilityRequestBody:
 *     type: object
 *     properties:
 *       facility:
 *         type: object
 *         example: { allFacilityFields: true }
 *       deal:
 *         type: object
 *         example: { submissionType: 'GEF', submissionDate: 123, exporter: {} }
 *   ACBSIssueFacilityResponseBody:
 *     type: object
 *     properties:
 *       facilityId:
 *         type: string
 *         example: abc1234
 *       issuedFacilityMaster:
 *         type: object
 *         properties:
 *           submittedToACBS:
 *             type: string
 *             example: '2021-09-30T09:42:31+01:00'
 *           receivedFromACBS:
 *             type: string
 *             example: '2021-20-02T08:32:31+01:00'
 *           dealIdentifier:
 *             type: string
 *             example: '0020900040'
 *           facilityIdentifier:
 *             type: string
 *             example: '0020900041'
 *           portfolioIdentifier:
 *             type: string
 *             example: 'E1'
 *           dealBorrowerIdentifier:
 *             type: string
 *             example: '00000000'
 *           maximumLiability:
 *             type: integer
 *             example: 501927.75
 *           productTypeId:
 *             type: string
 *             example: '250'
 *           capitalConversionFactorCode:
 *             type: string
 *             example: '8'
 *           productTypeName:
 *             type: string
 *             example: 'Bond'
 *           currency:
 *             type: string
 *             example: 'CAD'
 *           guaranteeCommencementDate:
 *             type: string
 *             example: '2018-10-11'
 *           guaranteeExpiryDate:
 *             type: string
 *             example: '2019-01-23'
 *           nextQuarterEndDate:
 *             type: string
 *             example: '2018-12-31'
 *           facilityInitialStatus:
 *             type: string
 *             example: 'P'
 *           facilityOverallStatus:
 *             type: string
 *             example: 'D'
 *           delegationType:
 *             type: string
 *             example: 'A'
 *           intrestOrFeeRate:
 *             type: integer
 *             example: 2.35
 *           facilityStageCode:
 *             type: string
 *             example: '06'
 *           exposurePeriod:
 *             type: string
 *             example: '18'
 *           creditRatingCode:
 *             type: string
 *             example: '14'
 *           guaranteePercentage:
 *             type: integer
 *             example: 80
 *           premiumFrequencyCode:
 *             type: string
 *             example: '2'
 *           riskCountryCode:
 *             type: string
 *             example: 'GBR'
 *           riskStatusCode:
 *             type: string
 *             example: '03'
 *           effectiveDate:
 *             type: string
 *             example: '2018-10-11'
 *           foreCastPercentage:
 *             type: integer
 *             example: 75
 *           issueDate:
 *             type: string
 *             example: '2018-10-11'
 *           description:
 *             type: string
 *             example: 'D:TRUEFORM-WAY-FINDER POSTS'
 *           agentBankIdentifier:
 *             type: string
 *             example: '00000000'
 *           obligorPartyIdentifier:
 *             type: string
 *             example: '00510701'
 *           obligorName:
 *             type: string
 *             example: 'Automation KE 97'
 *           obligorIndustryClassification:
 *             type: string
 *             example: '0116'
 *           probabilityOfDefault:
 *             type: integer
 *             example: 14
 */
