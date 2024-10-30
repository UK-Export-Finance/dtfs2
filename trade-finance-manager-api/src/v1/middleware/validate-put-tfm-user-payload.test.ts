import { getUpsertTfmUserRequestFailureTestCases, getUpsertTfmUserRequestSuccessTestCases } from '@ukef/dtfs2-common';
import { validateTfmPutUserPayload } from './validate-put-tfm-user-payload';
import { withValidatePayloadTests } from '../../../test-helpers';

describe('validatePutTfmUserPayload', () => {
  withValidatePayloadTests({
    validatePayload: validateTfmPutUserPayload,
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
