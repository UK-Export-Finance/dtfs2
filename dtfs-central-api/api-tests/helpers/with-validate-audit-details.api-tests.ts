import { Response } from 'supertest';
import { API_ERROR_CODE, ApiErrorResponseBody, AUDIT_USER_TYPES_AS_ARRAY, AuditDetails, AuditUserTypes } from '@ukef/dtfs2-common';
import {
  generateNoUserLoggedInAuditDetails,
  generatePortalAuditDetails,
  generateSystemAuditDetails,
  generateTfmAuditDetails,
} from '@ukef/dtfs2-common/change-stream';
import { MOCK_TFM_USER } from '../mocks/test-users/mock-tfm-user';
import { MOCK_PORTAL_USER } from '../mocks/test-users/mock-portal-user';

interface ApiErrorResponse extends Response {
  body: ApiErrorResponseBody;
}

type MakeRequest = (auditDetails?: AuditDetails) => Promise<ApiErrorResponse>;

type Params = {
  makeRequest: MakeRequest;
  validUserTypes: AuditUserTypes[];
};

export const withValidateAuditDetailsTests = ({ makeRequest, validUserTypes = AUDIT_USER_TYPES_AS_ARRAY }: Params) => {
  describe('when validating audit details', () => {
    const { validAuditDetails, invalidAuditDetails } = getValidAndInvalidAuditDetails(validUserTypes);

    withValidAuditDetailsTests(validAuditDetails, makeRequest);

    if (invalidAuditDetails.length) {
      withInvalidAuditDetailsTests(invalidAuditDetails, makeRequest);
    }

    it(`should return 400 (Bad request) and set the body 'code' field to '${API_ERROR_CODE.INVALID_AUDIT_DETAILS}' if no auditDetails provided`, async () => {
      const { status, body } = await makeRequest();

      expect(status).toBe(400);
      expect(body.code).toBe(API_ERROR_CODE.INVALID_AUDIT_DETAILS);
    });
  });
};

function withValidAuditDetailsTests(validAuditDetails: AuditDetails[], makeRequest: MakeRequest) {
  it.each(validAuditDetails)('it should return status 200 if the userType is $userType', async (auditDetails) => {
    const { status } = await makeRequest(auditDetails);

    expect(status).toBe(200);
  });
}

function withInvalidAuditDetailsTests(invalidAuditDetails: AuditDetails[], makeRequest: MakeRequest) {
  it.each(invalidAuditDetails)(
    `it should return status 400 (Bad request) and set the body 'code' field to '${API_ERROR_CODE.INVALID_AUDIT_DETAILS}' if the userType is '$userType'`,
    async (auditDetails) => {
      const { status, body } = await makeRequest(auditDetails);

      expect(status).toBe(400);
      expect(body.code).toBe(API_ERROR_CODE.INVALID_AUDIT_DETAILS);
    },
  );
}

function getValidAndInvalidAuditDetails(validUserTypes: AuditUserTypes[]) {
  const allAuditDetails = [
    generateSystemAuditDetails(),
    generatePortalAuditDetails(MOCK_PORTAL_USER._id),
    generateTfmAuditDetails(MOCK_TFM_USER._id),
    generateNoUserLoggedInAuditDetails(),
  ];

  const validAuditDetails: AuditDetails[] = [];
  const invalidAuditDetails: AuditDetails[] = [];

  allAuditDetails.forEach((auditDetails) => {
    if (validUserTypes.includes(auditDetails.userType)) {
      validAuditDetails.push(auditDetails);
    } else {
      invalidAuditDetails.push(auditDetails);
    }
  });
  return { validAuditDetails, invalidAuditDetails };
}
