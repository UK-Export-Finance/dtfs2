jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  downloadUtilisationReport: jest.fn().mockResolvedValue({
    data: (() => {
      const { PassThrough } = jest.requireActual('stream');

      const reportStream = new PassThrough();

      reportStream.end('report.csv');

      return reportStream;
    })(),
    headers: {
      'content-disposition': `attachment; filename=report.csv`,
      'content-type': 'text/csv',
    },
  }),
  getFeeRecordCorrection: jest.fn(),
  getFeeRecordCorrectionTransientFormData: jest.fn(),
  putFeeRecordCorrection: jest.fn(),
  deleteFeeRecordCorrectionTransientFormData: jest.fn(),
  getCompletedFeeRecordCorrections: jest.fn(),
}));

const { ROLES } = require('@ukef/dtfs2-common');
const { aRecordCorrectionFormValues } = require('@ukef/dtfs2-common/test-helpers');
const { HttpStatusCode } = require('axios');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { aGetFeeRecordCorrectionResponseBody } = require('../test-helpers/test-data/get-fee-record-correction-response');
const api = require('../server/api');

const { get, post } = createApi(app);

describe('utilisation-report routes', () => {
  describe('GET /banks/:bankId/utilisation-report-download/:_id', () => {
    const getUrl = ({ bankId, reportId }) => `/banks/${bankId}/utilisation-report-download/${reportId}`;

    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) =>
        get(
          getUrl({
            bankId: '9',
            reportId: '12345678',
          }),
          {},
          headers,
        ),
      whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('GET /utilisation-reports/provide-correction/:correctionId', () => {
    const originalProcessEnv = { ...process.env };
    const getUrl = ({ correctionId }) => `/utilisation-reports/provide-correction/${correctionId}`;

    describe('when FF_FEE_RECORD_CORRECTION_ENABLED is set to `true`', () => {
      beforeAll(() => {
        process.env.FF_FEE_RECORD_CORRECTION_ENABLED = 'true';
      });

      beforeEach(() => {
        api.getFeeRecordCorrection.mockResolvedValue(aGetFeeRecordCorrectionResponseBody());
        api.getFeeRecordCorrectionTransientFormData.mockResolvedValue({});
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(getUrl({ correctionId: 1 }), {}, headers),
        whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
        successCode: HttpStatusCode.Ok,
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

      beforeEach(() => {
        api.putFeeRecordCorrection.mockResolvedValue({});
        api.getFeeRecordCorrection.mockResolvedValue(aGetFeeRecordCorrectionResponseBody());
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => post(aRecordCorrectionFormValues(), headers).to(getUrl({ correctionId: 1 })),
        whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
        successCode: HttpStatusCode.Found,
        successHeaders: { location: '/utilisation-reports/provide-correction/1/check-the-information' },
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

      beforeEach(() => {
        api.deleteFeeRecordCorrectionTransientFormData.mockResolvedValue({});
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => post(undefined, headers).to(getUrl({ correctionId: 1 })),
        whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
        successCode: HttpStatusCode.Found,
        successHeaders: { location: '/utilisation-report-upload' },
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

      beforeEach(() => {
        api.getCompletedFeeRecordCorrections.mockResolvedValue([
          {
            id: 1,
            dateSent: '2024-01-01T12:30:00.000Z',
            exporter: 'An exporter',
            formattedReasons: 'Reason 1',
            formattedPreviousValues: 'Previous value',
            formattedCorrectedValues: 'Corrected value',
            bankCommentary: 'Commentary',
          },
        ]);
      });

      afterAll(() => {
        process.env = { ...originalProcessEnv };
      });

      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get(url, {}, headers),
        whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
        successCode: HttpStatusCode.Ok,
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
