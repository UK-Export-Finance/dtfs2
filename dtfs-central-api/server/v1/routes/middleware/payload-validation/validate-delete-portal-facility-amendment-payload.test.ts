import { portalAmendmentDeleteEmailVariables } from '@ukef/dtfs2-common/test-helpers';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AUDIT_USER_TYPES } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { validateDeletePortalFacilityAmendmentPayload } from './validate-delete-portal-facility-amendment-payload';

const next = jest.fn();
console.error = jest.fn();
const validAuditDetails = generatePortalAuditDetails(aPortalUser()._id);
const portalAmendmentVariables = portalAmendmentDeleteEmailVariables();

describe('validateDeletePortalFacilityAmendmentPayload', () => {
  const invalidPayloads = [
    {
      description: 'auditDetails is undefined',
      payload: {
        auditDetails: undefined,
      },
    },
    {
      description: 'auditDetails is an empty object',
      payload: {
        auditDetails: {},
      },
    },
    {
      description: 'auditDetails.userType is undefined',
      payload: {
        auditDetails: {
          userType: undefined,
        },
      },
    },
    {
      description: 'auditDetails.id is invalid and type is portal',
      payload: {
        auditDetails: {
          userType: AUDIT_USER_TYPES.PORTAL,
          id: 'invalid',
        },
      },
    },
    {
      description: 'string field is undefined',
      payload: {
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

    // Act
    validateDeletePortalFacilityAmendmentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  const validPayloads = [
    {
      description: 'the payload is valid',
      payload: {
        auditDetails: validAuditDetails,
        ...portalAmendmentVariables,
      },
    },
  ];

  it.each(validPayloads)('should call next when $description', ({ payload }) => {
    // Arrange
    const { req, res } = createMocks({ body: payload });

    // Act
    validateDeletePortalFacilityAmendmentPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalledTimes(1);
    expect(res._isEndCalled()).toEqual(false);
  });
});
