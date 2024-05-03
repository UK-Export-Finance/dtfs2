const { produce } = require('immer');

const withValidateIsTrustedFieldTests = ({
  payload: completePayload,
  makeRequest,
  successCode,
  deleteUser,
  isRequired,
}) => {
  describe('when validating the isTrusted field', () => {
    const IS_TRUSTED_MISSING_ERROR_TEXT = 'Select whether the user is trusted or not.';

    const IS_TRUSTED_NOT_BOOLEAN_ERROR_TEXT = 'Invalid value provided for the user isTrusted field (must be boolean).';

    beforeEach(async () => await deleteUser());

    afterAll(async () => await deleteUser());

    if (isRequired) {
      isTrustedRequiredTests();
    } else {
      isTrustedNotRequiredTests();
    }

    function isTrustedRequiredTests() {
      describe('when the isTrusted field is required', () => {
        whenTheIsTrustedFieldIsABoolean({ assertion: itResolvesWithSuccess });

        whenTheIsTrustedFieldIsNotPresent({
          assertion: itRejectsWithIsTrustedFieldIsMissingError,
        });

        whenTheIsTrustedFieldIsNotABoolean({
          assertion: itRejectsWithIsTrustedFieldIsNotABooleanError,
        });
      });
    }

    function isTrustedNotRequiredTests() {
      describe('when the isTrusted field is not required', () => {
        whenTheIsTrustedFieldIsABoolean({ assertion: itResolvesWithSuccess });

        whenTheIsTrustedFieldIsNotPresent({
          assertion: itResolvesWithSuccess,
        });

        whenTheIsTrustedFieldIsNotABoolean({
          assertion: itRejectsWithIsTrustedFieldIsNotABooleanError,
        });
      });
    }
    function whenTheIsTrustedFieldIsABoolean({ assertion }) {
      describe('when the isTrusted field is a boolean', () => {
        const validBooleanTestCases = [
          { isTrustedValue: true, description: 'true' },
          { isTrustedValue: false, description: 'false' },
        ];
        describe.each(validBooleanTestCases)('when the isTrusted field is %s', ({ isTrustedValue }) => {
          const payloadWithIsTrustedAsBoolean = produce(completePayload, (draftRequest) => {
            draftRequest.isTrusted = isTrustedValue;
          });

          assertion({ payload: payloadWithIsTrustedAsBoolean });
        });
      });
    }

    function whenTheIsTrustedFieldIsNotPresent({ assertion }) {
      describe('when the isTrusted field is not provided', () => {
        const payloadWithoutIsTrusted = produce(completePayload, (draftRequest) => {
          delete draftRequest.isTrusted;
        });

        assertion({ payload: payloadWithoutIsTrusted });
      });
    }

    function whenTheIsTrustedFieldIsNotABoolean({ assertion }) {
      describe('when the isTrusted field is not a boolean', () => {
        const invalidBooleanTestCases = [
          { isTrustedValue: 'true', description: 'string of "true"' },
          { isTrustedValue: 'false', description: 'string of "false"' },
          { isTrustedValue: '', description: 'empty string' },
          { isTrustedValue: null, description: 'null' },
          { isTrustedValue: {}, description: 'empty object' },
          { isTrustedValue: [], description: 'empty array' },
          { isTrustedValue: 0, description: 'falsey number (0)' },
          { isTrustedValue: 1, description: 'truthy number (1)' },
        ];
        describe.each(invalidBooleanTestCases)('when the isTrusted field is $description', ({ isTrustedValue }) => {
          const payloadWithIsTrustedAsNonBoolean = produce(completePayload, (draftRequest) => {
            draftRequest.isTrusted = isTrustedValue;
          });

          assertion({ payload: payloadWithIsTrustedAsNonBoolean });
        });
      });
    }

    function itRejectsWithIsTrustedFieldIsMissingError({ payload }) {
      it('rejects with a "is trusted field is missing" error', async () => {
        const { status, body } = await makeRequest(payload);

        expect(status).toEqual(400);
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.isTrusted.text).toEqual(IS_TRUSTED_MISSING_ERROR_TEXT);
      });
    }

    function itRejectsWithIsTrustedFieldIsNotABooleanError({ payload }) {
      it('rejects with "isTrusted field is not a boolean" error', async () => {
        const { status, body } = await makeRequest(payload);

        expect(status).toEqual(400);
        expect(body.success).toEqual(false);
        expect(body.errors.errorList.isTrusted.text).toEqual(IS_TRUSTED_NOT_BOOLEAN_ERROR_TEXT);
      });
    }

    function itResolvesWithSuccess({ payload }) {
      it('resolves with success', async () => {
        const { status, body } = await makeRequest(payload);

        expect(status).toEqual(successCode);
        expect(body.success).toEqual(true);
      });
    }
  });
};

module.exports = { withValidateIsTrustedFieldTests };
