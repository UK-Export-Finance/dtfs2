import { AuditDetails } from '@ukef/dtfs2-common/src/types/audit-details';
import {
  generatePortalAuditDetails,
  generateSystemAuditDetails,
  generateTfmAuditDetails,
} from '@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-details';
import { MOCK_TFM_USER } from '../mocks/test-users/mock-tfm-user';
import { MOCK_PORTAL_USER } from '../mocks/test-users/mock-portal-user';

type Params<T> = {
  makeRequest: (payload: T) => Promise<{ status: number; body: object }>;
  payloadWithoutAuditDetails: T & { auditDetails?: AuditDetails };
  validUserTypes: ('tfm' | 'portal' | 'system')[];
  successfulStatus?: number;
};

export const withValidateAuditDetailsTests = <T extends object>({
  makeRequest,
  payloadWithoutAuditDetails,
  validUserTypes,
  successfulStatus = 200,
}: Params<T>) => {
  it('should return 400 if no auditDetails provided', async () => {
    const { status, body } = await makeRequest({ ...payloadWithoutAuditDetails });

    expect(body).toEqual({ status: 400, message: 'Invalid auditDetails, Missing property `userType`' });
    expect(status).toBe(400);
  });

  const testCases = [
    {
      auditDetails: generateSystemAuditDetails(),
      expectedStatus: validUserTypes.includes('system') ? successfulStatus : 400,
    },
    {
      auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
      expectedStatus: validUserTypes.includes('portal') ? successfulStatus : 400,
    },
    {
      auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
      expectedStatus: validUserTypes.includes('tfm') ? successfulStatus : 400,
    },
  ];

  it.each(testCases)('it should have status $expectedStatus if the userType is $auditDetails.usertype', async ({ auditDetails, expectedStatus }) => {
    const { status, body } = await makeRequest({ ...payloadWithoutAuditDetails, auditDetails });

    expect(status).toBe(expectedStatus);
    expect('message' in body && body.message).toMatch(/Invalid auditDetails, userType must be/);
  });
};
