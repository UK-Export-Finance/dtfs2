import { getUpsertTfmUserRequestFailureTestCases, getUpsertTfmUserRequestSuccessTestCases } from '@ukef/dtfs2-common';
import { validatePutUserPayload } from './validate-put-user-payload';
import { withValidatePayloadTests } from '../../../test-helpers';

describe('validatePutUserPayload', () => {
  withValidatePayloadTests({
    validatePayload: validatePutUserPayload,
    failureTestCases: getUpsertTfmUserRequestFailureTestCases({
      getTestObjectWithUpdatedUpsertTfmUserRequestParams: aPayloadWithUpdatedUpsertTfmUserRequest,
    }),
    successTestCases: getUpsertTfmUserRequestSuccessTestCases({
      getTestObjectWithUpdatedUpsertTfmUserRequestParams: aPayloadWithUpdatedUpsertTfmUserRequest,
    }),
  });

  function aPayloadWithUpdatedUpsertTfmUserRequest(upsertTfmUserRequest: unknown) {
    return upsertTfmUserRequest;
  }
});
