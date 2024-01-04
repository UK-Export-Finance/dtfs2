import { Request } from 'express';
import { validationResult } from 'express-validator';
import { createRequest } from 'node-mocks-http';
import { updateReportStatusPayloadValidation } from '.';
import { UTILISATION_REPORT_RECONCILIATION_STATUS } from '../../../../constants';
import { TfmSessionUser } from '../../../../types/tfm-session-user';
import { ReportIdentifier, ReportWithStatus, UtilisationReportReconciliationStatus } from '../../../../types/utilisation-reports';
import { UpdateUtilisationReportStatusRequestBody } from '../../../controllers/utilisation-reports/update-utilisation-report-status.controller';
import { MOCK_TFM_SESSION_USER } from '../../../__mocks__/mock-tfm-session-user';

type ValidPayloadBodyOpts = {
  user?: TfmSessionUser;
  reportsWithStatus?: ReportWithStatus[];
  status?: UtilisationReportReconciliationStatus;
  report?: ReportIdentifier;
};

describe('updateReportStatusPayloadValidation', () => {
  const getValidPayloadBody = (opts: ValidPayloadBodyOpts): UpdateUtilisationReportStatusRequestBody => ({
    user: opts.user ?? MOCK_TFM_SESSION_USER,
    reportsWithStatus: opts.reportsWithStatus ?? [
      {
        status: opts.status ?? UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION,
        report: opts.report ?? {
          month: 5,
          year: 2023,
          bankId: '123',
        },
      },
    ],
  });

  const getUpdateReportStatusPayloadValidationResult = async (req: Request) => {
    await Promise.all(updateReportStatusPayloadValidation.map((validator) => validator.run(req)));
    return validationResult(req).array();
  };

  describe('for a payload with a bank id, month and year combination', () => {
    const validPayload = {
      month: 5,
      year: 2023,
      bankId: '123',
    };

    it.each([
      // @ts-expect-error month is supposed to be the incorrect type for this test
      ['month is a string', getValidPayloadBody({ report: { ...validPayload, month: '5' } }), "'month' must be a number between 1 and 12 inclusive"],
      ['month is less than 1', getValidPayloadBody({ report: { ...validPayload, month: 0 } }), "'month' must be a number between 1 and 12 inclusive"],
      ['month is greater than 12', getValidPayloadBody({ report: { ...validPayload, month: 13 } }), "'month' must be a number between 1 and 12 inclusive"],
      // @ts-expect-error year is supposed to be the incorrect type for this test
      ['year is a string', getValidPayloadBody({ report: { ...validPayload, year: '2023' } }), "'year' must be a positive number"],
      ['year is less than 0', getValidPayloadBody({ report: { ...validPayload, year: -1 } }), "'year' must be a positive number"],
      // @ts-expect-error bankId is supposed to be the incorrect type for this test
      ['bankId is a number', getValidPayloadBody({ report: { ...validPayload, bankId: 123 } }), "'bankId' must be a string containing only digits"],
    ])('returns a single error when one of the parameters is invalid (%s)', async (_, payload, errorMessage) => {
      // Arrange
      const req = createRequest({ body: payload });

      // Act
      const errors = await getUpdateReportStatusPayloadValidationResult(req);

      // Assert
      expect(errors.length).toEqual(1);
      expect(errors.at(0)?.msg).toEqual(errorMessage);
    });

    it('returns no errors when the payload is valid', async () => {
      // Arrange
      const body = getValidPayloadBody({ report: validPayload });
      const req = createRequest({ body });

      // Act
      const errors = await getUpdateReportStatusPayloadValidationResult(req);

      // Assert
      expect(errors.length).toEqual(0);
    });
  });

  describe('for a payload with a report id', () => {
    const validMongoId = '5ce819935e539c343f141ece';

    it('returns a single error when the report id is not a valid mongo id', async () => {
      // Arrange
      const report = { id: '123' };
      const body = getValidPayloadBody({ report });
      const req = createRequest({ body });

      // Act
      const errors = await getUpdateReportStatusPayloadValidationResult(req);

      // Assert
      expect(errors.length).toEqual(1);
      expect(errors.at(0)?.msg).toEqual("'report.id' must be a valid mongo id string");
    });

    it('returns no errors when the payload is valid', async () => {
      // Arrange
      const report = { id: validMongoId };
      const body = getValidPayloadBody({ report });
      const req = createRequest({ body });

      // Act
      const errors = await getUpdateReportStatusPayloadValidationResult(req);

      // Assert
      expect(errors.length).toEqual(0);
    });
  });

  it('returns no errors for a payload which uses a combination of report identifiers', async () => {
    // Arrange
    const validMongoId = '5ce819935e539c343f141ece';
    const reportWithId = { id: validMongoId };
    const reportWithBankId = {
      month: 1,
      year: 2023,
      bankId: '123',
    };
    const reportsWithStatus = [
      {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        report: reportWithId,
      },
      {
        status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED,
        report: reportWithBankId,
      },
    ];
    const body = getValidPayloadBody({ reportsWithStatus });
    const req = createRequest({ body });

    // Act
    const errors = await getUpdateReportStatusPayloadValidationResult(req);

    // Assert
    expect(errors.length).toEqual(0);
  });

  it('returns a single error when the user is not an object', async () => {
    // Arrange
    const user = 'Test user';
    // @ts-expect-error user is supposed to be invalid for this test
    const body = getValidPayloadBody({ user });
    const req = createRequest({ body });

    // Act
    const errors = await getUpdateReportStatusPayloadValidationResult(req);

    // Assert
    expect(errors.length).toEqual(1);
    expect(errors.at(0)?.msg).toEqual("Expected body to contain 'user' object");
  });

  it('returns a single error when reportsWithStatus is an empty array', async () => {
    // Arrange
    const reportsWithStatus: ReportWithStatus[] = [];
    const body = getValidPayloadBody({ reportsWithStatus });
    const req = createRequest({ body });

    // Act
    const errors = await getUpdateReportStatusPayloadValidationResult(req);

    // Assert
    expect(errors.length).toEqual(1);
    expect(errors.at(0)?.msg).toEqual("Expected body to contain non-empty 'reportsWithStatus' array");
  });

  it('returns a single error when the status is not a valid status', async () => {
    // Arrange
    const status = 'INVALID_STATUS' as UtilisationReportReconciliationStatus;
    const body = getValidPayloadBody({ status });
    const req = createRequest({ body });

    // Act
    const errors = await getUpdateReportStatusPayloadValidationResult(req);

    // Assert
    expect(errors.length).toEqual(1);
    expect(errors.at(0)?.msg).toContain('Report status must be one of the following:');
  });

  it.each([
    { status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED },
    { status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION },
  ])('returns no errors when the status is $status', async ({ status }) => {
    // Arrange
    const body = getValidPayloadBody({ status });
    const req = createRequest({ body });

    // Act
    const errors = await getUpdateReportStatusPayloadValidationResult(req);

    // Assert
    expect(errors.length).toEqual(0);
  });
});
