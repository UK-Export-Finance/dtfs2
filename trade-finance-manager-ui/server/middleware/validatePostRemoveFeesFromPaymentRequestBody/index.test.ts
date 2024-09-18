import httpMocks from 'node-mocks-http';
import { validatePostRemoveFeesFromPaymentRequestBody } from '.';
import { MOCK_TFM_SESSION_USER } from '../../test-mocks/mock-tfm-session-user';
import { RemoveFeesFromPaymentErrorKey } from '../../controllers/utilisation-reports/helpers';
import { EditPaymentsTableCheckboxId } from '../../types/edit-payments-table-checkbox-id';
import { EditPaymentFormValues } from '../../types/edit-payment-form-values';
import { RECONCILIATION_FOR_REPORT_TABS } from '../../constants/reconciliation-for-report-tabs';

console.error = jest.fn();

describe('validatePostRemoveFeesFromPaymentRequestBody', () => {
  const REPORT_ID = 1;
  const PAYMENT_ID = 2;
  const REDIRECT_TAB = RECONCILIATION_FOR_REPORT_TABS.PREMIUM_PAYMENTS;

  const REDIRECT_URL = `/utilisation-reports/${REPORT_ID}/edit-payment/${PAYMENT_ID}?redirectTab=${REDIRECT_TAB}`;

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
      query: {
        redirectTab: REDIRECT_TAB,
      },
    });

  const getCheckboxId = (feeRecordId: number): EditPaymentsTableCheckboxId => `feeRecordId-${feeRecordId}`;

  const getRequestBodyFromCheckboxIds = (checkboxIds: EditPaymentsTableCheckboxId[], totalSelectableFeeRecords: number) =>
    checkboxIds.reduce((obj, checkboxId) => ({ ...obj, [checkboxId]: 'on' }), { totalSelectableFeeRecords });

  const assertRequestSessionHasBeenPopulated = (
    req: ReturnType<typeof getHttpMocks>['req'],
    removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey,
    editPaymentFormValues: EditPaymentFormValues,
  ) => {
    expect(req.session.removeFeesFromPaymentErrorKey).toBe(removeFeesFromPaymentErrorKey);
    expect(req.session.editPaymentFormValues).toEqual(editPaymentFormValues);
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
    validatePostRemoveFeesFromPaymentRequestBody(req, res, next);

    // Assert
    expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
    expect(res._getRenderData()).toEqual({
      user: MOCK_TFM_SESSION_USER,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("renders the 'problem-with-service.njk' page when the request body is an empty object", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body = {};

    const next = jest.fn();

    // Act
    validatePostRemoveFeesFromPaymentRequestBody(req, res, next);

    // Assert
    expect(res._getRenderView()).toBe('_partials/problem-with-service.njk');
    expect(res._getRenderData()).toEqual({
      user: MOCK_TFM_SESSION_USER,
    });
    expect(next).not.toHaveBeenCalled();
  });

  describe('when the body contains no edit payment form values and the page is redirected with an error', () => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body = {
      totalSelectableFeeRecords: 7,
    };

    const next = jest.fn();

    it(`populates the session with an undefined set of edit payment form values`, () => {
      // Act
      validatePostRemoveFeesFromPaymentRequestBody(req, res, next);

      // Assert
      const expectedEditPaymentFormValues: EditPaymentFormValues = {
        paymentDate: {},
      };
      assertRequestSessionHasBeenPopulated(req, 'no-fee-records-selected', expectedEditPaymentFormValues);
    });
  });

  describe('when the body contains no checkbox ids', () => {
    // Arrange
    const { req, res } = getHttpMocks();
    req.body = {
      totalSelectableFeeRecords: 7,
      paymentAmount: '1000',
      'paymentDate-day': '7',
    };

    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Act
      validatePostRemoveFeesFromPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toBe(REDIRECT_URL);
    });

    it(`populates the session with the 'no-fee-records-selected' error and the extracted edit payment form values`, () => {
      // Act
      validatePostRemoveFeesFromPaymentRequestBody(req, res, next);

      // Assert
      const expectedEditPaymentFormValues: EditPaymentFormValues = {
        paymentAmount: '1000',
        paymentDate: {
          day: '7',
        },
      };
      assertRequestSessionHasBeenPopulated(req, 'no-fee-records-selected', expectedEditPaymentFormValues);
    });

    it("does not call the 'next' function", () => {
      // Act
      validatePostRemoveFeesFromPaymentRequestBody(req, res, next);

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
      validatePostRemoveFeesFromPaymentRequestBody(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
    });
  });

  describe('when the body contains all possible checkbox ids', () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const checkedCheckboxIds = [getCheckboxId(7), getCheckboxId(77)];
    req.body = {
      ...getRequestBodyFromCheckboxIds(checkedCheckboxIds, checkedCheckboxIds.length),
      paymentAmount: '1000',
      'paymentDate-day': '7',
    };

    const next = jest.fn();

    it(`redirects to '${REDIRECT_URL}'`, () => {
      // Act
      validatePostRemoveFeesFromPaymentRequestBody(req, res, next);

      // Assert
      expect(res._getRedirectUrl()).toBe(REDIRECT_URL);
    });

    it(`populates the session with the 'all-fee-records-selected' error and the extracted edit payment form values`, () => {
      // Act
      validatePostRemoveFeesFromPaymentRequestBody(req, res, next);

      // Assert
      const expectedEditPaymentFormValues: EditPaymentFormValues = {
        paymentAmount: '1000',
        paymentDate: {
          day: '7',
        },
      };
      assertRequestSessionHasBeenPopulated(req, 'all-fee-records-selected', expectedEditPaymentFormValues);
    });

    it("does not call the 'next' function", () => {
      // Act
      validatePostRemoveFeesFromPaymentRequestBody(req, res, next);

      // Assert
      expect(next).not.toHaveBeenCalled();
    });
  });
});
