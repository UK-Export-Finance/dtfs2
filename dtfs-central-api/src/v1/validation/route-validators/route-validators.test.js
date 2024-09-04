import { validationResult } from 'express-validator';
import httpMocks from 'node-mocks-http';
import { isoMonthValidation } from './route-validators';

describe('route-validators', () => {
  describe('isoMonthValidation', () => {
    const getIsoMonthValidationResult = async (fields, req) => {
      const validator = isoMonthValidation(fields)[0];
      await validator.run(req);
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
});
