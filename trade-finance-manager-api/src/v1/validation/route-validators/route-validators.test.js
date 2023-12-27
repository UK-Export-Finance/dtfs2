const { validationResult } = require('express-validator');
const httpMocks = require('node-mocks-http');
const { ObjectId } = require('mongodb');
const { isoMonthValidation, updateReportStatusPayloadValidation } = require('./route-validators');
const { UTILISATION_REPORT_RECONCILIATION_STATUS } = require('../../../constants');

describe('route-validators', () => {
  describe('isoMonthValidation', () => {
    const getIsoMonthValidationResult = async (fields, req) => {
      const res = httpMocks.createResponse();
      const next = jest.fn();

      const validator = isoMonthValidation(fields)[0];
      await validator(req, res, next);

      return validationResult(req).array();
    };

    it.each([
      { params: { submissionMonth: '2023-11-01' } },
      { params: { submissionMonth: '2023-13' } },
      { params: { submissionMonth: '2023 11' } },
      { params: { submissionMonth: 'November 2023' } },
      { params: { submissionMonth: '202-11' } },
      { params: { submissionMonth: 'invalid' } },
      { params: { submissionMonth: '' } },
      { params: { submissionMonth: 202311 } },
      { params: { submissionMonth: undefined } },
      { params: { 'param-one': 'invalid', 'param-two': '2023-11' } },
      { params: { 'param-one': '2023-11', 'param-two': 'invalid' } },
    ])('returns errors when passed at least one invalid path param: $params', async ({ params }) => {
      // Arrange
      const req = httpMocks.createRequest({ params });
      const paramNames = Object.keys(params);

      // Act
      const errors = await getIsoMonthValidationResult(paramNames, req);

      // Assert
      expect(errors.length).toEqual(1);
      expect(errors[0].msg).toEqual(expect.stringContaining("parameter must be an ISO month string (format 'yyyy-MM')"));
    });

    it.each([{ params: { submissionMonth: '2023-11' } }, { params: { paramOne: '1956-01', paramTwo: '2050-11' } }])(
      'returns no errors when all the path params are valid: $params',
      async ({ params }) => {
        // Arrange
        const req = httpMocks.createRequest({ params });
        const paramNames = Object.keys(params);

        // Act
        const errors = await getIsoMonthValidationResult(paramNames, req);

        // Assert
        expect(errors.length).toEqual(0);
      },
    );
  });

  describe('updateReportStatusPayloadValidation', () => {
    const getValidPayloadBody = (opts) => ({
      user: opts.user ?? {},
      reportsWithStatus: opts.reportsWithStatus ?? [
        {
          status: opts.status ?? UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
          report: opts.report ?? {
            month: 5,
            year: 2023,
            bankId: '123',
          },
        },
      ],
    });

    const getUpdateReportStatusPayloadValidationResult = async (req) => {
      const res = httpMocks.createResponse();
      const next = jest.fn();

      const validators = updateReportStatusPayloadValidation.map((validator) => {
        if (Array.isArray(validator)) {
          return validator.flatMap((subValidator) => subValidator(req, res, next));
        }
        return validator(req, res, next);
      });
      await Promise.all(validators);

      return validationResult(req).array();
    };

    describe('for a payload with a bank id, month and year combination', () => {
      const validPayload = {
        month: 5,
        year: 2023,
        bankId: '123',
      };

      it.each([
        ['month is a string', getValidPayloadBody({ report: { ...validPayload, month: '5' } })],
        ['month is less than 1', getValidPayloadBody({ report: { ...validPayload, month: 0 } })],
        ['month is greater than 12', getValidPayloadBody({ report: { ...validPayload, month: 13 } })],
        ['year is a string', getValidPayloadBody({ report: { ...validPayload, year: '2023' } })],
        ['year is less than 0', getValidPayloadBody({ report: { ...validPayload, year: -1 } })],
        ['bankId is a number', getValidPayloadBody({ report: { ...validPayload, bankId: 123 } })],
      ])('returns a single error when one of the parameters in invalid (%s)', async (_, payload) => {
        // Arrange
        const req = httpMocks.createRequest({ body: payload });

        // Act
        const errors = await getUpdateReportStatusPayloadValidationResult(req);

        // Assert
        expect(errors.length).toEqual(1);
      });

      it('returns no errors when the payload is valid', async () => {
        // Arrange
        const body = getValidPayloadBody({ report: validPayload });
        const req = httpMocks.createRequest({ body });

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
        const req = httpMocks.createRequest({ body });

        // Act
        const errors = await getUpdateReportStatusPayloadValidationResult(req);

        // Assert
        expect(errors.length).toEqual(1);
      });

      it('returns a single error when the report id is not a string', async () => {
        // Arrange
        const report = { id: new ObjectId(validMongoId) };
        const body = getValidPayloadBody({ report });
        const req = httpMocks.createRequest({ body });

        // Act
        const errors = await getUpdateReportStatusPayloadValidationResult(req);

        // Assert
        expect(errors.length).toEqual(1);
      });

      it('returns no errors when the payload is valid', async () => {
        // Arrange
        const report = { id: validMongoId };
        const body = getValidPayloadBody({ report });
        const req = httpMocks.createRequest({ body });

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
      const req = httpMocks.createRequest({ body });

      // Act
      const errors = await getUpdateReportStatusPayloadValidationResult(req);

      // Assert
      expect(errors.length).toEqual(0);
    });

    it('returns a single error when the user is not an object', async () => {
      // Arrange
      const user = 'Test user';
      const body = getValidPayloadBody({ user });
      const req = httpMocks.createRequest({ body });

      // Act
      const errors = await getUpdateReportStatusPayloadValidationResult(req);

      // Assert
      expect(errors.length).toEqual(1);
    });

    it('returns a single error when reportsWithStatus is an empty array', async () => {
      // Arrange
      const reportsWithStatus = [];
      const body = getValidPayloadBody({ reportsWithStatus });
      const req = httpMocks.createRequest({ body });

      // Act
      const errors = await getUpdateReportStatusPayloadValidationResult(req);

      // Assert
      expect(errors.length).toEqual(1);
    });

    it('returns a single error when the status is not a valid status', async () => {
      // Arrange
      const status = 'INVALID_STATUS';
      const body = getValidPayloadBody({ status });
      const req = httpMocks.createRequest({ body });

      // Act
      const errors = await getUpdateReportStatusPayloadValidationResult(req);

      // Assert
      expect(errors.length).toEqual(1);
    });

    it.each([
      { status: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED },
      { status: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED },
      { status: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION },
    ])('returns no errors when the status is $status', async ({ status }) => {
      // Arrange
      const body = getValidPayloadBody({ status });
      const req = httpMocks.createRequest({ body });

      // Act
      const errors = await getUpdateReportStatusPayloadValidationResult(req);

      // Assert
      expect(errors.length).toEqual(0);
    });
  });
});
