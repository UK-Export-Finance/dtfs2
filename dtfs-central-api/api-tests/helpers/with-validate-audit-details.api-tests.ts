import { AuditDetails } from '@ukef/dtfs2-common/src/types/audit-details';
import {
  generatePortalAuditDetails,
  generateSystemAuditDetails,
  generateTfmAuditDetails,
} from '@ukef/dtfs2-common/src/helpers/change-stream/generate-audit-details';
import { MOCK_TFM_USER } from '../mocks/test-users/mock-tfm-user';
import { MOCK_PORTAL_USER } from '../mocks/test-users/mock-portal-user';

type Params = {
  makeRequest: (auditDetails?: AuditDetails) => Promise<{ status: number; body: object }>;
  validUserTypes: ('tfm' | 'portal' | 'system')[];
};

export const withValidateAuditDetailsTests = ({ makeRequest, validUserTypes }: Params) => {
  describe('when validating audit details', () => {
    it('should return 400 if no auditDetails provided', async () => {
      const { status, body } = await makeRequest();

      expect(body).toEqual({ status: 400, message: 'Invalid auditDetails, Missing property `userType`' });
      expect(status).toBe(400);
    });

    const testCases = [
      {
        auditDetails: generateSystemAuditDetails(),
        expectedStatus: validUserTypes.includes('system') ? 200 : 400,
      },
      {
        auditDetails: generatePortalAuditDetails(MOCK_PORTAL_USER._id),
        expectedStatus: validUserTypes.includes('portal') ? 200 : 400,
      },
      {
        auditDetails: generateTfmAuditDetails(MOCK_TFM_USER._id),
        expectedStatus: validUserTypes.includes('tfm') ? 200 : 400,
      },
    ];

    it.each(testCases)('it should have status $expectedStatus if the userType is $auditDetails.usertype', async ({ auditDetails, expectedStatus }) => {
      const { status, body } = await makeRequest(auditDetails);

      expect(status).toBe(expectedStatus);
      if (expectedStatus === 400) {
        expect(body).toEqual({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: expect.stringContaining('Invalid auditDetails, userType must be'),
          status: 400,
        });
      }
    });
  });
};
