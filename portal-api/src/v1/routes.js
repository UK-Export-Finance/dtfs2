const express = require('express');
const passport = require('passport');

const { validateUserHasAtLeastOneAllowedRole } = require('./roles/validate-user-has-at-least-one-allowed-role');
const { validateUserAndBankIdMatch } = require('./validation/validate-user-and-bank-id-match');
const { bankIdValidation } = require('./validation/route-validators/route-validators');
const handleValidationResult = require('./validation/route-validators/validation-handler');
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
const eligibilityCriteria = require('./controllers/eligibilityCriteria.controller');
const loans = require('./controllers/loans.controller');
const loanIssueFacility = require('./controllers/loan-issue-facility.controller');
const bonds = require('./controllers/bonds.controller');
const facilitiesController = require('./controllers/facilities.controller');
const bondIssueFacility = require('./controllers/bond-issue-facility.controller');
const bondChangeCoverStartDate = require('./controllers/bond-change-cover-start-date.controller');
const loanChangeCoverStartDate = require('./controllers/loan-change-cover-start-date.controller');
const { ukefDecisionReport, unissuedFacilitiesReport } = require('./controllers/reports');
const { getPreviousReportsByBankId, uploadReportAndSendNotification, getDueReportDates, getLatestReport } = require('./controllers/utilisation-report-service');
const { getBankHolidays } = require('./controllers/bank-holidays.controller');

const { cleanXss, fileUpload } = require('./middleware');
const checkApiKey = require('./middleware/headers/check-api-key');

const users = require('./users/routes');
const gef = require('./gef/routes');

const partial2faTokenPassportStrategy = 'login-in-progress';

// Open router requires no authentication
const openRouter = express.Router();

// Login route
openRouter.route('/login').post(users.login);

// 1. Request password reset
openRouter.route('/users/reset-password').post(users.resetPassword);

// 2. Password reset post request
openRouter.route('/users/reset-password/:resetPwdToken').post(users.resetPasswordWithToken);

// API Key Routes
openRouter.route('/feedback').post(checkApiKey, feedback.create);
// This endpoint is only used by mock-data-loader, for setting up an initial user
openRouter.route('/user').post(checkApiKey, users.create);

openRouter.route('/users/me/sign-in-link').post(
  passport.authenticate(partial2faTokenPassportStrategy, { session: false }),
  users.createAndEmailSignInLink
);

openRouter
  .route('/users/me/sign-in-link/:signInToken/login')
  .post(passport.authenticate(partial2faTokenPassportStrategy, { session: false }), users.loginWithSignInLink);

// Auth router requires authentication
const authRouter = express.Router();

// Authentication type: JWT + Passport
authRouter.use(passport.authenticate('login-complete', { session: false }));

/**
 * Mandatory Criteria routes
 * Allow POST & PUT of MC HTML tags
 * on non-production environments only
 */
authRouter.route('/mandatory-criteria').post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), mandatoryCriteria.create);

authRouter.route('/mandatory-criteria/:version').put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), mandatoryCriteria.update);

// Enable XSS
authRouter.use(cleanXss);

// Mandatory Criteria Routes
authRouter.route('/mandatory-criteria').get(mandatoryCriteria.findAll);

authRouter.route('/mandatory-criteria/latest').get(mandatoryCriteria.findLatest);

authRouter
  .route('/mandatory-criteria/:version')
  .get(mandatoryCriteria.findOne)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), mandatoryCriteria.delete);

authRouter.route('/users').get(users.list).post(users.create);
authRouter.route('/users/:_id').get(users.findById).put(users.updateById).delete(users.remove);
authRouter.route('/users/:_id/disable').delete(users.disable);

authRouter.use('/gef', gef);

authRouter.route('/deals').post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealsController.create);
authRouter
  .route('/deals')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealsController.getQueryAllDeals);

authRouter
  .route('/deals/:id/status')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealStatus.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER] }), dealStatus.update);

authRouter
  .route('/deals/:id/submission-details')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealSubmissionDetails.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealSubmissionDetails.update);

authRouter.route('/deals/:id/additionalRefName').put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealName.update);
authRouter.route('/deals/:id/loan/create').put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), loans.create);

authRouter
  .route('/deals/:id/loan/:loanId')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, READ_ONLY, ADMIN] }), loans.getLoan)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), loans.updateLoan)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), loans.deleteLoan);

authRouter
  .route('/deals/:id/loan/:loanId/issue-facility')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), loanIssueFacility.updateLoanIssueFacility);
authRouter
  .route('/deals/:id/loan/:loanId/change-cover-start-date')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), loanChangeCoverStartDate.updateLoanCoverStartDate);
authRouter.route('/deals/:id/bond/create').put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), bonds.create);

authRouter
  .route('/deals/:id/bond/:bondId')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, READ_ONLY, ADMIN] }), bonds.getBond)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), bonds.updateBond)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), bonds.deleteBond);

authRouter
  .route('/deals/:id/bond/:bondId/issue-facility')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), bondIssueFacility.updateBondIssueFacility);
authRouter
  .route('/deals/:id/bond/:bondId/change-cover-start-date')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), bondChangeCoverStartDate.updateBondCoverStartDate);
authRouter
  .route('/deals/:id/multiple-facilities')
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), facilitiesController.createMultiple);

authRouter
  .route('/facilities')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), facilitiesController.getQueryAllFacilities);

authRouter
  .route('/deals/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealsController.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealsController.update)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealsController.delete);

authRouter.route('/deals/:id/clone').post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealClone.clone);
authRouter
  .route('/deals/:id/eligibility-criteria')
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }), dealEligibilityCriteria.update);
authRouter.route('/deals/:id/eligibility-documentation').put(
  validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER] }),
  (req, res, next) => {
    fileUpload(req, res, (error) => {
      if (!error) {
        return next();
      }
      console.error('Unable to upload file %s', error);
      return res.status(400).json({ status: 400, data: 'Failed to upload file' });
    });
  },
  dealEligibilityDocumentation.update,
);

authRouter
  .route('/deals/:id/eligibility-documentation/:fieldname/:filename')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealEligibilityDocumentation.downloadFile);

authRouter
  .route('/banks')
  .get(banks.findAll)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), banks.create);

authRouter
  .route('/banks/:id')
  .get(banks.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), banks.update)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), banks.delete);

authRouter.route('/currencies').get(currencies.findAll);
authRouter.route('/currencies/:id').get(currencies.findOne);

authRouter.route('/countries').get(countries.findAll);
authRouter.route('/countries/:code').get(countries.findOne);

authRouter.route('/feedback').get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), feedback.findAll);

authRouter
  .route('/feedback/:id')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), feedback.findOne)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), feedback.delete);

authRouter.route('/industry-sectors').get(industrySectors.findAll);
authRouter.route('/industry-sectors/:code').get(industrySectors.findOne);

authRouter
  .route('/eligibility-criteria')
  .get(eligibilityCriteria.findAll)
  .post(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), eligibilityCriteria.create);

authRouter.route('/eligibility-criteria/latest').get(eligibilityCriteria.findLatestGET);

authRouter
  .route('/eligibility-criteria/:version')
  .get(eligibilityCriteria.findOne)
  .put(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), eligibilityCriteria.update)
  .delete(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [ADMIN] }), eligibilityCriteria.delete);

// Portal reports
authRouter
  .route('/reports/unissued-facilities')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), unissuedFacilitiesReport.findUnissuedFacilitiesReports);
authRouter
  .route('/reports/review-ukef-decision')
  .get(validateUserHasAtLeastOneAllowedRole({ allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), ukefDecisionReport.reviewUkefDecisionReports);

// token-validator
authRouter.get(
  '/validate',
  (_req, res) => res.status(200).send()
);

openRouter.get(
  '/validate-partial-2fa-token',
  passport.authenticate(partial2faTokenPassportStrategy, { session: false }),
  (_req, res) => res.status(200).send(),
);

// bank-validator
authRouter.get('/validate/bank', (req, res) => banks.validateBank(req, res));

// utilisation report service
authRouter.route('/utilisation-reports').post(
  validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
  (req, res, next) => {
    fileUpload(req, res, (error) => {
      if (!error) {
        return next();
      }
      console.error('Unable to upload file %s', error);
      return res.status(400).json({ status: 400, data: 'Failed to upload file' });
    });
  },
  uploadReportAndSendNotification,
);

authRouter
  .route('/banks/:bankId/utilisation-reports')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    handleValidationResult,
    validateUserAndBankIdMatch,
    getPreviousReportsByBankId,
  );

authRouter
  .route('/banks/:bankId/utilisation-reports/latest')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    handleValidationResult,
    validateUserAndBankIdMatch,
    getLatestReport,
  );

authRouter
  .route('/banks/:bankId/due-report-dates')
  .get(
    validateUserHasAtLeastOneAllowedRole({ allowedRoles: [PAYMENT_REPORT_OFFICER] }),
    bankIdValidation,
    handleValidationResult,
    validateUserAndBankIdMatch,
    getDueReportDates,
  );

authRouter.route('/bank-holidays').get(getBankHolidays);

module.exports = { openRouter, authRouter };
