import { createRequest } from 'node-mocks-http';
import { getAndClearFieldsFromRedirectSessionData } from './get-and-clear-fields-from-redirect-session-data';
import { RemoveFeesFromPaymentGroupErrorKey } from '../helpers';

type RedirectSessionData = {
  removeFeesFromPaymentGroupErrorKey: RemoveFeesFromPaymentGroupErrorKey | undefined;
};

describe('getAndClearFieldsFromRedirectSessionData', () => {
  const getMockRequest = ({ removeFeesFromPaymentGroupErrorKey }: RedirectSessionData) =>
    createRequest({
      session: {
        removeFeesFromPaymentGroupErrorKey,
      },
    });

  const assertSessionHasBeenCleared = (req: ReturnType<typeof getMockRequest>) => {
    expect(req.session.removeFeesFromPaymentGroupErrorKey).toBeUndefined();
  };

  it('clears the session and returns an undefined errorSummary when the session error keys are undefined', () => {
    // Arrange
    const req = getMockRequest({
      removeFeesFromPaymentGroupErrorKey: undefined,
    });

    // Act
    const { errors: { errorSummary } = {} } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(errorSummary).toBeUndefined();
  });

  it.each<RemoveFeesFromPaymentGroupErrorKey>(['no-fee-records-selected', 'all-fee-records-selected'])(
    "clears the session and returns an array with a single error summary for the errorSummary when the removeFeesFromPaymentGroupErrorKey is '%s'",
    (removeFeesFromPaymentGroupErrorKey) => {
      // Arrange
      const req = getMockRequest({
        removeFeesFromPaymentGroupErrorKey,
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

  it('throws an error if the session removeFeesFromPaymentGroupErrorKey is not recognised', () => {
    // Arrange
    const invalidRemoveFeesFromPaymentGroupError = 'invalid-error' as RemoveFeesFromPaymentGroupErrorKey;
    const req = getMockRequest({
      removeFeesFromPaymentGroupErrorKey: invalidRemoveFeesFromPaymentGroupError,
    });

    // Act / Assert
    expect(() => getAndClearFieldsFromRedirectSessionData(req)).toThrow(Error);
    assertSessionHasBeenCleared(req);
  });
});
