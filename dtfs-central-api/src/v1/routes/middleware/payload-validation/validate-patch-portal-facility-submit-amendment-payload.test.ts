import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AUDIT_USER_TYPES, PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { validatePatchPortalFacilitySubmitAmendmentPayload } from './validate-patch-portal-facility-submit-amendment-payload';

const validAuditDetails = generatePortalAuditDetails(aPortalUser()._id);
const facilityId = '6597dffeb5ef5ff4267e5044';
const referenceNumber = `${facilityId}-01`;

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
