import httpMocks from 'node-mocks-http';
import { Currency, FeeRecordStatus } from '@ukef/dtfs2-common';
import { validatePostAddPaymentRequestBody } from '.';
import { MOCK_TFM_SESSION_USER } from '../../test-mocks/mock-tfm-session-user';
import { AddPaymentErrorKey } from '../../controllers/utilisation-reports/helpers';
import { PremiumPaymentsTableCheckboxId } from '../../types/premium-payments-table-checkbox-id';

console.error = jest.fn();

describe('validatePostAddPaymentRequestBody', () => {
  const REPORT_ID = 1;

  const REDIRECT_URL = `/utilisation-reports/${REPORT_ID}`;

  const getHttpMocks = () =>
    httpMocks.createMocks({
      session: {
        user: MOCK_TFM_SESSION_USER,
        userToken: 'user-token',
      },
      params: {
        reportId: REPORT_ID,
      },
    });

  const getCheckboxId = (feeRecordId: number, reportedPaymentsCurrency: Currency, status: FeeRecordStatus): PremiumPaymentsTableCheckboxId =>
    `feeRecordIds-${feeRecordId}-reportedPaymentsCurrency-${reportedPaymentsCurrency}-status-${status}`;

  const getRequestBodyFromCheckboxIds = (checkboxIds: PremiumPaymentsTableCheckboxId[]) =>
    checkboxIds.reduce((obj, checkboxId) => ({ ...obj, [checkboxId]: 'on' }), {});

  const assertRequestSessionHasBeenPopulated = (
    req: ReturnType<typeof getHttpMocks>['req'],
    addPaymentErrorKey: AddPaymentErrorKey,
    checkedCheckboxIdList: PremiumPaymentsTableCheckboxId[],
  ) => {
    expect(req.session.addPaymentErrorKey).toBe(addPaymentErrorKey);

    const expectedCheckedCheckboxIds = checkedCheckboxIdList.reduce((obj, checkboxId) => ({ ...obj, [checkboxId]: true }), {});
    expect(req.session.checkedCheckboxIds).toEqual(expectedCheckedCheckboxIds);
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("renders the 'problem-with-service.njk' page when the request body is not an object", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body = 'not-an-object';

    const next = jest.fn();

    // Act
    validatePostAddPaymentRequestBody(req, res, next);

    // Assert
    expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
    expect(res._getRenderData()).toEqual({
      user: MOCK_TFM_SESSION_USER,
    });
    expect(next).not.toHaveBeenCalled();
  });

  describe('when the body is an empty object', () => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body = {};

    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toBe(REDIRECT_URL);
    });

    it(`populates the session with the 'no-fee-records-selected' error and no checked checkbox ids`, () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      assertRequestSessionHasBeenPopulated(req, 'no-fee-records-selected', []);
    });

    it("does not call the 'next' function", () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when the body contains checkbox ids with different payment currencies', () => {
    const checkedCheckboxIds = [getCheckboxId(1, 'GBP', 'TO_DO'), getCheckboxId(2, 'EUR', 'TO_DO')];
    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toBe(REDIRECT_URL);
    });

    it(`redirects to '${REDIRECT_URL}' with facility id filter if referer has one`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);
      req.headers.referer = 'some-url?facilityIdQuery=1234';

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toBe(`${REDIRECT_URL}?facilityIdQuery=1234`);
    });

    it(`populates the session with the 'different-fee-record-payment-currencies' error and the checked checkbox ids`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      assertRequestSessionHasBeenPopulated(req, 'different-fee-record-payment-currencies', checkedCheckboxIds);
    });

    it("does not call the 'next' function", () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when the body contains checkbox ids with different statuses', () => {
    const checkedCheckboxIds = [getCheckboxId(1, 'GBP', 'TO_DO'), getCheckboxId(2, 'GBP', 'DOES_NOT_MATCH')];
    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toBe(REDIRECT_URL);
    });

    it(`redirects to '${REDIRECT_URL}' with facility id filter if referer has one`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);
      req.headers.referer = 'some-url?facilityIdQuery=1234';

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toBe(`${REDIRECT_URL}?facilityIdQuery=1234`);
    });

    it(`populates the session with the 'different-fee-record-statuses' error and the checked checkbox ids`, () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      assertRequestSessionHasBeenPopulated(req, 'different-fee-record-statuses', checkedCheckboxIds);
    });

    it("does not call the 'next' function", () => {
      // Arrange
      const { req, res } = getHttpMocks();
      req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("when the body contains more than one checkbox id with the 'DOES_NOT_MATCH' status", () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const checkedCheckboxIds = [getCheckboxId(1, 'GBP', 'DOES_NOT_MATCH'), getCheckboxId(2, 'GBP', 'DOES_NOT_MATCH')];
    req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toBe(REDIRECT_URL);
    });

    it(`populates the session with the 'multiple-does-not-match-selected' error and the checked checkbox ids`, () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      assertRequestSessionHasBeenPopulated(req, 'multiple-does-not-match-selected', checkedCheckboxIds);
    });

    it("does not call the 'next' function", () => {
      // Act
      validatePostAddPaymentRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });

  it("calls the 'next' function when the body contains multiple checkbox ids with the 'TO_DO' fee record status", () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const checkedCheckboxIds = [getCheckboxId(1, 'GBP', 'TO_DO'), getCheckboxId(2, 'GBP', 'TO_DO')];
    req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

    const next = jest.fn();

    // Act
    validatePostAddPaymentRequestBody(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
  });

  it("calls the 'next' function when the body contains one checkbox id with the 'TO_DO' fee record status", () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const checkedCheckboxIds = [getCheckboxId(1, 'GBP', 'TO_DO')];
    req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

    const next = jest.fn();

    // Act
    validatePostAddPaymentRequestBody(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
  });

  it("calls the 'next' function when the body contains one checkbox id with the 'DOES_NOT_MATCH' fee record status", () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const checkedCheckboxIds = [getCheckboxId(1, 'GBP', 'DOES_NOT_MATCH')];
    req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds);

    const next = jest.fn();

    // Act
    validatePostAddPaymentRequestBody(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
  });
});
