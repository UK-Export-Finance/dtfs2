import { ObjectId } from 'mongodb';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AnyObject } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import { validatePutPortalFacilityAmendmentPayload } from './validate-put-portal-facility-amendment-payload';

const validDealId = new ObjectId().toString();
const validAmendment = JSON.parse(JSON.stringify(aPortalFacilityAmendmentUserValues())) as AnyObject;

describe('validatePutPortalFacilityAmendmentPayload', () => {
  const invalidPayloads = [
    {
      description: 'no amendment is provided',
      payload: {
        dealId: validDealId,
      },
    },
    {
      description: 'amendment is not an object',
      payload: {
        amendment: 'not an object',
        dealId: validDealId,
      },
    },
    {
      description: 'amendment has additional properties',
      payload: {
        amendment: {
          extra: 'property',
        },
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.changeCoverEndDate is not a boolean',
      payload: {
        amendment: {
          changeCoverEndDate: 'true',
        },
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.coverEndDate is not an integer',
      payload: {
        amendment: {
          coverEndDate: 'not an integer',
        },
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.isUsingFacilityEndDate is not a boolean',
      payload: {
        amendment: {
          isUsingFacilityEndDate: 'not a boolean',
        },
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.facilityEndDate is not a number',
      payload: {
        amendment: {
          facilityEndDate: 'not a number',
        },
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.facilityEndDate is negative',
      payload: {
        amendment: {
          facilityEndDate: -23,
        },
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.bankReviewDate is not a number',
      payload: {
        amendment: {
          bankReviewDate: 'not a number',
        },
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.bankReviewDate is negative',
      payload: {
        amendment: {
          bankReviewDate: -23,
        },
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.changeFacilityValue is not a boolean',
      payload: {
        amendment: {
          changeFacilityValue: 'not a boolean',
        },
        dealId: validDealId,
      },
    },
    {
      description: 'amendment.value is not a number',
      payload: {
        amendment: {
          value: 'not a number',
        },
        dealId: validDealId,
      },
    },
    {
      description: 'dealId is not a string',
      payload: {
        amendment: validAmendment,
        dealId: 123456123456123456,
      },
    },
  ];

  it.each(invalidPayloads)(`should return ${HttpStatusCode.BadRequest} when $description`, ({ payload }) => {
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
        dealId: validDealId,
      },
    },

    {
      description: 'the amendment is an empty object',
      payload: {
        amendment: {},
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
