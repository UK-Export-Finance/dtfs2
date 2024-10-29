import { getUpsertUserRequestFailureTestCases, getUpsertUserRequestSuccessTestCases } from '@ukef/dtfs2-common';
import { validatePutUserPayload } from './validate-put-user-payload';
import { withValidatePayloadTests } from '../../../test-helpers';

describe('validatePutUserPayload', () => {
  withValidatePayloadTests({
    validatePayload: validatePutUserPayload,
    failureTestCases: getUpsertUserRequestFailureTestCases({
      getTestObjectWithUpdatedUpsertUserRequestParams: aPayloadWithUpdatedUserUpsertRequest,
    }),
    successTestCases: getUpsertUserRequestSuccessTestCases({
      getTestObjectWithUpdatedUpsertUserRequestParams: aPayloadWithUpdatedUserUpsertRequest,
    }),
  });

  function aPayloadWithUpdatedUserUpsertRequest(userUpsertRequest: unknown) {
    return userUpsertRequest;
  }
});
