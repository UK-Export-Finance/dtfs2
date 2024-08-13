/**
 * @openapi
 * definitions:
 *   SystemPortalOrTfmAuditDetails:
 *     type: object
 *     properties:
 *       userType:
 *         type: string
 *         enum: [system, portal, tfm]
 *       id:
 *         type: string
 *         example: '1234567890abcdef12345678'
 *   PortalAuditDetails:
 *     type: object
 *     properties:
 *       userType:
 *         type: string
 *         enum: [portal]
 *       id:
 *         type: string
 *         example: '1234567890abcdef12345678'
 *   TfmAuditDetails:
 *     type: object
 *     properties:
 *       userType:
 *         type: string
 *         enum: [tfm]
 *       id:
 *         type: string
 *         example: '1234567890abcdef12345678'
 */
