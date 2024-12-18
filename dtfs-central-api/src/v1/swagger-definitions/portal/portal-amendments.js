/**
 * @openapi
 * definitions:
 *   PortalAmendment:
 *     type: object
 *     properties:
 *       type:
 *         type: string
 *         enum:
 *          - PORTAL
 *       amendmentId:
 *         type: string
 *         description: The unique identifier for the amendment.
 *       facilityId:
 *         type: string
 *         description: The unique identifier for the facility.
 *       dealId:
 *         type: string
 *         description: The unique identifier for the deal.
 *       createdAt:
 *         type: integer
 *         format: int64
 *         description: The timestamp when the amendment was created in seconds.
 *       updatedAt:
 *         type: integer
 *         format: int64
 *         description: The timestamp when the amendment was last updated in seconds.
 *       status:
 *         type: string
 *         enum:
 *           - NOT_STARTED
 *           - IN_PROGRESS
 *           - COMPLETED
 *         description: The current status of the amendment.
 *       version:
 *         type: integer
 *         description: The version number of the amendment.
 *       changeCoverEndDate:
 *         type: boolean
 *         description: Indicates if the cover end date is changed.
 *       coverEndDate:
 *         type: integer
 *         format: int64
 *         nullable: true
 *         description: The new cover end date in seconds.
 *       currentCoverEndDate:
 *         type: integer
 *         format: int64
 *         nullable: true
 *         description: The current cover end date in seconds.
 *       isUsingFacilityEndDate:
 *         type: boolean
 *         description: Indicates if the facility end date is being used.
 *       facilityEndDate:
 *         type: string
 *         format: date
 *         description: The end date of the facility.
 *       bankReviewDate:
 *         type: string
 *         format: date
 *         description: The date when the bank reviewed the amendment.
 *       changeFacilityValue:
 *         type: boolean
 *         description: Indicates if the facility value is changed.
 *       value:
 *         type: number
 *         nullable: true
 *         description: The new value of the facility.
 *       currentValue:
 *         type: number
 *         nullable: true
 *         description: The current value of the facility.
 *       currency:
 *         type: string
 *         enum:
 *           - USD
 *           - EUR
 *           - GBP
 *           - JPY
 *         nullable: true
 *         description: The currency of the facility value.
 *       requestDate:
 *         type: integer
 *         description: The date when the amendment was requested in seconds.
 *       ukefExposure:
 *         type: number
 *         nullable: true
 *         description: The UKEF exposure amount.
 *       coveredPercentage:
 *         type: number
 *         description: The percentage of the facility covered.
 *       requireUkefApproval:
 *         type: boolean
 *         description: Indicates if UKEF approval is required.
 *       submissionType:
 *         type: string
 *         description: The type of submission.
 *       submittedAt:
 *         type: integer
 *         format: int64
 *         description: The timestamp when the amendment was submitted in seconds.
 *       submissionDate:
 *         type: integer
 *         format: int64
 *         description: The date when the amendment was submitted in seconds.
 *       effectiveDate:
 *         type: integer
 *         description: The effective date of the amendment in seconds.
 *       createdBy:
 *         type: object
 *         properties:
 *           username:
 *             type: string
 *             description: The username of the creator.
 *           name:
 *             type: string
 *             description: The name of the creator.
 *           email:
 *             type: string
 *             description: The email of the creator.
 *   PortalAmendmentUserInput:
 *     type: object
 *     properties:
 *       changeCoverEndDate:
 *         type: boolean
 *         description: Indicates if the cover end date is changed.
 *       coverEndDate:
 *         type: integer
 *         format: int64
 *         nullable: true
 *         description: The new cover end date in seconds.
 *       currentCoverEndDate:
 *         type: integer
 *         format: int64
 *         nullable: true
 *         description: The current cover end date in seconds.
 *       isUsingFacilityEndDate:
 *         type: boolean
 *         description: Indicates if the facility end date is being used.
 *       facilityEndDate:
 *         type: string
 *         format: date
 *         description: The end date of the facility.
 *       bankReviewDate:
 *         type: string
 *         format: date
 *         description: The date when the bank reviewed the amendment.
 *       changeFacilityValue:
 *         type: boolean
 *         description: Indicates if the facility value is changed.
 *       value:
 *         type: number
 *         nullable: true
 *         description: The new value of the facility.
 *       currentValue:
 *         type: number
 *         nullable: true
 *         description: The current value of the facility.
 *       currency:
 *         type: string
 *         enum:
 *           - USD
 *           - EUR
 *           - GBP
 *           - JPY
 *         nullable: true
 *         description: The currency of the facility value.
 *       ukefExposure:
 *         type: number
 *         nullable: true
 *         description: The UKEF exposure amount.
 *       coveredPercentage:
 *         type: number
 *         description: The percentage of the facility covered.
 */
