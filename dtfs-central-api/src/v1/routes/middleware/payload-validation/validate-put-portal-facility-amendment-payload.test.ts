import { ObjectId } from 'mongodb';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AnyObject, AUDIT_USER_TYPES } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import { generatePortalAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aPortalUser } from '../../../../../test-helpers';
import { validatePutPortalFacilityAmendmentPayload } from './validate-put-portal-facility-amendment-payload';

const validDealId = new ObjectId().toString();
const validAuditDetails = generatePortalAuditDetails(aPortalUser()._id);
const validAmendment = JSON.parse(JSON.stringify(aPortalFacilityAmendmentUserValues())) as AnyObject;

describe('validatePutPortalFacilityAmendmentPayload', () => {
  const invalidPayloads = [
    {
      description: 'no amendment is provided',
      payload: {
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment is not an object',
      payload: {
        amendment: 'not an object',
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment has additional properties',
      payload: {
        amendment: {
          extra: 'property',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.changeCoverEndDate is not a boolean',
      payload: {
        amendment: {
          changeCoverEndDate: 'true',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.coverEndDate is not an integer',
      payload: {
        amendment: {
          coverEndDate: 'not an integer',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.currentCoverEndDate is not an integer',
      payload: {
        amendment: {
          currentCoverEndDate: 'not an integer',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.isUsingFacilityEndDate is not a boolean',
      payload: {
        amendment: {
          isUsingFacilityEndDate: 'not a boolean',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.facilityEndDate is not a number',
      payload: {
        amendment: {
          facilityEndDate: 'not a number',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.facilityEndDate is negative',
      payload: {
        amendment: {
          facilityEndDate: -23,
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.bankReviewDate is not a number',
      payload: {
        amendment: {
          bankReviewDate: 'not a number',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.bankReviewDate is negative',
      payload: {
        amendment: {
          bankReviewDate: -23,
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.changeFacilityValue is not a boolean',
      payload: {
        amendment: {
          changeFacilityValue: 'not a boolean',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.value is not a number',
      payload: {
        amendment: {
          value: 'not a number',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.currentValue is not a number',
      payload: {
        amendment: {
          currentValue: 'not a number',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.currency is not a valid enum value',
      payload: {
        amendment: {
          currency: 'invalid currency',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.ukefExposure is not a number',
      payload: {
        amendment: {
          ukefExposure: 'not a number',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.coveredPercentage is not a number',
      payload: {
        amendment: {
          coveredPercentage: 'not a number',
        },
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
    {
      description: 'auditDetails is undefined',
      payload: {
        amendment: validAmendment,
        dealId: validDealId,
        auditDetails: undefined,
      },
    },
    {
      description: 'auditDetails is an empty object',
      payload: {
        auditDetails: validAmendment,
        dealId: validDealId,
      },
    },
    {
      description: 'auditDetails.userType is undefined',
      payload: {
        amendment: validAmendment,
        dealId: validDealId,
        auditDetails: {
          userType: undefined,
        },
      },
    },
    {
      description: 'auditDetails.id is invalid and type is portal',
      payload: {
        amendment: validAmendment,
        dealId: validDealId,
        auditDetails: {
          userType: AUDIT_USER_TYPES.PORTAL,
          id: 'invalid',
        },
      },
    },
    {
      description: 'dealId is not a string',
      payload: {
        amendment: validAmendment,
        dealId: 123456123456123456,
        auditDetails: validAuditDetails,
      },
    },
    {
      description: 'dealId is not an object Id',
      payload: {
        amendment: validAmendment,
        dealId: 'invalid deal id',
        auditDetails: validAuditDetails,
      },
    },
  ];

  it.each(invalidPayloads)('should return 400 when $description', ({ payload }) => {
    // Arrange
    const { req, res } = createMocks({ body: payload });
    const next = jest.fn();

    // Act
    validatePutPortalFacilityAmendmentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  const validPayloads = [
    {
      description: 'the payload is valid',
      payload: {
        amendment: validAmendment,
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },

    {
      description: 'the amendment is an empty object',
      payload: {
        amendment: {},
        auditDetails: validAuditDetails,
        dealId: validDealId,
      },
    },
  ];

  it.each(validPayloads)('should call next when $description', ({ payload }) => {
    // Arrange
    const { req, res } = createMocks({ body: payload });
    const next = jest.fn();

    // Act
    validatePutPortalFacilityAmendmentPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
