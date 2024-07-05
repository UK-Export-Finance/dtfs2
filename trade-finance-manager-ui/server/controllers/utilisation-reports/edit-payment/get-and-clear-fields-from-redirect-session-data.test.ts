import { createRequest } from 'node-mocks-http';
import { getAndClearFieldsFromRedirectSessionData } from './get-and-clear-fields-from-redirect-session-data';
import { UnlinkPaymentFeesErrorKey } from '../helpers';

type RedirectSessionData = {
  unlinkPaymentFeesErrorKey: UnlinkPaymentFeesErrorKey | undefined;
};

describe('getAndClearFieldsFromRedirectSessionData', () => {
  const getMockRequest = ({ unlinkPaymentFeesErrorKey }: RedirectSessionData) =>
    createRequest({
      session: {
        unlinkPaymentFeesErrorKey,
      },
    });

  const assertSessionHasBeenCleared = (req: ReturnType<typeof getMockRequest>) => {
    expect(req.session.unlinkPaymentFeesErrorKey).toBeUndefined();
  };

  it('clears the session and returns an undefined errorSummary when the session error keys are undefined', () => {
    // Arrange
    const req = getMockRequest({
      unlinkPaymentFeesErrorKey: undefined,
    });

    // Act
    const { errors: { errorSummary } = {} } = getAndClearFieldsFromRedirectSessionData(req);

    // Assert
    assertSessionHasBeenCleared(req);
    expect(errorSummary).toBeUndefined();
  });

  it.each<UnlinkPaymentFeesErrorKey>(['no-fee-records-selected', 'all-fee-records-selected'])(
    "clears the session and returns an array with a single error summary for the errorSummary when the unlinkPaymentFeesErrorKey is '%s'",
    (unlinkPaymentFeesErrorKey) => {
      // Arrange
      const req = getMockRequest({
        unlinkPaymentFeesErrorKey,
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

  it('throws an error if the session unlinkPaymentFeesErrorKey is not recognised', () => {
    // Arrange
    const invalidUnlinkPaymentFeesError = 'invalid-error' as UnlinkPaymentFeesErrorKey;
    const req = getMockRequest({
      unlinkPaymentFeesErrorKey: invalidUnlinkPaymentFeesError,
    });

    // Act / Assert
    expect(() => getAndClearFieldsFromRedirectSessionData(req)).toThrow(Error);
    assertSessionHasBeenCleared(req);
  });
});
