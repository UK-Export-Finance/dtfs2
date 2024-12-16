import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AUDIT_USER_TYPES } from '@ukef/dtfs2-common';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import { aPortalUser } from '../../../../../test-helpers';
import { validatePatchPortalFacilityAmendmentPayload } from './validate-patch-portal-facility-amendment-payload';

const validAuditDetails = generatePortalAuditDetails(aPortalUser()._id);

describe('validatePatchPortalFacilityAmendmentPayload', () => {
  const invalidPayloads = [
    {
      description: 'no update is provided',
      payload: {
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update is not an object',
      payload: {
        update: 'not an object',
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update has additional properties',
      payload: {
        update: {
          extra: 'property',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.changeCoverEndDate is not a boolean',
      payload: {
        update: {
          changeCoverEndDate: 'true',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.coverEndDate is not an integer',
      payload: {
        update: {
          coverEndDate: 'not an integer',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.currentCoverEndDate is not an integer',
      payload: {
        update: {
          currentCoverEndDate: 'not an integer',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.isUsingFacilityEndDate is not a boolean',
      payload: {
        update: {
          isUsingFacilityEndDate: 'not a boolean',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.facilityEndDate is not a number',
      payload: {
        update: {
          facilityEndDate: 'not a number',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.facilityEndDate is negative',
      payload: {
        update: {
          facilityEndDate: -23,
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.bankReviewDate is not a number',
      payload: {
        update: {
          bankReviewDate: 'not a number',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.bankReviewDate is negative',
      payload: {
        update: {
          bankReviewDate: -23,
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.changeFacilityValue is not a boolean',
      payload: {
        update: {
          changeFacilityValue: 'not a boolean',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.value is not a number',
      payload: {
        update: {
          value: 'not a number',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.currentValue is not a number',
      payload: {
        update: {
          currentValue: 'not a number',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.currency is not a valid enum value',
      payload: {
        update: {
          currency: 'invalid currency',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.ukefExposure is not a number',
      payload: {
        update: {
          ukefExposure: 'not a number',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'update.coveredPercentage is not a number',
      payload: {
        update: {
          coveredPercentage: 'not a number',
        },
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'auditDetails is undefined',
      payload: {
        update: aPortalFacilityAmendmentUserValues(),
        auditDetails: undefined,
      },
    },
    {
      description: 'auditDetails is an empty object',
      payload: {
        update: aPortalFacilityAmendmentUserValues(),
        auditDetails: {},
      },
    },
    {
      description: 'auditDetails.userType is undefined',
      payload: {
        update: aPortalFacilityAmendmentUserValues(),

        auditDetails: {
          userType: undefined,
        },
      },
    },
    {
      description: 'auditDetails.id is invalid and type is portal',
      payload: {
        update: aPortalFacilityAmendmentUserValues(),

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
    validatePatchPortalFacilityAmendmentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  const validPayloads = [
    {
      description: 'the payload is valid',
      payload: {
        update: aPortalFacilityAmendmentUserValues(),
        auditDetails: validAuditDetails,
      },
    },

    {
      description: 'the update is an empty object',
      payload: {
        update: {},
        auditDetails: validAuditDetails,
      },
    },
  ];

  it.each(validPayloads)('should call next when $description', ({ payload }) => {
    // Arrange
    const { req, res } = createMocks({ body: payload });
    const next = jest.fn();

    // Act
    validatePatchPortalFacilityAmendmentPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
