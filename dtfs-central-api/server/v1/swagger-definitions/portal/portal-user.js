/**
 * @openapi
 * definitions:
 *   PortalUser:
 *     type: object
 *     properties:
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
 *       surname:
 *         type: string
 *         example: Bloggs
 *       username:
 *         type: string
 *         example: test@test.com
 *       email:
 *         type: string
 *         example: test@test.com
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
 *       salt:
 *         type: string
 *         example: 'random-salt'
 *       hash:
 *         type: string
 *         example: 'hashed-password'
 *       resetPwdToken:
 *         type: string
 *         description: Token used to reset the user's password.
 *       resetPwdTimestamp:
 *         type: string
 *         description: Timestamp of when the password reset token was issued.
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
 *       signInLinkSendDate:
 *         type: integer
 *         format: int64
 *         description: Unix timestamp in milliseconds of when the sign-in link was last sent.
 *       signInOTPSendDate:
 *         type: integer
 *         format: int64
 *         description: Unix timestamp in milliseconds of when the sign-in OTP was last sent.
 *       signInLinkSendCount:
 *         type: integer
 *         description: Number of times a sign-in link has been sent.
 *       signInOTPSendCount:
 *         type: integer
 *         description: Number of times a sign-in OTP has been sent.
 *       signInTokens:
 *         type: array
 *         description: Array of active sign-in tokens for 2FA.
 *         items:
 *           $ref: '#/definitions/SignInTokens'
 *   SignInTokens:
 *     type: object
 *     properties:
 *       saltHex:
 *         type: string
 *         description: Hex-encoded salt used when hashing the sign-in token.
 *       hashHex:
 *         type: string
 *         description: Hex-encoded hash of the sign-in token.
 *       expiry:
 *         type: integer
 *         format: int64
 *         description: Unix timestamp in milliseconds of when the sign-in token expires.
 */
