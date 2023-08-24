const express = require('express');
const passport = require('passport');

const { validateUserHasSufficientRole } = require('./roles/validate-user-has-sufficient-role');
const {
  MAKER,
  CHECKER,
  ADMIN,
  EDITOR,
  DATA_ADMIN,
  INTERFACE,
  READ_ONLY,
} = require('./roles/roles');

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

const { cleanXss, fileUpload } = require('./middleware');
const checkApiKey = require('./middleware/headers/check-api-key');

const users = require('./users/routes');
const gef = require('./gef/routes');

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

// Auth router requires authentication
const authRouter = express.Router();

// Authentication type: JWT + Passport
authRouter.use(passport.authenticate('jwt', { session: false }));

/**
 * Mandatory Criteria routes
 * Allow POST & PUT of MC HTML tags
 * on non-production environments only
 */
authRouter.route('/mandatory-criteria').post(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR] }), mandatoryCriteria.create);

authRouter.route('/mandatory-criteria/:version').put(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR] }), mandatoryCriteria.update);

// Enable XSS
authRouter.use(cleanXss);

// Mandatory Criteria Routes
authRouter.route('/mandatory-criteria').get(mandatoryCriteria.findAll);

authRouter.route('/mandatory-criteria/latest').get(mandatoryCriteria.findLatest);

authRouter
  .route('/mandatory-criteria/:version')
  .get(mandatoryCriteria.findOne)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR] }), mandatoryCriteria.delete);

// TODO DTFS2-6626: Raise ticket to add auth tests to users endpoints and all non-get endpoints
// TODO DTFS2-6626: Raise ticket that any user can update/disable/delete any other user at the API level
authRouter.route('/users').get(users.list).post(users.create);
authRouter.route('/users/:_id').get(users.findById).put(users.updateById).delete(users.remove);
authRouter.route('/users/:_id/disable').delete(users.disable);

authRouter.use('/gef', gef);

authRouter.route('/deals').post(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), dealsController.create);
authRouter.route('/deals').get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealsController.getQueryAllDeals);

authRouter
  .route('/deals/:id/status')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealStatus.findOne)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, INTERFACE] }), dealStatus.update);

authRouter
  .route('/deals/:id/submission-details')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealSubmissionDetails.findOne)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), dealSubmissionDetails.update);

authRouter.route('/deals/:id/additionalRefName').put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), dealName.update);
authRouter.route('/deals/:id/loan/create').put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), loans.create);

// TODO DTFS2-6626: tech debt ticket
authRouter
  .route('/deals/:id/loan/:loanId')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, READ_ONLY, ADMIN] }), loans.getLoan)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), loans.updateLoan)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), loans.deleteLoan);

authRouter.route('/deals/:id/loan/:loanId/issue-facility').put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), loanIssueFacility.updateLoanIssueFacility);
authRouter.route('/deals/:id/loan/:loanId/change-cover-start-date').put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), loanChangeCoverStartDate.updateLoanCoverStartDate);
authRouter.route('/deals/:id/bond/create').put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), bonds.create);

// TODO DTFS2-6626: tech debt ticket
authRouter
  .route('/deals/:id/bond/:bondId')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, READ_ONLY, ADMIN] }), bonds.getBond)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), bonds.updateBond)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), bonds.deleteBond);

authRouter.route('/deals/:id/bond/:bondId/issue-facility').put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), bondIssueFacility.updateBondIssueFacility);
authRouter.route('/deals/:id/bond/:bondId/change-cover-start-date').put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), bondChangeCoverStartDate.updateBondCoverStartDate);
authRouter.route('/deals/:id/multiple-facilities').post(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), facilitiesController.createMultiple);

// TODO DTFS2-6626: Raise tech debt ticket to test
authRouter.route('/facilities').get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), facilitiesController.getQueryAllFacilities);

authRouter
  .route('/deals/:id')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealsController.findOne)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), dealsController.update)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), dealsController.delete);

authRouter.route('/deals/:id/clone').post(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), dealClone.clone);
authRouter.route('/deals/:id/eligibility-criteria').put(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }), dealEligibilityCriteria.update);
authRouter.route('/deals/:id/eligibility-documentation').put(
  validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER] }),
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

// TODO DTFS2-6626: Raise tech debt ticket to add auth api tests
authRouter
  .route('/deals/:id/eligibility-documentation/:fieldname/:filename')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), dealEligibilityDocumentation.downloadFile);

authRouter
  .route('/banks')
  .get(banks.findAll)
  .post(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR] }), banks.create);

authRouter
  .route('/banks/:id')
  .get(banks.findOne)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR] }), banks.update)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR] }), banks.delete);

authRouter.route('/currencies').get(currencies.findAll);
authRouter.route('/currencies/:id').get(currencies.findOne);

authRouter.route('/countries').get(countries.findAll);
authRouter.route('/countries/:code').get(countries.findOne);

authRouter.route('/feedback').get(validateUserHasSufficientRole({ allowedNonAdminRoles: [DATA_ADMIN, ADMIN] }), feedback.findAll);

authRouter
  .route('/feedback/:id')
  .get(validateUserHasSufficientRole({ allowedNonAdminRoles: [DATA_ADMIN, ADMIN] }), feedback.findOne)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [DATA_ADMIN] }), feedback.delete);

authRouter.route('/industry-sectors').get(industrySectors.findAll);
authRouter.route('/industry-sectors/:code').get(industrySectors.findOne);

authRouter
  .route('/eligibility-criteria')
  .get(eligibilityCriteria.findAll)
  .post(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR] }), eligibilityCriteria.create);

authRouter.route('/eligibility-criteria/latest').get(eligibilityCriteria.findLatestGET);

authRouter
  .route('/eligibility-criteria/:version')
  .get(eligibilityCriteria.findOne)
  .put(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR] }), eligibilityCriteria.update)
  .delete(validateUserHasSufficientRole({ allowedNonAdminRoles: [EDITOR] }), eligibilityCriteria.delete);

// Portal reports
authRouter.route('/reports/unissued-facilities').get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), unissuedFacilitiesReport.findUnissuedFacilitiesReports);
authRouter.route('/reports/review-ukef-decision').get(validateUserHasSufficientRole({ allowedNonAdminRoles: [MAKER, CHECKER, READ_ONLY, ADMIN] }), ukefDecisionReport.reviewUkefDecisionReports);

// token-validator
authRouter.get('/validate', (req, res) => {
  res.status(200).send();
});

// bank-validator
// TODO DTFS2-6626: Raise tech debt ticket that API tests need to be added to `/validate/bank`
// TODO DTFS2-6626: Raise tech debt ticket that the body of a GET request should not affect the response
authRouter.get('/validate/bank', (req, res) => banks.validateBank(req, res));

module.exports = { openRouter, authRouter };
