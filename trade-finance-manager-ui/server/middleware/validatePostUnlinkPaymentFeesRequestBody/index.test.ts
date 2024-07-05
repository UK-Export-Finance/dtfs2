import httpMocks from 'node-mocks-http';
import { validatePostUnlinkPaymentFeesRequestBody } from '.';
import { MOCK_TFM_SESSION_USER } from '../../test-mocks/mock-tfm-session-user';
import { UnlinkPaymentFeesErrorKey } from '../../controllers/utilisation-reports/helpers';
import { EditPaymentsTableCheckboxId } from '../../types/edit-payments-table-checkbox-id';

console.error = jest.fn();

describe('validatePostUnlinkPaymentFeesRequestBody', () => {
  const REPORT_ID = 1;
  const PAYMENT_ID = 2;

  const REDIRECT_URL = `/utilisation-reports/${REPORT_ID}/edit-payment/${PAYMENT_ID}`;

  const getHttpMocks = () =>
    httpMocks.createMocks({
      session: {
        user: MOCK_TFM_SESSION_USER,
        userToken: 'user-token',
      },
      params: {
        reportId: REPORT_ID,
        paymentId: PAYMENT_ID,
      },
    });

  const getCheckboxId = (feeRecordId: number): EditPaymentsTableCheckboxId => `feeRecordId-${feeRecordId}`;

  const getRequestBodyFromCheckboxIds = (checkboxIds: EditPaymentsTableCheckboxId[], totalSelectableFeeRecords: number) =>
    checkboxIds.reduce((obj, checkboxId) => ({ ...obj, [checkboxId]: 'on' }), { totalSelectableFeeRecords });

  const assertRequestSessionHasBeenPopulated = (req: ReturnType<typeof getHttpMocks>['req'], unlinkPaymentFeesErrorKey: UnlinkPaymentFeesErrorKey) => {
    expect(req.session.unlinkPaymentFeesErrorKey).toBe(unlinkPaymentFeesErrorKey);
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
    validatePostUnlinkPaymentFeesRequestBody(req, res, next);

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
      validatePostUnlinkPaymentFeesRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toBe(REDIRECT_URL);
    });

    it(`populates the session with the 'no-fee-records-selected' error`, () => {
      // Act
      validatePostUnlinkPaymentFeesRequestBody(req, res, next);

      // Assert
      assertRequestSessionHasBeenPopulated(req, 'no-fee-records-selected');
    });

    it("does not call the 'next' function", () => {
      // Act
      validatePostUnlinkPaymentFeesRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('when the body contains at least one, but not all possible, checkbox ids', () => {
    // Arrange
    const { req, res } = getHttpMocks();

    const checkedCheckboxIds = [getCheckboxId(7), getCheckboxId(77)];
    req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds, checkedCheckboxIds.length + 1);

    const next = jest.fn();

    it("does call the 'next' function", () => {
      // Act
      validatePostUnlinkPaymentFeesRequestBody(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('when the body contains all possible checkbox ids', () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const checkedCheckboxIds = [getCheckboxId(7), getCheckboxId(77)];
    req.body = getRequestBodyFromCheckboxIds(checkedCheckboxIds, checkedCheckboxIds.length);

    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Act
      validatePostUnlinkPaymentFeesRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toBe(REDIRECT_URL);
    });

    it(`populates the session with the 'all-fee-records-selected' error and no checked checkbox ids`, () => {
      // Act
      validatePostUnlinkPaymentFeesRequestBody(req, res, next);

      // Assert
      assertRequestSessionHasBeenPopulated(req, 'all-fee-records-selected');
    });

    it("does not call the 'next' function", () => {
      // Act
      validatePostUnlinkPaymentFeesRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });
});
