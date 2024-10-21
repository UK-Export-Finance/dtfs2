import { getUserUpsertRequestFailureTestCases, getUserUpsertRequestSuccessTestCases } from '@ukef/dtfs2-common';
import { validatePutUserPayload } from './validate-put-user-payload';
import { withValidatePayloadTests } from '../../../test-helpers';

describe('validatePutUserPayload', () => {
  withValidatePayloadTests({
    validatePayload: validatePutUserPayload,
    failureTestCases: getUserUpsertRequestFailureTestCases({
      getTestObjectWithUpdatedUserUpsertRequestParams: aPayloadWithUpdatedUserUpsertRequest,
    }),
    successTestCases: getUserUpsertRequestSuccessTestCases({
      getTestObjectWithUpdatedUserUpsertRequestParams: aPayloadWithUpdatedUserUpsertRequest,
    }),
  });

  function aPayloadWithUpdatedUserUpsertRequest(userUpsertRequest: unknown) {
    return userUpsertRequest;
  }
});
