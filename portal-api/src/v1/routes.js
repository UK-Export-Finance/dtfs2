const express = require('express');
const passport = require('passport');

const { validateUserHasSufficientRole } = require('./roles/validate-user-has-sufficient-role');

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
authRouter.route('/mandatory-criteria').post(validateUserHasSufficientRole({ allowedRoles: ['editor'] }), mandatoryCriteria.create);

authRouter.route('/mandatory-criteria/:version').put(validateUserHasSufficientRole({ allowedRoles: ['editor'] }), mandatoryCriteria.update);

// Enable XSS
authRouter.use(cleanXss);

// Mandatory Criteria Routes
authRouter.route('/mandatory-criteria').get(mandatoryCriteria.findAll);

authRouter.route('/mandatory-criteria/latest').get(mandatoryCriteria.findLatest);

authRouter
  .route('/mandatory-criteria/:version')
  .get(mandatoryCriteria.findOne)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['editor'] }), mandatoryCriteria.delete);

authRouter.route('/users').get(users.list).post(users.create);
authRouter.route('/users/:_id').get(users.findById).put(users.updateById).delete(users.remove);
authRouter.route('/users/:_id/disable').delete(users.disable);

authRouter.use('/gef', gef);

authRouter.route('/deals').post(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), dealsController.create);
authRouter.route('/deals').get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'admin'] }), dealsController.getQueryAllDeals);

authRouter
  .route('/deals/:id/status')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'admin'] }), dealStatus.findOne)
  .put(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'interface'] }), dealStatus.update);

authRouter
  .route('/deals/:id/submission-details')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'admin'] }), dealSubmissionDetails.findOne)
  .put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), dealSubmissionDetails.update);

authRouter.route('/deals/:id/additionalRefName').put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), dealName.update);
authRouter.route('/deals/:id/loan/create').put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), loans.create);

authRouter
  .route('/deals/:id/loan/:loanId')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'admin'] }), loans.getLoan)
  .put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), loans.updateLoan)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), loans.deleteLoan);

authRouter.route('/deals/:id/loan/:loanId/issue-facility').put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), loanIssueFacility.updateLoanIssueFacility);
authRouter.route('/deals/:id/loan/:loanId/change-cover-start-date').put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), loanChangeCoverStartDate.updateLoanCoverStartDate);
authRouter.route('/deals/:id/bond/create').put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), bonds.create);

authRouter
  .route('/deals/:id/bond/:bondId')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'admin'] }), bonds.getBond)
  .put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), bonds.updateBond)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), bonds.deleteBond);

authRouter.route('/deals/:id/bond/:bondId/issue-facility').put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), bondIssueFacility.updateBondIssueFacility);
authRouter.route('/deals/:id/bond/:bondId/change-cover-start-date').put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), bondChangeCoverStartDate.updateBondCoverStartDate);
authRouter.route('/deals/:id/multiple-facilities').post(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), facilitiesController.createMultiple);

authRouter.route('/facilities').get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'admin'] }), facilitiesController.getQueryAllFacilities);

authRouter
  .route('/deals/:id')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'admin'] }), dealsController.findOne)
  .put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), dealsController.update)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), dealsController.delete);

authRouter.route('/deals/:id/clone').post(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), dealClone.clone);
authRouter.route('/deals/:id/eligibility-criteria').put(validateUserHasSufficientRole({ allowedRoles: ['maker'] }), dealEligibilityCriteria.update);
authRouter.route('/deals/:id/eligibility-documentation').put(
  validateUserHasSufficientRole({ allowedRoles: ['maker'] }),
  (req, res, next) => {
    fileUpload(req, res, (error) => {
      if (!error) {
        return next();
      }
      console.error('Unable to upload file %O', error);
      return res.status(400).json({ status: 400, data: 'Failed to upload file' });
    });
  },
  dealEligibilityDocumentation.update,
);

authRouter
  .route('/deals/:id/eligibility-documentation/:fieldname/:filename')
  .get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'admin'] }), dealEligibilityDocumentation.downloadFile);

authRouter
  .route('/banks')
  .get(banks.findAll)
  .post(validateUserHasSufficientRole({ allowedRoles: ['editor'] }), banks.create);

authRouter
  .route('/banks/:id')
  .get(banks.findOne)
  .put(validateUserHasSufficientRole({ allowedRoles: ['editor'] }), banks.update)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['editor'] }), banks.delete);

authRouter.route('/currencies').get(currencies.findAll);
authRouter.route('/currencies/:id').get(currencies.findOne);

authRouter.route('/countries').get(countries.findAll);
authRouter.route('/countries/:code').get(countries.findOne);

authRouter.route('/feedback').get(validateUserHasSufficientRole({ allowedRoles: ['data-admin', 'admin'] }), feedback.findAll);

authRouter
  .route('/feedback/:id')
  .get(validateUserHasSufficientRole({ allowedRoles: ['data-admin', 'admin'] }), feedback.findOne)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['data-admin'] }), feedback.delete);

authRouter.route('/industry-sectors').get(industrySectors.findAll);
authRouter.route('/industry-sectors/:code').get(industrySectors.findOne);

authRouter
  .route('/eligibility-criteria')
  .get(eligibilityCriteria.findAll)
  .post(validateUserHasSufficientRole({ allowedRoles: ['editor'] }), eligibilityCriteria.create);

authRouter.route('/eligibility-criteria/latest').get(eligibilityCriteria.findLatestGET);

authRouter
  .route('/eligibility-criteria/:version')
  .get(eligibilityCriteria.findOne)
  .put(validateUserHasSufficientRole({ allowedRoles: ['editor'] }), eligibilityCriteria.update)
  .delete(validateUserHasSufficientRole({ allowedRoles: ['editor'] }), eligibilityCriteria.delete);

// Portal reports
authRouter.route('/reports/unissued-facilities').get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'admin'] }), unissuedFacilitiesReport.findUnissuedFacilitiesReports);
authRouter.route('/reports/review-ukef-decision').get(validateUserHasSufficientRole({ allowedRoles: ['maker', 'checker', 'admin'] }), ukefDecisionReport.reviewUkefDecisionReports);

// token-validator
authRouter.get('/validate', (req, res) => {
  res.status(200).send();
});

// bank-validator
authRouter.get('/validate/bank', (req, res) => banks.validateBank(req, res));

module.exports = { openRouter, authRouter };
