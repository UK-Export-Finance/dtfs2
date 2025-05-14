import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AUDIT_USER_TYPES, PORTAL_AMENDMENT_STATUS, portalAmendmentToUkefEmailVariables } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { validatePatchPortalFacilitySubmitAmendmentPayload } from './validate-patch-portal-facility-submit-amendment-payload';

const validAuditDetails = generatePortalAuditDetails(aPortalUser()._id);
const facilityId = '6597dffeb5ef5ff4267e5044';
const referenceNumber = `${facilityId}-01`;
const portalAmendmentVariables = portalAmendmentToUkefEmailVariables();

describe('validatePatchPortalFacilitySubmitAmendmentPayload', () => {
  const invalidPayloads = [
    {
      description: 'status is undefined',
      referenceNumber,
      payload: {
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'status is invalid',
      payload: {
        newStatus: 'invalid',
        referenceNumber,
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'referenceNumber is undefined',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber: undefined,
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'auditDetails is undefined',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
        auditDetails: undefined,
      },
    },
    {
      description: 'auditDetails is an empty object',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
        auditDetails: {},
      },
    },
    {
      description: 'auditDetails.userType is undefined',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
        auditDetails: {
          userType: undefined,
        },
      },
    },
    {
      description: 'auditDetails.id is invalid and type is portal',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber,
        auditDetails: {
          userType: AUDIT_USER_TYPES.PORTAL,
          id: 'invalid',
        },
      },
    },
    {
      description: 'string field is undefined',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
        auditDetails: validAuditDetails,
        ...portalAmendmentVariables,
        emailVariables: {
          ...portalAmendmentVariables.emailVariables,
          exporterName: undefined,
        },
      },
    },
    {
      description: 'string field is number',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
        auditDetails: validAuditDetails,
        ...portalAmendmentVariables,
        emailVariables: {
          ...portalAmendmentVariables.emailVariables,
          ukefDealId: 12345,
        },
      },
    },
    {
      description: 'string field is date',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
        auditDetails: validAuditDetails,
        ...portalAmendmentVariables,
        emailVariables: {
          ...portalAmendmentVariables.emailVariables,
          newFacilityEndDate: new Date(),
        },
      },
    },
  ];

  it.each(invalidPayloads)(`should return ${HttpStatusCode.BadRequest} when $description`, ({ payload }) => {
    // Arrange
    const { req, res } = createMocks({ body: payload });
    const next = jest.fn();

    // Act
    validatePatchPortalFacilitySubmitAmendmentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when the payload is valid', () => {
    // Arrange
    const payload = {
      newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
      referenceNumber,
      auditDetails: validAuditDetails,
      ...portalAmendmentVariables,
    };

    const { req, res } = createMocks({ body: payload });
    const next = jest.fn();

    // Act
    validatePatchPortalFacilitySubmitAmendmentPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
