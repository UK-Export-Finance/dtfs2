/**
 * @openapi
 * definitions:
 *   PortalUser:
 *     type: object
 *     properties:
 *       _id:
 *         type: string
 *         example: 607f1f77bcf86cd799439011
 *         required: true
 *       user-status:
 *         type: string
 *         example: active
 *       disabled:
 *         type: boolean
 *         description: Whether the user account is disabled.
 *       timezone:
 *         type: string
 *         example: Europe/London
 *       firstname:
 *         type: string
 *         example: Joe
 *         required: true
 *       surname:
 *         type: string
 *         example: Bloggs
 *         required: true
 *       username:
 *         type: string
 *         example: test@test.com
 *       email:
 *         type: string
 *         example: test@test.com
 *         required: true
 *       roles:
 *         type: array
 *         items:
 *           type: string
 *           enum:
 *             - maker
 *             - checker
 *             - admin
 *             - read-only
 *             - payment-report-officer
 *         example: ['maker']
 *       bank:
 *         $ref: '#/definitions/Bank'
 *       lastLogin:
 *         type: integer
 *         format: int64
 *         description: Unix timestamp in milliseconds of the user's last login.
 *       loginFailureCount:
 *         type: integer
 *         description: Number of consecutive failed login attempts.
 *       sessionIdentifier:
 *         type: string
 *         description: Identifier for the user's current session.
 */
