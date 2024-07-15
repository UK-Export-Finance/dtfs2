import { createRequest } from 'node-mocks-http';
import { getAndClearFieldsFromRedirectSessionData } from './get-and-clear-fields-from-redirect-session-data';
import { RemoveFeesFromPaymentErrorKey } from '../helpers';

type RedirectSessionData = {
  removeFeesFromPaymentErrorKey: RemoveFeesFromPaymentErrorKey | undefined;
};

describe('getAndClearFieldsFromRedirectSessionData', () => {
  const getMockRequest = ({ removeFeesFromPaymentErrorKey }: RedirectSessionData) =>
    createRequest({
      session: {
        removeFeesFromPaymentErrorKey,
      },
    });

  const assertSessionHasBeenCleared = (req: ReturnType<typeof getMockRequest>) => {
    expect(req.session.removeFeesFromPaymentErrorKey).toBeUndefined();
  };

  it('clears the session and returns an undefined errorSummary when the session error keys are undefined', () => {
    // Arrange
    const req = getMockRequest({
      removeFeesFromPaymentErrorKey: undefined,
    });

    // Act
    const { errors: { errorSummary } = {} } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(errorSummary).toBeUndefined();
  });

  it.each<RemoveFeesFromPaymentErrorKey>(['no-fee-records-selected', 'all-fee-records-selected'])(
    "clears the session and returns an array with a single error summary for the errorSummary when the removeFeesFromPaymentErrorKey is '%s'",
    (removeFeesFromPaymentErrorKey) => {
      // Arrange
      const req = getMockRequest({
        removeFeesFromPaymentErrorKey,
      });

      // Act
      const { errors: { errorSummary } = {} } = getAndClearFieldsFromRedirectSessionData(req);

      // Assert
      assertSessionHasBeenCleared(req);
      expect(errorSummary).toHaveLength(1);
      expect(errorSummary![0].text).toBeDefined();
      expect(errorSummary![0].href).toBeDefined();
    },
  );

  it('throws an error if the session removeFeesFromPaymentErrorKey is not recognised', () => {
    // Arrange
    const invalidRemoveFeesFromPaymentError = 'invalid-error' as RemoveFeesFromPaymentErrorKey;
    const req = getMockRequest({
      removeFeesFromPaymentErrorKey: invalidRemoveFeesFromPaymentError,
    });

    // Act / Assert
    expect(() => getAndClearFieldsFromRedirectSessionData(req)).toThrow(Error);
    assertSessionHasBeenCleared(req);
  });
});
