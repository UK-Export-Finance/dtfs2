jest.mock('../../server/routes/api-data-provider', () => ({
    ...(jest.requireActual('../../server/routes/api-data-provider')),
    provide: () => (req, res, next) => { req.apiData = {  deal: { details: {} }, loan: { validationErrors: {} } }; return next(); },
  }));
  
  const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
  const app = require('../../server/createApp');
  const { get, post } = require('../create-api').createApi(app);
  const { ROLES } = require('../../server/constants');
  
  const _id = '64ef48ee17a3231be0ad48b3';
  const loanId = 'loanId';
  
  describe('loan routes', () => {
    describe('GET /contract/:_id/loan/create', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/create`, {}, headers),
        whitelistedRoles: ROLES,
        successCode: 302,
        successHeaders: { location: `/contract/${_id}/loan/${loanId}/guarantee-details` },
        disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
      });
    });
  
    describe('GET /contract/:_id/loan/:loanId/guarantee-details', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/guarantee-details`, {}, headers),
        whitelistedRoles: ['maker'],
        successCode: 200,
      });
    });
  
    describe('POST /contract/:_id/loan/:loanId/guarantee-details', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/guarantee-details`),
        whitelistedRoles: ROLES,
        successCode: 302,
        successHeaders: { location: `/contract/${_id}/loan/${loanId}/financial-details` },
        disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
      });
    });

    describe('POST /contract/:_id/loan/:loanId/guarantee-details/save-go-back', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/guarantee-details/save-go-back`),
          whitelistedRoles: ROLES,
          successCode: 302,
          successHeaders: { location: `/contract/${_id}` },
          disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        });
    });

    describe('GET /contract/:_id/loan/:loanId/financial-details', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/financial-details`, {}, headers),
          whitelistedRoles: ['maker'],
          successCode: 200,
          disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        });
    });

    describe('POST /contract/:_id/loan/:loanId/financial-details', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/financial-details`),
          whitelistedRoles: ROLES,
          successCode: 302,
          successHeaders: { location: `/contract/${_id}/loan/${loanId}/dates-repayments` },
          disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        });
    });

    describe('POST /contract/:_id/loan/:loanId/financial-details/save-go-back', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/financial-details/save-go-back`),
          whitelistedRoles: ROLES,
          successCode: 302,
          successHeaders: { location: `/contract/${_id}` },
          disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        });
    });
  
    describe('GET /contract/:_id/loan/:loanId/dates-repayments', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/dates-repayments`, {}, headers),
          whitelistedRoles: ['maker'],
          successCode: 200,
        });
    });

    describe('POST /contract/:_id/loan/:loanId/dates-repayments', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/dates-repayments`),
          whitelistedRoles: ROLES,
          successCode: 302,
          successHeaders: { location: `/contract/${_id}/loan/${loanId}/check-your-answers` },
          disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        });
    });

    describe('POST /contract/:_id/loan/:loanId/dates-repayments/save-go-back', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/dates-repayments/save-go-back`),
          whitelistedRoles: ROLES,
          successCode: 302,
          successHeaders: { location: `/contract/${_id}` },
          disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        });
    });

    describe('GET /contract/:_id/loan/:loanId/check-your-answers', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/check-your-answers`, {}, headers),
          whitelistedRoles: ['maker'],
          successCode: 200,
          disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        });
    });

    describe('GET /contract/:_id/loan/:loanId/issue-facility', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/issue-facility`, {}, headers),
          whitelistedRoles: ['maker'],
          successCode: 200,
          disableHappyPath: true,
        });
    });

    describe('POST /contract/:_id/loan/:loanId/issue-facility', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/issue-facility`),
          whitelistedRoles: ROLES,
          successCode: 302,
          successHeaders: { location: `/contract/${_id}` },
          disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        });
    });

    describe('GET /contract/:_id/loan/:loanId/confirm-requested-cover-start-date', () => {
        withRoleValidationApiTests({
          makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/confirm-requested-cover-start-date`, {}, headers),
          whitelistedRoles: ROLES,
          successCode: 200,
          disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
        });
    });

    describe('POST /contract/:_id/loan/:loanId/confirm-requested-cover-start-date', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/confirm-requested-cover-start-date`),
        whitelistedRoles: ROLES,
        successCode: 302,
        successHeaders: { location: `/contract/${_id}` },
        disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
      });
    });

    describe('GET /contract/:_id/loan/:loanId/delete', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(`/contract/${_id}/loan/${loanId}/delete`, {}, headers),
        whitelistedRoles: ROLES,
        successCode: 302,
        successHeaders: { location: `/contract/${_id}` },
        disableHappyPath: true,
      });
    });

    describe('POST /contract/:_id/loan/:loanId/delete', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/loan/${loanId}/delete`),
        whitelistedRoles: ROLES,
        successCode: 302,
        successHeaders: { location: `/contract/${_id}` },
        disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
      });
    });
  });
