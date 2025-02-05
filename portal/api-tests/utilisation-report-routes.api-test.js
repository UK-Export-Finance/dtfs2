jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/routes/middleware/csrf', () => ({
  ...jest.requireActual('../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  downloadUtilisationReport: jest.fn().mockResolvedValue({
    headers: {
      'content-disposition': `attachment; filename=report.csv`,
      'content-type': 'text/csv',
    },
  }),
}));

const { ROLES, aRecordCorrectionFormValues } = require('@ukef/dtfs2-common');
const { HttpStatusCode } = require('axios');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const MOCK_BANKS = require('../test-helpers/mock-banks');

describe('utilisation-report routes', () => {
  describe('GET /banks/:bankId/utilisation-report-download/:_id', () => {
    const getUrl = ({ bankId, reportId }) => `/banks/${bankId}/utilisation-report-download/${reportId}`;

    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) =>
        get(
          getUrl({
            bankId: MOCK_BANKS.BARCLAYS.id,
            reportId: '5099803df3f4948bd2f98391',
          }),
          {},
          headers,
        ),
      whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
      successCode: HttpStatusCode.Ok,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /utilisation-reports/provide-correction/:correctionId', () => {
    const originalProcessEnv = { ...process.env };
    const getUrl = ({ correctionId }) => `/utilisation-reports/provide-correction/${correctionId}`;

    describe('when FF_FEE_RECORD_CORRECTION_ENABLED is set to `true`', () => {
      beforeAll(() => {
        process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'true';
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(getUrl({ correctionId: 1 }), {}, headers),
        whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
        successCode: HttpStatusCode.Ok,
        disableHappyPath: true,
      });
    });

    describe('when FF_FEE_RECORD_CORRECTION_ENABLED is set to `false`', () => {
      beforeAll(() => {
        process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'false';
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      it(`should redirect to "/not-found"`, async () => {
        // Arrange
        const url = getUrl({ correctionId: 1 });

        // Act
        const response = await get(url);

        // Assert
        expect(response.headers.location).toEqual('/not-found');
      });
    });
  });

  describe('POST /utilisation-reports/provide-correction/:correctionId', () => {
    const originalProcessEnv = { ...process.env };
    const getUrl = ({ correctionId }) => `/utilisation-reports/provide-correction/${correctionId}`;

    describe('when FF_FEE_RECORD_CORRECTION_ENABLED is set to `true`', () => {
      beforeAll(() => {
        process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'true';
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => post(aRecordCorrectionFormValues(), headers).to(getUrl({ correctionId: 1 })),
        whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
        successCode: HttpStatusCode.Ok,
        disableHappyPath: true,
      });
    });

    describe('when FF_FEE_RECORD_CORRECTION_ENABLED is set to `false`', () => {
      beforeAll(() => {
        process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'false';
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      it(`should redirect to "/not-found"`, async () => {
        // Arrange
        const url = getUrl({ correctionId: 1 });

        // Act
        const response = await post(aRecordCorrectionFormValues()).to(url);

        // Assert
        expect(response.headers.location).toEqual('/not-found');
      });
    });
  });

  describe('POST /utilisation-reports/cancel-correction/:correctionId', () => {
    const originalProcessEnv = { ...process.env };
    const getUrl = ({ correctionId }) => `/utilisation-reports/cancel-correction/${correctionId}`;

    describe('when FF_FEE_RECORD_CORRECTION_ENABLED is set to `true`', () => {
      beforeAll(() => {
        process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'true';
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => post(undefined, headers).to(getUrl({ correctionId: 1 })),
        whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
        successCode: HttpStatusCode.Ok,
        disableHappyPath: true,
      });
    });

    describe('when FF_FEE_RECORD_CORRECTION_ENABLED is set to `false`', () => {
      beforeAll(() => {
        process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'false';
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      it(`should redirect to "/not-found"`, async () => {
        // Arrange
        const url = getUrl({ correctionId: 1 });

        // Act
        const response = await post().to(url);

        // Assert
        expect(response.headers.location).toEqual('/not-found');
      });
    });
  });

  describe('GET /utilisation-reports/correction-log', () => {
    const originalProcessEnv = { ...process.env };
    const url = '/utilisation-reports/correction-log';

    describe('when FF_FEE_RECORD_CORRECTION_ENABLED is set to `true`', () => {
      beforeAll(() => {
        process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'true';
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(url, {}, headers),
        whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
        successCode: HttpStatusCode.Ok,
        disableHappyPath: true,
      });
    });

    describe('when FF_FEE_RECORD_CORRECTION_ENABLED is set to `false`', () => {
      beforeAll(() => {
        process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'false';
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      it(`should redirect to "/not-found"`, async () => {
        // Act
        const response = await get(url);

        // Assert
        expect(response.headers.location).toEqual('/not-found');
      });
    });
  });
});
