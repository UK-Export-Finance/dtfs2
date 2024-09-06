import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { validatePostReportDataValidationPayload } from './validate-post-report-data-validation-payload';

describe('validatePostReportDataValidationPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  it(`responds with a '${HttpStatusCode.BadRequest}' if the reportData field is missing`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();
    req.body = {};

    // Act
    validatePostReportDataValidationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it.each`
    condition      | testValue
    ${'null'}      | ${null}
    ${'undefined'} | ${undefined}
    ${'number'}    | ${7}
    ${'string'}    | ${''}
    ${'object'}    | ${{}}
  `(`responds with a '${HttpStatusCode.BadRequest}' if the reportData is not a list: $condition`, (testValue: unknown) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = { reportData: testValue };

    // Act
    validatePostReportDataValidationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it(`responds with a '${HttpStatusCode.BadRequest}' if any of the report data items are not a csv row data with locations`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = { reportData: [{ 'some key': 'this is not cell data!' }] };

    // Act
    validatePostReportDataValidationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls the 'next' function if the 'reportData' is a list of csv row data with locations", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = {
      reportData: [
        { 'some key': { value: 'GBP', row: 6, column: 'A' }, 'some other key': { value: 'USD', row: 6, column: 'B' } },
        { 'some key': { value: null, row: '7', column: 'A' }, 'some other key': { value: null, row: '7', column: 'B' } },
      ],
    };

    // Act
    validatePostReportDataValidationPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toBe(false);
  });
});
