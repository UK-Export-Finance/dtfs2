const { HttpStatusCode } = require('axios');
const express = require('express');
const passport = require('passport');
const { param } = require('express-validator');
const { OTP } = require('@ukef/dtfs2-common');

const { validateUserHasAtLeastOneAllowedRole } = require('./roles/validate-user-has-at-least-one-allowed-role');
const { validateUserAndBankIdMatch } = require('./validation/validate-user-and-bank-id-match');
const { bankIdValidation, sqlIdValidation, mongoIdValidation, isProductionValidation } = require('./validation/route-validators/route-validators');
const { handleExpressValidatorResult } = require('./validation/route-validators/express-validator-result-handler');
const { MAKER, CHECKER, READ_ONLY, ADMIN, PAYMENT_REPORT_OFFICER } = require('./roles/roles');

const dealsController = require('./controllers/deal.controller');
const dealName = require('./controllers/deal-name.controller');
const dealStatus = require('./controllers/deal-status.controller');
const dealSubmissionDetails = require('./controllers/deal-submission-details.controller');
const dealClone = require('./controllers/deal-clone.controller');
const dealEligibilityCriteria = require('./controllers/deal-eligibility-criteria.controller');
const dealEligibilityDocumentation = require('./controllers/deal-eligibility-documentation.controller');
const banks = require('./controllers/banks.controller');
const currencies = require('./controllers/currencies.controller');
const countries = require('./controllers/countries.controller');
const feedback = require('./controllers/feedback.controller');
const industrySectors = require('./controllers/industrySectors.controller');
const mandatoryCriteria = require('./controllers/mandatoryCriteria.controller');
const mandatoryCriteriaVersioned = require('./gef/controllers/mandatoryCriteriaVersioned.controller');
const eligibilityCriteria = require('./controllers/eligibilityCriteria.controller');
const loans = require('./controllers/loans.controller');
const loanIssueFacility = require('./controllers/loan-issue-facility.controller');
const bonds = require('./controllers/bonds.controller');
const facilitiesController = require('./controllers/facilities.controller');
const bondIssueFacility = require('./controllers/bond-issue-facility.controller');
const bondChangeCoverStartDate = require('./controllers/bond-change-cover-start-date.controller');
const loanChangeCoverStartDate = require('./controllers/loan-change-cover-start-date.controller');
const { ukefDecisionReport, unissuedFacilitiesReport } = require('./controllers/reports');
const utilisationReportControllers = require('./controllers/utilisation-report-service');
const { getBankHolidays } = require('./controllers/bank-holidays.controller');
const companies = require('./controllers/companies.controller');
const tfm = require('./controllers/tfm.controller');

const { fileUpload, utilisationReportFileUpload } = require('./middleware');
const checkApiKey = require('./middleware/headers/check-api-key');

const users = require('./users/routes');
const gef = require('./gef/routes');
const { SIGN_IN_LINK } = require('../constants');

const partial2faTokenPassportStrategy = 'login-in-progress';

// Open router requires no authentication
const openRouter = express.Router();

/**
 * @openapi
 * /login:
 *    post:
 *      summary: Login
 *      tags: [Portal]
 *      description: Login with email and password to receive a JWT token.
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                username:
 *                  type: string
 *                password:
 *                  type: string
 *      responses:
 *        200:
 *          description: Successful login
 *        401:
 *          description: Invalid credentials or disabled account
 *        403:
 *          description: Account blocked
 *
 */
openRouter.route('/login').post(checkApiKey, users.login);

/**
 * @openapi
 * /users/reset-password:
 *    post:
 *      summary: Request password reset
 *      tags: [Portal]
 *      description: Send a password reset email to the user.
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *      responses:
 *        200:
 *          description: Password reset email sent
 */
openRouter.route('/users/reset-password').post(checkApiKey, users.resetPassword);

/**
 * @openapi
 * /users/reset-password/:resetPwdToken:
 *    post:
 *      summary: Reset password using token
 *      tags: [Portal]
 *      description: Reset the user's password using the provided reset token.
 *      parameters:
 *        - in: path
 *          name: resetPwdToken
 *          schema:
 *            type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                currentPassword:
 *                  type: string
 *                password:
 *                  type: string
 *                passwordConfirm:
 *                  type: string
 *      responses:
 *        200:
 *          description: Password reset successful
 *        400:
 *          description: Empty password or invalid link
 */
openRouter.route('/users/reset-password/:resetPwdToken').post(checkApiKey, users.resetPasswordWithToken);

/**
 * @openapi
 * /feedback:
 *    post:
 *      summary: Submit feedback
 *      tags: [Portal]
 *      description: Submit feedback about the service
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                role:
 *                  type: string
 *                organisation:
 *                  type: string
 *                reasonForVisiting:
 *                  type: string
 *                reasonForVisitingOther:
 *                  type: string
 *                easyToUse:
 *                  type: string
 *                clearlyExplained:
 *                  type: string
 *                satisfied:
 *                  type: string
 *                howCanWeImprove:
 *                  type: string
 *                emailAddress:
 *                  type: string
 *                submittedBy:
 *                  type: string
 *      responses:
 *        200:
 *          description: Feedback submitted successfully
 *        400:
 *          description: Invalid feedback data
 *        500:
 *          description: Internal server error
 */
openRouter.route('/feedback').post(checkApiKey, feedback.create);

/**
 * @openapi
 * /users/:userId/sign-in-link/:signInToken/login:
 *    post:
 *      summary: Login with sign in link
 *      description: Login a user using a sign in link
 *      tags: [Portal]
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *        - in: path
 *          name: signInToken
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Login successful
 *        404:
 *          description: Not found
 *        403:
 *          description: Forbidden
 */
openRouter
  .route('/users/:userId/sign-in-link/:signInToken/login')
  .post(
    passport.authenticate(partial2faTokenPassportStrategy, { session: false }),
    param('userId').isMongoId().withMessage('Value must be a valid MongoId'),
    param('signInToken')
      .isHexadecimal()
      .withMessage('Value must be a hexadecimal string')
      .isLength({ min: SIGN_IN_LINK.TOKEN_HEX_LENGTH, max: SIGN_IN_LINK.TOKEN_HEX_LENGTH })
      .withMessage(`Value must be ${SIGN_IN_LINK.TOKEN_HEX_LENGTH} characters long`),
    handleExpressValidatorResult,
    users.loginWithSignInLink,
  );

/**
 * @openapi
 * /users/:userId/sign-in-otp/:signInOTP/login:
 *    post:
 *      summary: Login with sign in OTP
 *      description: Login a user using a sign in OTP
 *      tags: [Portal]
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: string
 *        - in: path
 *          name: signInOTP
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: Login successful
 *        404:
 *          description: Not found
 *        403:
 *          description: Forbidden
 */
openRouter
  .route('/users/:userId/sign-in-otp/:signInOTP/login')
  .post(
    passport.authenticate(partial2faTokenPassportStrategy, { session: false }),
    param('userId').isMongoId().withMessage('Value must be a valid MongoId'),
    param('signInOTP')
      .isNumeric()
      .withMessage('Value must be a numeric string')
      .isLength({ min: OTP.DIGITS, max: OTP.DIGITS })
      .withMessage(`Value must be ${OTP.DIGITS} characters long`),
    handleExpressValidatorResult,
    users.loginWithOTP,
  );

/**
 * @openapi
 * /users/me/sign-in-link:
 *    post:
 *      summary: Create and email a sign-in link to the user
 *      tags: [Portal]
 *      description: Create and email a sign-in link to the user associated with the provided email address.
 *      responses:
 *        201:
 *          description: Sign-in link created and emailed successfully
 *        403:
 *          description: Forbidden
 *        500:
 *          description: Internal server error
 */
openRouter.route('/users/me/sign-in-link').post(passport.authenticate(partial2faTokenPassportStrategy, { session: false }), users.createAndEmailSignInLink);

/**
 * @openapi
 * /users/me/sign-in-otp:
 *    post:
 *      summary: Create and email a sign-in OTP to the user
 *      tags: [Portal]
 *      description: Create and email a sign-in OTP to the user associated with the provided email address.
 *      responses:
 *        200:
 *          description: Sign-in OTP created and emailed successfully
 *        403:
 *          description: Forbidden
 *        500:
 *          description: Internal server error
 */
openRouter.route('/users/me/sign-in-otp').post(passport.authenticate(partial2faTokenPassportStrategy, { session: false }), users.createAndEmailSignInOTP);

// Auth router requires authentication
const authRouter = express.Router();

// Authentication type: JWT + Passport
authRouter.use(passport.authenticate('login-complete', { session: false }));

/**
 * Mandatory Criteria routes
 * Allow POST to MC HTML tags
 * on non-production environments only
 */

// BSS/EWCS
/**
 * @openapi
 * /mandatory-criteria:
 *    post:
 *      summary: Create a new Mandatory Criteria
 *      tags: [Portal]
 *      description: Create a new Mandatory Criteria. This route is restricted to users with the ADMIN role.
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      responses:
 *        201:
 *          description: Mandatory Criteria created successfully
 *        400:
 *          description: Invalid request body
 *        401:
 *          description: Unauthorized - insertion not allowed in production
 */
authRouter.route('/mandatory-criteria').post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), mandatoryCriteria.create);

// GEF
/**
 * @openapi
 * /gef/mandatory-criteria-versioned:
 *    post:
 *      summary: Create a new GEF Mandatory Criteria Versioned
 *      tags: [Portal]
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      responses:
 *        201:
 *          description: Mandatory Criteria created successfully
 *        400:
 *          description: Invalid request body
 *        401:
 *          description: Unauthorized - insertion not allowed in production
 */
authRouter.route('/gef/mandatory-criteria-versioned').post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), mandatoryCriteriaVersioned.create);

// Mandatory Criteria Routes
/**
 * @openapi
 * /mandatory-criteria:
 *    get:
 *      summary: Retrieve all Mandatory Criteria
 *      tags: [Portal]
 *      description: Retrieve a list of all Mandatory Criteria.
 *      responses:
 *        200:
 *          description: A list of Mandatory Criteria
 */
authRouter.route('/mandatory-criteria').get(mandatoryCriteria.findAll);

/**
 * @openapi
 * /mandatory-criteria/latest:
 *    get:
 *      summary: Retrieve the latest Mandatory Criteria
 *      tags: [Portal]
 *      description: Retrieve the most recent version of the Mandatory Criteria.
 *      responses:
 *        200:
 *          description: The latest Mandatory Criteria
 */
authRouter.route('/mandatory-criteria/latest').get(mandatoryCriteria.findLatest);

/**
 * @openapi
 * /mandatory-criteria/:version:
 *   get:
 *     summary: Retrieve a Mandatory Criteria by version
 *     tags: [Portal]
 *     description: Retrieve a specific version of the Mandatory Criteria by its version number.
 *     parameters:
 *       - in: path
 *         name: version
 *         description: The version number of the Mandatory Criteria to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The Mandatory Criteria with the specified version
 *       404:
 *         description: The Mandatory Criteria with the specified version was not found
 *   delete:
 *        summary: Delete a Mandatory Criteria by version
 *        tags: [Portal]
 *        description: Delete a specific version of the Mandatory Criteria by its version number. This route is restricted to users with the ADMIN role.
 *        parameters:
 *          - in: path
 *            name: version
 *            description: The version number of the Mandatory Criteria to delete.
 *            schema:
 *              type: string
 *        responses:
 *          200:
 *            description: The Mandatory Criteria with the specified version was deleted successfully.
 *          400:
 *            description: Invalid version number
 *          404:
 *            description: The Mandatory Criteria with the specified version was not found.
 */
authRouter
  .route('/mandatory-criteria/:version')
  .get(mandatoryCriteria.findOne)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), mandatoryCriteria.delete);

/**
 * @openapi
 * /users:
 *   get:
 *     summary: List all users
 *     tags: [Portal]
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users
 *   post:
 *     summary: Create a new user
 *     tags: [Portal]
 *     description: Create a new user.
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid user data
 */
authRouter.route('/users').get(users.list).post(users.create);

/**
 * @openapi
 * /users/:_id:
 *   get:
 *     summary: Get user by ID
 *     tags: [Portal]
 *     description: Retrieve a user by their userId
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: The userId of the user to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user with the specified userId
 *       404:
 *         description: The user with the specified userId was not found
 *   put:
 *     summary: Update user by ID
 *     tags: [Portal]
 *     description: Update a user's information by their userId.
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: The userId of the user to update.
 *         schema:
 *           type: string
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                userToUpdate:
 *                  type: object
 *     responses:
 *       200:
 *         description: The user was updated successfully
 *       404:
 *         description: The user with the specified userId was not found
 *       400:
 *         description: Invalid user data
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete user by userId
 *     tags: [Portal]
 *     description: Delete a user by their userId.
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: The userId of the user to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user was deleted successfully
 *       404:
 *         description: The user with the specified ID was not found
 *       400:
 *         description: Invalid user ID
 *       500:
 *         description: Internal server error
 */
authRouter.route('/users/:_id').get(users.findById).put(users.updateById).delete(users.remove);

/**
 * @openapi
 * /users/:_id/disable:
 *   delete:
 *     summary: Disable user by userId
 *     tags: [Portal]
 *     description: Disable a user by their userId.
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: The userId of the user to disable.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The user was disabled successfully
 */
authRouter.route('/users/:_id/disable').delete(users.disable);

authRouter.use('/gef', gef);

/**
 * @openapi
 * /deals:
 *   post:
 *     summary: Create a new deal
 *     tags: [Portal]
 *     description: Create a new deal. This route is restricted to users with the MAKER role.
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                dealToCreate:
 *                  type: object
 *     responses:
 *       200:
 *         description: The deal was created successfully
 *       400:
 *         description: Bad request
 */
authRouter.route('/deals').post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealsController.create);

/**
 * @openapi
 * /deals:
 *   get:
 *     summary: Get all deals
 *     tags: [Portal]
 *     description: Get a list of all deals.
 *     responses:
 *       200:
 *         description: A list of deals
 */
authRouter.route('/deals').get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealsController.getQueryAllDeals);

/**
 * @openapi
 * /deals/:id/status:
 *  get:
 *   summary: Get deal status by ID
 *   tags: [Portal]
 *   description: Retrieve the status of a specific deal by its ID.
 *   parameters:
 *    - in: path
 *      name: id
 *      description: The dealId of the deal to retrieve the status for.
 *      schema:
 *        type: string
 *   responses:
 *    200:
 *      description: The status of the deal with the specified dealId
 *    404:
 *      description: The deal with the specified dealId was not found
 *    401:
 *      description: Unauthorized
 *    500:
 *      description: Internal server error
 *  put:
 *    summary: Update deal status by ID
 *    tags: [Portal]
 *    description: Update the status of a specific deal by its ID. This route is restricted to users with the MAKER or CHECKER role.
 *    parameters:
 *      - in: path
 *        name: id
 *        description: The dealId of the deal to update the status for.
 *        schema:
 *          type: string
 *    requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *    responses:
 *      200:
 *        description: The deal status was updated successfully
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: The deal with the specified dealId was not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/deals/:id/status')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealStatus.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), dealStatus.update);

/**
 * @openapi
 * /deals/:id/submission-details:
 *    get:
 *      summary: Get deal submission details by ID
 *      tags: [Portal]
 *      description: Retrieve the submission details of a specific deal by its ID.
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The dealId of the deal to retrieve the submission details for.
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: The submission details of the deal with the specified dealId
 *        404:
 *          description: The deal with the specified dealId was not found
 *        401:
 *          description: Unauthorized
 *        500:
 *          description: Internal server error
 *    put:
 *      summary: Update deal submission details by ID
 *      tags: [Portal]
 *      description: Update the submission details of a specific deal by its ID. This route is restricted to users with the MAKER role.
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The dealId of the deal to update the submission details for.
 *          schema:
 *            type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                submissionDetails:
 *                  type: object
 *      responses:
 *        200:
 *          description: The submission details were updated successfully
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: The deal with the specified dealId was not found
 *        500:
 *          description: Internal server error
 */
authRouter
  .route('/deals/:id/submission-details')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealSubmissionDetails.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealSubmissionDetails.update);

/**
 * @openapi
 * /deals/:id/additionalRefName:
 *    put:
 *      summary: Update deal additionalRefName by ID
 *      tags: [Portal]
 *      description: Update the additionalRefName of a specific deal by its ID. This route is restricted to users with the MAKER role.
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The dealId of the deal to update the additionalRefName for.
 *          schema:
 *            type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                additionalRefName:
 *                  type: string
 *      responses:
 *        200:
 *          description: The additionalRefName was updated successfully
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: The deal with the specified ID was not found
 *        500:
 *          description: Internal server error
 */
authRouter.route('/deals/:id/additionalRefName').put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealName.update);

/**
 * @openapi
 * /deals/:id/loan/create:
 *   put:
 *     summary: Create a new loan for a specific deal
 *     tags: [Portal]
 *     description: Create a new loan for a deal by dealId. This route is restricted to users with the MAKER role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The dealId for the deal to create the loan for.
 *         schema:
 *           type: string
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *     responses:
 *       200:
 *         description: The loan was created successfully
 *       400:
 *         description: Invalid id provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The deal with the specified dealId was not found
 */
authRouter.route('/deals/:id/loan/create').put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), loans.create);

/**
 * @openapi
 * /deals/:id/loan/:loanId:
 *   get:
 *     summary: Get loan by ID
 *     tags: [Portal]
 *     description: Retrieve a specific loan by its ID for a given deal.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The dealId of the deal to retrieve the loan for.
 *         schema:
 *           type: string
 *       - in: path
 *         name: loanId
 *         description: The loanId of the loan to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The loan was retrieved successfully
 *       400:
 *         description: Invalid id or loanId provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The loan with the specified ID was not found
 *   put:
 *     summary: Update loan by ID
 *     tags: [Portal]
 *     description: Update a specific loan by its ID for a given deal. This route is restricted to users with the MAKER role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The dealId of the deal to update the loan for.
 *         schema:
 *           type: string
 *       - in: path
 *         name: loanId
 *         description: The loanId of the loan to update.
 *         schema:
 *           type: string
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *     responses:
 *       200:
 *         description: The loan was updated successfully
 *       400:
 *         description: Invalid id or loanId provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The loan with the specified ID was not found
 *   delete:
 *     summary: Delete loan by ID
 *     tags: [Portal]
 *     description: Delete a specific loan by its ID for a given deal. This route is restricted to users with the MAKER role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The dealId of the deal to delete the loan for.
 *         schema:
 *           type: string
 *       - in: path
 *         name: loanId
 *         description: The loanId of the loan to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The loan was deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The loan with the specified ID was not found
 */
authRouter
  .route('/deals/:id/loan/:loanId')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, READ_ONLY, ADMIN] }), loans.getLoan)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), loans.updateLoan)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), loans.deleteLoan);

/**
 * @openapi
 * /deals/:id/loan/:loanId/issue-facility:
 *    put:
 *      summary: Issue loan facility
 *      tags: [Portal]
 *      description: Issue a loan facility for a specific loan within a deal. This route is restricted to users with the MAKER role.
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The dealId of the deal containing the loan.
 *          schema:
 *          type: string
 *        - in: path
 *          name: loanId
 *          description: The loanId of the loan to issue the facility for.
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: The loan facility was issued successfully
 *        400:
 *          description: Invalid id or loanId provided
 *        401:
 *          description: Unauthorized
 *        403:
 *          description: Can't issue facility
 *        404:
 *          description: The loan with the specified loanId was not found
 */
authRouter
  .route('/deals/:id/loan/:loanId/issue-facility')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), loanIssueFacility.updateLoanIssueFacility);

/**
 * @openapi
 * /deals/:id/loan/:loanId/change-cover-start-date:
 *    put:
 *      summary: Change loan cover start date
 *      tags: [Portal]
 *      description: Change the cover start date for a loan. This route is restricted to users with the MAKER role.
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The dealId of the deal containing the loan.
 *          schema:
 *            type: string
 *        - in: path
 *          name: loanId
 *          description: The loanId of the loan to change the cover start date for.
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: The loan cover start date was changed successfully
 *        400:
 *          description: Invalid id or loanId provided
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: The loan with the specified loanId was not found
 */
authRouter
  .route('/deals/:id/loan/:loanId/change-cover-start-date')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), loanChangeCoverStartDate.updateLoanCoverStartDate);

/**
 * @openapi
 * /deals/:id/bond/create:
 *    put:
 *      summary: Create a new bond for a specific deal
 *      tags: [Portal]
 *      description: Create a new bond for a deal by dealId. This route is restricted to users with the MAKER role.
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The dealId for the deal to create the bond for.
 *          schema:
 *            type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      responses:
 *        200:
 *          description: The bond was created successfully
 *        400:
 *          description: Invalid id provided
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: The bond with the specified bondId was not found
 */
authRouter.route('/deals/:id/bond/create').put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), bonds.create);

/**
 * @openapi
 * /deals/:id/bond/:bondId:
 *   get:
 *     summary: Get bond by ID
 *     tags: [Portal]
 *     description: Retrieve a specific bond by its ID for a given deal.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The dealId of the deal to retrieve the bond for.
 *         schema:
 *           type: string
 *       - in: path
 *         name: bondId
 *         description: The bondId of the bond to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *        description: The bond was retrieved successfully
 *      400:
 *        description: Invalid id or bondId provided
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: The bond with the specified ID was not found
 *   put:
 *     summary: Update bond by ID
 *     tags: [Portal]
 *     description: Update a specific bond by its ID for a given deal. This route is restricted to users with the MAKER role.
 *     parameters:
 *      - in: path
 *        name: id
 *        description: The dealId of the deal to update the bond for.
 *        schema:
 *         type: string
 *      - in: path
 *        name: bondId
 *        description: The bondId of the bond to update.
 *        schema:
 *         type: string
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *     responses:
 *       200:
 *         description: The bond was updated successfully
 *       400:
 *         description: Invalid id or bondId provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The bond with the specified bondId was not found
 *   delete:
 *     summary: Delete bond by ID
 *     tags: [Portal]
 *     description: Delete a specific bond by its ID for a given deal. This route is restricted to users with the MAKER role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The dealId of the deal to delete the bond for.
 *         schema:
 *           type: string
 *       - in: path
 *         name: bondId
 *         description: The bondId of the bond to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The bond was deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The bond with the specified bondId was not found
 */
authRouter
  .route('/deals/:id/bond/:bondId')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, READ_ONLY, ADMIN] }), bonds.getBond)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), bonds.updateBond)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), bonds.deleteBond);

/**
 * @openapi
 * /deals/:id/bond/:bondId/issue-facility:
 *    put:
 *      summary: Issue bond facility
 *      tags: [Portal]
 *      description: Issue a bond facility. This route is restricted to users with the MAKER role.
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The dealId of the deal containing the bond.
 *          schema:
 *            type: string
 *        - in: path
 *          name: bondId
 *          description: The bondId of the bond to issue the facility for.
 *          schema:
 *            type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      responses:
 *        200:
 *          description: The bond facility was issued successfully
 *        400:
 *          description: Invalid id or bondId provided
 *        401:
 *          description: Unauthorized
 *        403:
 *          description: Can't issue facility
 *        404:
 *          description: The bond with the specified bondId was not found
 */
authRouter
  .route('/deals/:id/bond/:bondId/issue-facility')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), bondIssueFacility.updateBondIssueFacility);

/**
 * @openapi
 * /deals/:id/bond/:bondId/change-cover-start-date:
 *    put:
 *      summary: Change bond cover start date
 *      tags: [Portal]
 *      description: Change the cover start date for a bond. This route is restricted to users with the MAKER role.
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The dealId of the deal containing the bond.
 *          schema:
 *            type: string
 *        - in: path
 *          name: bondId
 *          description: The bondId of the bond to change the cover start date for.
 *          schema:
 *            type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *      responses:
 *        200:
 *          description: The bond cover start date was changed successfully
 *        400:
 *          description: Invalid id or bondId provided
 *        401:
 *          description: Unauthorized
 *        404:
 *          description: The bond with the specified bondId was not found
 */
authRouter
  .route('/deals/:id/bond/:bondId/change-cover-start-date')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), bondChangeCoverStartDate.updateBondCoverStartDate);

/**
 * @openapi
 * /deals/:id/multiple-facilities:
 *    post:
 *      summary: Create multiple facilities for a specific deal
 *      tags: [Portal]
 *      description: Create multiple facilities for a deal by dealId. This route is restricted to users with the MAKER role.
 *      parameters:
 *        - in: path
 *          name: id
 *          description: The dealId for the deal to create the facilities for.
 *          schema:
 *            type: string
 *      requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                facilities:
 *                  type: object
 *                dealId:
 *                  type: string
 *      responses:
 *        200:
 *          description: Facilities created successfully
 */
authRouter.route('/deals/:id/multiple-facilities').post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilitiesController.createMultiple);

/**
 * @openapi
 * /facilities:
 *   get:
 *     summary: Get all facilities
 *     tags: [Portal]
 *     description: Get a list of all facilities.
 *     responses:
 *       200:
 *         description: A list of facilities
 */
authRouter
  .route('/facilities')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), facilitiesController.getQueryAllFacilities);

/**
 * @openapi
 * /deals/:id:
 *   get:
 *     summary: Get deal by ID
 *     tags: [Portal]
 *     description: Retrieve a specific deal by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the deal to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The deal was retrieved successfully
 *       400:
 *         description: Invalid ID provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The deal with the specified ID was not found
 *   put:
 *     summary: Update deal by ID
 *     tags: [Portal]
 *     description: Update a specific deal by its ID. This route is restricted to users with the MAKER role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the deal to update.
 *         schema:
 *           type: string
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                dealToUpdate:
 *                  type: object
 *     responses:
 *       200:
 *         description: The deal was updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The deal with the specified ID was not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete deal by ID
 *     tags: [Portal]
 *     description: Delete a specific deal by its ID. This route is restricted to users with the ADMIN role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the deal to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The deal was deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The deal with the specified ID was not found
 */
authRouter
  .route('/deals/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealsController.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealsController.update)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), isProductionValidation(), dealsController.delete);

/**
 * @openapi
 * /deals/:id/clone:
 *   post:
 *     summary: Clone deal by ID
 *     tags: [Portal]
 *     description: Clone a specific deal by its ID. This route is restricted to users with the MAKER role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the deal to clone.
 *         schema:
 *           type: string
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *     responses:
 *       200:
 *         description: The deal was cloned successfully
 *       400:
 *         description: Invalid ID provided
 *       404:
 *         description: The deal with the specified ID was not found
 */
authRouter.route('/deals/:id/clone').post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealClone.clone);

/**
 * @openapi
 * /deals/:id/eligibility-criteria:
 *   put:
 *     summary: Update deal eligibility criteria by ID
 *     tags: [Portal]
 *     description: Update the eligibility criteria of a specific deal by its ID. This route is restricted to users with the MAKER role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The unique ID of the deal to update the eligibility criteria for.
 *         schema:
 *           type: string
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                eligibilityCriteria:
 *                  type: object
 *     responses:
 *       200:
 *         description: The eligibility criteria were updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The deal with the specified ID was not found
 */
authRouter.route('/deals/:id/eligibility-criteria').put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealEligibilityCriteria.update);

/**
 * @openapi
 * /deals/:id/eligibility-documentation:
 *   put:
 *     summary: Update deal eligibility documentation by ID
 *     tags: [Portal]
 *     description: Update the eligibility documentation of a specific deal by its ID. This route is restricted to users with the MAKER role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The unique ID of the deal to update the eligibility documentation for.
 *         schema:
 *           type: string
 *       - in: formData
 *         name: files
 *         description: The files to upload for the eligibility documentation.
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *     responses:
 *       200:
 *         description: The eligibility documentation was updated successfully
 *       400:
 *         description: Bad request
 */
authRouter.route('/deals/:id/eligibility-documentation').put(
  validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }),
  (req, res, next) => {
    fileUpload(req, res, (error) => {
      if (!error) {
        return next();
      }
      console.error('Unable to upload file %o', error);
      return res.status(HttpStatusCode.BadRequest).json({ status: HttpStatusCode.BadRequest, data: 'Failed to upload file' });
    });
  },
  dealEligibilityDocumentation.update,
);

/**
 * @openapi
 * /deals/:id/eligibility-documentation/:fieldname/:filename:
 *   get:
 *     summary: Download deal eligibility documentation file by fieldname and filename
 *     tags: [Portal]
 *     description: Download a specific eligibility documentation file for a deal by its fieldname and filename.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The dealId to download the eligibility documentation file for.
 *         schema:
 *           type: string
 *       - in: path
 *         name: fieldname
 *         description: The fieldname of the eligibility documentation file to download.
 *         schema:
 *           type: string
 *       - in: path
 *         name: filename
 *         description: The filename of the eligibility documentation file to download.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The eligibility documentation file was downloaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: The deal with the specified ID was not found
 */
authRouter
  .route('/deals/:id/eligibility-documentation/:fieldname/:filename')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealEligibilityDocumentation.downloadFile);

/**
 * @openapi
 * /banks:
 *   get:
 *     summary: Get all banks
 *     tags: [Portal]
 *     description: Get a list of all banks.
 *     responses:
 *       200:
 *         description: A list of banks
 *   post:
 *     summary: Create a new bank
 *     tags: [Portal]
 *     description: Create a new bank.
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                bank:
 *                  type: object
 *     responses:
 *       200:
 *         description: The bank was created successfully
 *       400:
 *         description: Bad request
 */
authRouter
  .route('/banks')
  .get(banks.findAll)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), banks.create);

/**
 * @openapi
 * /banks/:id:
 *   get:
 *     summary: Get bank by ID
 *     tags: [Portal]
 *     description: Retrieve a specific bank by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the bank to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The bank was retrieved successfully
 *   put:
 *     summary: Update bank by ID
 *     tags: [Portal]
 *     description: Update a specific bank by its ID. This route is restricted to users with the ADMIN role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the bank to update.
 *         schema:
 *           type: string
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *     responses:
 *       200:
 *         description: The bank was updated successfully
 *       400:
 *         description: Bad request
 *   delete:
 *     summary: Delete bank by ID
 *     tags: [Portal]
 *     description: Delete a specific bank by its ID. This route is restricted to users with the ADMIN role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the bank to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The bank was deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: The bank with the specified ID was not found
 *       500:
 *         description: Internal server error
 */
authRouter
  .route('/banks/:id')
  .get(banks.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), banks.update)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), banks.delete);

/**
 * @openapi
 * /currencies:
 *   get:
 *     summary: Get all currencies
 *     tags: [Portal]
 *     description: Get a list of all currencies.
 *     responses:
 *       200:
 *         description: A list of currencies
 */
authRouter.route('/currencies').get(currencies.findAll);

/**
 * @openapi
 * /currencies/:id:
 *   get:
 *     summary: Get currency by ID
 *     tags: [Portal]
 *     description: Retrieve a specific currency by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the currency to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The currency was retrieved successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: The currency with the specified ID was not found
 *       500:
 *         description: Internal server error
 */
authRouter.route('/currencies/:id').get(currencies.findOne);

/**
 * @openapi
 * /countries:
 *   get:
 *     summary: Get all countries
 *     tags: [Portal]
 *     description: Get a list of all countries.
 *     responses:
 *       200:
 *         description: A list of countries
 *       400:
 *         description: No countries found
 *       500:
 *         description: Internal server error
 */
authRouter.route('/countries').get(countries.findAll);

/**
 * @openapi
 * /countries/:code:
 *   get:
 *     summary: Get country by code
 *     tags: [Portal]
 *     description: Retrieve a specific country by its code.
 *     parameters:
 *       - in: path
 *         name: code
 *         description: The code of the country to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The country was retrieved successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: The country with the specified code was not found
 *       500:
 *         description: Internal server error
 */
authRouter.route('/countries/:code').get(countries.findOne);

/**
 * @openapi
 * /feedback:
 *   get:
 *     summary: Get all feedback
 *     tags: [Portal]
 *     description: Get a list of all feedback. This route is restricted to users with the ADMIN role.
 *     responses:
 *       200:
 *         description: A list of feedback
 */
authRouter.route('/feedback').get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), feedback.findAll);

/**
 * @openapi
 * /feedback/:id:
 *   get:
 *     summary: Get feedback by ID
 *     tags: [Portal]
 *     description: Retrieve a specific feedback by its ID. This route is restricted to users with the ADMIN role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the feedback to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The feedback was retrieved successfully
 *       404:
 *         description: The feedback with the specified ID was not found
 *   delete:
 *     summary: Delete feedback by ID
 *     tags: [Portal]
 *     description: Delete a specific feedback by its ID. This route is restricted to users with the ADMIN role.
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the feedback to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The feedback was deleted successfully
 *       404:
 *         description: The feedback with the specified ID was not found
 *       500:
 *         description: Internal server error
 */
authRouter
  .route('/feedback/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), feedback.findOne)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), feedback.delete);

/**
 * @openapi
 * /industry-sectors:
 *   get:
 *     summary: Get all industry sectors
 *     tags: [Portal]
 *     description: Get a list of all industry sectors.
 *     responses:
 *       200:
 *         description: A list of industry sectors
 *       400:
 *         description: Bad request
 *       404:
 *         description: No industry sectors found
 *       500:
 *         description: Internal server error
 */
authRouter.route('/industry-sectors').get(industrySectors.findAll);

/**
 * @openapi
 * /industry-sectors/:code:
 *   get:
 *     summary: Get industry sector by code
 *     tags: [Portal]
 *     description: Retrieve a specific industry sector by its code.
 *     parameters:
 *       - in: path
 *         name: code
 *         description: The code of the industry sector to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The industry sector was retrieved successfully
 *       404:
 *         description: The industry sector with the specified code was not found
 *       500:
 *         description: Internal server error
 */
authRouter.route('/industry-sectors/:code').get(industrySectors.findOne);

/**
 * @openapi
 * /eligibility-criteria:
 *  get:
 *    summary: Get all eligibility criteria
 *    tags: [Portal]
 *    description: Get a list of all eligibility criteria
 *    responses:
 *      200:
 *        description: A list of eligibility criteria
 *  post:
 *    summary: Create new eligibility criteria
 *    tags: [Portal]
 *    description: Create new eligibility criteria. This route is restricted to users with the ADMIN role.
 *    requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *    responses:
 *      200:
 *        description: The eligibility criteria were created successfully
 *      400:
 *        description: Bad request
 */
authRouter
  .route('/eligibility-criteria')
  .get(eligibilityCriteria.findAll)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), eligibilityCriteria.create);

/**
 * @openapi
 * /eligibility-criteria/latest:
 *  get:
 *    summary: Get the latest eligibility criteria
 *    tags: [Portal]
 *    description: Get the latest eligibility criteria
 *    responses:
 *      200:
 *        description: The latest eligibility criteria
 */
authRouter.route('/eligibility-criteria/latest').get(eligibilityCriteria.findLatestGET);

/**
 * @openapi
 * /eligibility-criteria/:version:
 *   get:
 *     summary: Get eligibility criteria by version
 *     tags: [Portal]
 *     description: Retrieve a specific eligibility criteria by its version.
 *     parameters:
 *       - in: path
 *         name: version
 *         description: The version of the eligibility criteria to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *      200:
 *         description: The eligibility criteria was retrieved successfully
 *   put:
 *     summary: Update eligibility criteria by version
 *     tags: [Portal]
 *     description: Update a specific eligibility criteria by its version. This route is restricted to users with the ADMIN role.
 *     parameters:
 *       - in: path
 *         name: version
 *         description: The version of the eligibility criteria to update.
 *         schema:
 *           type: string
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *     responses:
 *       200:
 *        description: The eligibility criteria were updated successfully
 *       400:
 *        description: Bad request
 *   delete:
 *     summary: Delete eligibility criteria by version
 *     tags: [Portal]
 *     description: Delete a specific eligibility criteria by its version. This route is restricted to users with the ADMIN role.
 *     parameters:
 *       - in: path
 *         name: version
 *         description: The version of the eligibility criteria to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The eligibility criteria were deleted successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: The eligibility criteria with the specified version was not found
 *       500:
 *         description: Internal server error
 */
authRouter
  .route('/eligibility-criteria/:version')
  .get(eligibilityCriteria.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), eligibilityCriteria.update)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), eligibilityCriteria.delete);

// Portal reports
/**
 * @openapi
 * /reports/unissued-facilities:
 *  get:
 *    summary: Get reports unissued facilities
 *    tags: [Portal]
 *    description: Get a report of all unissued facilities
 *    responses:
 *     200:
 *       description: A report of unissued facilities
 */
authRouter
  .route('/reports/unissued-facilities')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), unissuedFacilitiesReport.findUnissuedFacilitiesReports);

/**
 * @openapi
 * /reports/review-ukef-decision:
 *  get:
 *    summary: Get ukefDecision reports for deals approved with or without conditions
 *    tags: [Portal]
 *    description: Get a report of all deals that have been approved with or without conditions
 *    responses:
 *      200:
 *        description: A report of ukefDecision deals
 */
authRouter
  .route('/reports/review-ukef-decision')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), ukefDecisionReport.reviewUkefDecisionReports);

// token-validator
/**
 * @openapi
 * /validate:
 *  get:
 *    summary: Validate JWT token
 *    tags: [Portal]
 *    description: Validate a JWT token to confirm authentication.
 *    responses:
 *      200:
 *        description: Token is valid
 */
authRouter.get('/validate', (_req, res) => res.status(HttpStatusCode.Ok).send());

/**
 * @openapi
 * /validate-partial-2fa-token:
 *  get:
 *    summary: Validate partial 2FA token
 *    tags: [Portal]
 *    description: Validate a partial 2FA token to confirm authentication.
 *    responses:
 *      200:
 *        description: Token is valid
 */
openRouter.get('/validate-partial-2fa-token', passport.authenticate(partial2faTokenPassportStrategy, { session: false }), (_req, res) =>
  res.status(HttpStatusCode.Ok).send(),
);

// bank-validator
/**
 * @openapi
 * /validate/bank:
 *  get:
 *    summary: Validate bank
 *    tags: [Portal]
 *    description: Validate a bank against the deal
 *    responses:
 *      200:
 *        description: Bank is valid
 *      400:
 *        description: Bad request
 *      404:
 *        description: Bank not found
 */
authRouter.get('/validate/bank', (req, res) => banks.validateBank(req, res));

// utilisation report service
/**
 * @openapi
 * /utilisation-reports:
 *  post:
 *    summary: Upload utilisation report
 *    tags: [Portal]
 *    description: Upload a utilisation report. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: formData
 *        name: file
 *        description: The utilisation report file to upload.
 *        schema:
 *          type: string
 *          format: binary
 *    responses:
 *      200:
 *        description: The utilisation report was uploaded successfully
 *      400:
 *        description: Bad request
 */
authRouter.route('/utilisation-reports').post(
  validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
  (req, res, next) => {
    utilisationReportFileUpload(req, res, (error) => {
      if (!error) {
        return next();
      }
      console.error('Unable to upload file %o', error);
      return res.status(HttpStatusCode.BadRequest).json({ status: HttpStatusCode.BadRequest, data: 'Failed to upload file' });
    });
  },
  utilisationReportControllers.uploadReportAndSendNotification,
);

/**
 * @openapi
 * /banks/:bankId/utilisation-reports:
 *  get:
 *    summary: Get previous utilisation reports by bank ID
 *    tags: [Portal]
 *    description: Get a list of previous utilisation reports for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to retrieve utilisation reports for.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: A list of previous utilisation reports for the specified bank.
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/utilisation-reports')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
    utilisationReportControllers.getPreviousReportsByBankId,
  );

/**
 * @openapi
 * /banks/:bankId/utilisation-reports/report-data-validation:
 *  post:
 *    summary: Validate utilisation report data
 *    tags: [Portal]
 *    description: Validate the data of an uploaded utilisation report for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to validate the utilisation report data for.
 *        schema:
 *          type: string
 *    requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                reportData:
 *                  type: object
 *    responses:
 *      200:
 *        description: The utilisation report data was validated successfully
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/utilisation-reports/report-data-validation')
  .post(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
    utilisationReportControllers.validateUtilisationReportData,
  );

/**
 * @openapi
 * /banks/:bankId/utilisation-reports/pending-corrections:
 *  get:
 *    summary: Get utilisation reports with pending corrections by bank ID
 *    tags: [Portal]
 *    description: Get a list of utilisation reports with pending corrections for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to retrieve utilisation reports with pending corrections for.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: A list of utilisation reports with pending corrections for the specified bank.
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/utilisation-reports/pending-corrections')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
    utilisationReportControllers.getUtilisationReportPendingCorrectionsByBankId,
  );

/**
 * @openapi
 * /banks/:bankId/utilisation-reports/last-uploaded:
 *  get:
 *    summary: Get the last uploaded utilisation report by bank ID
 *    tags: [Portal]
 *    description: Get the most recent utilisation report uploaded for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to retrieve the last uploaded utilisation report for.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The most recent utilisation report for the specified bank.
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/utilisation-reports/last-uploaded')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
    utilisationReportControllers.getLastUploadedReportByBankId,
  );

/**
 * @openapi
 * /banks/:bankId/due-report-periods:
 *  get:
 *    summary: Get due report periods by bank ID
 *    tags: [Portal]
 *    description: Get a list of due report periods for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to retrieve due report periods for.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: A list of due report periods for the specified bank.
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/due-report-periods')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
    utilisationReportControllers.getDueReportPeriodsByBankId,
  );

/**
 * @openapi
 * /banks/:bankId/next-report-period:
 *  get:
 *    summary: Get the next report period by bank ID
 *    tags: [Portal]
 *    description: Get the next report period for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to retrieve the next report period for.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The next report period for the specified bank.
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/next-report-period')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
    utilisationReportControllers.getNextReportPeriodByBankId,
  );

/**
 * @openapi
 * /banks/:bankId/utilisation-report-download/:id:
 *  get:
 *    summary: Download utilisation report by ID
 *    tags: [Portal]
 *    description: Download a specific utilisation report by its ID for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to download the utilisation report for.
 *        schema:
 *          type: string
 *      - in: path
 *        name: id
 *        description: The ID of the utilisation report to download.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The utilisation report was downloaded successfully
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/utilisation-report-download/:id')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    sqlIdValidation('id'),
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
    utilisationReportControllers.getReportDownload,
  );

/**
 * @openapi
 * /bank-holidays:
 *  get:
 *    summary: Get bank holidays
 *    tags: [Portal]
 *    description: Get a list of bank holidays.
 *    responses:
 *      200:
 *        description: A list of bank holidays
 *      500:
 *        description: Internal server error
 */
authRouter.route('/bank-holidays').get(getBankHolidays);

/**
 * @openapi
 * /companies/:registrationNumber:
 *  get:
 *    summary: Get company by registration number
 *    tags: [Portal]
 *    description: Retrieve a specific company by its registration number. This route is restricted to users with the MAKER role.
 *    parameters:
 *      - in: path
 *        name: registrationNumber
 *        description: The registration number of the company to retrieve.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The company was retrieved successfully
 *      400:
 *        description: Bad request
 *      404:
 *        description: The company with the specified registration number was not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/companies/:registrationNumber')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), companies.getCompanyByRegistrationNumber);

/**
 * @openapi
 * /banks/:bankId/fee-record-correction/:correctionId:
 *  get:
 *    summary: Get fee record correction by ID
 *    tags: [Portal]
 *    description: Retrieve a specific fee record correction by its ID for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to retrieve the fee record correction for.
 *        schema:
 *          type: string
 *      - in: path
 *        name: correctionId
 *        description: The ID of the fee record correction to retrieve.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The fee record correction was retrieved successfully
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 *  put:
 *    summary: Submits fee record correction by ID
 *    tags: [Portal]
 *    description: Submit a specific fee record correction by its ID for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to submit the fee record correction for.
 *        schema:
 *          type: string
 *      - in: path
 *        name: correctionId
 *        description: The ID of the fee record correction to submit.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The fee record correction was submitted successfully
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/fee-record-correction/:correctionId')
  .all(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    sqlIdValidation('correctionId'),
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
  )
  .get(utilisationReportControllers.getFeeRecordCorrection)
  .put(utilisationReportControllers.saveFeeRecordCorrection);

/**
 * @openapi
 * /banks/:bankId/fee-record-correction/:correctionId/transient-form-data:
 *  get:
 *     summary: Get fee record correction transient form data
 *     tags: [Portal]
 *     description: Get transient form data for a specific fee record correction by its ID for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *     parameters:
 *      - in: path
 *        name: bankId
 *
 *        description: The ID of the bank to get the fee record correction transient form data for.
 *        schema:
 *          type: string
 *      - in: path
 *        name: correctionId
 *
 *        description: The ID of the fee record correction to get the transient form data for.
 *        schema:
 *          type: string
 *     responses:
 *      200:
 *        description: The transient form data was retrieved successfully
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 *  put:
 *     summary: Update fee record correction transient form data
 *     tags: [Portal]
 *     description: Update transient form data for a specific fee record correction by its ID for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *     parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to update the fee record correction transient form data for.
 *        schema:
 *          type: string
 *      - in: path
 *        name: correctionId
 *        description: The ID of the fee record correction to update the transient form data for.
 *        schema:
 *          type: string
 *     requestBody:
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                formData:
 *                  type: object
 *     responses:
 *      200:
 *        description: The transient form data was updated successfully
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 *  delete:
 *     summary: Delete fee record correction transient form data
 *     tags: [Portal]
 *     description: Delete transient form data for a specific fee record correction by its ID for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *     parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to delete the fee record correction transient form data for.
 *        schema:
 *          type: string
 *      - in: path
 *        name: correctionId
 *        description: The ID of the fee record correction to delete the transient form data for.
 *        schema:
 *          type: string
 *     responses:
 *      200:
 *        description: The transient form data was deleted successfully
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/fee-record-correction/:correctionId/transient-form-data')
  .all(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    sqlIdValidation('correctionId'),
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
  )
  .get(utilisationReportControllers.getFeeRecordCorrectionTransientFormData)
  .put(utilisationReportControllers.putFeeRecordCorrectionTransientFormData)
  .delete(utilisationReportControllers.deleteFeeRecordCorrectionTransientFormData);

/**
 * @openapi
 * /banks/:bankId/fee-record-correction-review/:correctionId/user/:userId:
 *  get:
 *    summary: Get fee record correction review by ID
 *    tags: [Portal]
 *    description: Retrieve a specific fee record correction review by its ID and user ID for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to retrieve the fee record correction review for.
 *        schema:
 *          type: string
 *      - in: path
 *        name: correctionId
 *        description: The ID of the fee record correction review to retrieve.
 *        schema:
 *          type: string
 *      - in: path
 *        name: userId
 *        description: The ID of the user to retrieve the fee record correction review for.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The fee record correction review was retrieved successfully
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/fee-record-correction-review/:correctionId/user/:userId')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    sqlIdValidation('correctionId'),
    mongoIdValidation('userId'),
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
    utilisationReportControllers.getFeeRecordCorrectionReview,
  );

/**
 * @openapi
 * /banks/:bankId/utilisation-reports/completed-corrections:
 *  get:
 *    summary: Get utilisation reports with completed corrections by bank ID
 *    tags: [Portal]
 *    description: Get a list of utilisation reports with completed corrections for a specific bank by bank ID. This route is restricted to users with the PAYMENT_REPORT_OFFICER role.
 *    parameters:
 *      - in: path
 *        name: bankId
 *        description: The ID of the bank to retrieve utilisation reports with completed corrections for.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: A list of utilisation reports with completed corrections for the specified bank.
 *      400:
 *        description: Bad request
 *      401:
 *        description: Unauthorized
 *      404:
 *        description: Not found
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/banks/:bankId/utilisation-reports/completed-corrections')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    handleExpressValidatorResult,
    validateUserAndBankIdMatch,
    utilisationReportControllers.getCompletedFeeRecordCorrections,
  );

/**
 * @openapi
 * /tfm/team/:teamId:
 *  get:
 *    summary: Get TFM team by team ID
 *    tags: [Portal - TFM]
 *    description: Retrieve a specific TFM team by its team ID.
 *    parameters:
 *      - in: path
 *        name: teamId
 *        description: The ID of the TFM team to retrieve.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The TFM team was retrieved successfully.
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal server error
 */
authRouter.route('/tfm/team/:teamId').get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), handleExpressValidatorResult, tfm.tfmTeam);

/**
 * @openapi
 * /tfm/deal/:dealId:
 *  get:
 *    summary: Get TFM deal by deal ID
 *    tags: [Portal - TFM]
 *    description: Retrieve a specific TFM deal by its deal ID.
 *    parameters:
 *      - in: path
 *        name: dealId
 *        description: The ID of the TFM deal to retrieve.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The TFM deal was retrieved successfully.
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/tfm/deal/:dealId')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), mongoIdValidation('dealId'), handleExpressValidatorResult, tfm.tfmDeal);

/**
 * @openapi
 * /tfm/facility/:facilityId:
 *  get:
 *    summary: Get TFM facility by facility ID
 *    tags: [Portal - TFM]
 *    description: Retrieve a specific TFM facility by its facility ID.
 *    parameters:
 *      - in: path
 *        name: facilityId
 *        description: The ID of the TFM facility to retrieve.
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: The TFM facility was retrieved successfully.
 *      400:
 *        description: Bad request
 *      500:
 *        description: Internal server error
 */
authRouter
  .route('/tfm/facility/:facilityId')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }),
    mongoIdValidation('facilityId'),
    handleExpressValidatorResult,
    tfm.tfmFacility,
  );

module.exports = { openRouter, authRouter };
