import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AUDIT_USER_TYPES, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { validatePatchPortalFacilityAmendmentStatusPayload } from './validate-patch-portal-facility-amendment-status-payload';

const validAuditDetails = generatePortalAuditDetails(aPortalUser()._id);

describe('validatePatchPortalFacilityAmendmentStatusPayload', () => {
  const invalidPayloads = [
    {
      description: 'status is undefined',
      payload: {
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'status is invalid',
      payload: {
        newStatus: 'invalid',
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'auditDetails is undefined',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
        auditDetails: undefined,
      },
    },
    {
      description: 'auditDetails is an empty object',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
        auditDetails: {},
      },
    },
    {
      description: 'auditDetails.userType is undefined',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
        auditDetails: {
          userType: undefined,
        },
      },
    },
    {
      description: 'auditDetails.id is invalid and type is portal',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
        auditDetails: {
          userType: AUDIT_USER_TYPES.PORTAL,
          id: 'invalid',
        },
      },
    },
  ];

  it.each(invalidPayloads)('should return 400 when $description', ({ payload }) => {
    // Arrange
    const { req, res } = createMocks({ body: payload });
    const next = jest.fn();

    // Act
    validatePatchPortalFacilityAmendmentStatusPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next when the payload is valid', () => {
    // Arrange
    const payload = {
      newStatus: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
      auditDetails: validAuditDetails,
    };

    const { req, res } = createMocks({ body: payload });
    const next = jest.fn();

    // Act
    validatePatchPortalFacilityAmendmentStatusPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
