import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AnyObject } from '@ukef/dtfs2-common';
import { aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import { validatePatchPortalFacilityAmendmentPayload } from './validate-patch-portal-facility-amendment-payload';

const validAmendment = JSON.parse(JSON.stringify(aPortalFacilityAmendmentUserValues())) as AnyObject;

describe('validatePatchPortalFacilityAmendmentPayload', () => {
  const invalidPayloads = [
    {
      description: 'no update is provided',
      payload: {},
    },
    {
      description: 'undefined payload',
      payload: undefined,
    },
    {
      description: 'update is not an object',
      payload: {
        update: 'not an object',
      },
    },
    {
      description: 'update has additional properties',
      payload: {
        update: {
          extra: 'property',
        },
      },
    },
    {
      description: 'update.changeCoverEndDate is null',
      payload: {
        update: {
          changeCoverEndDate: null,
        },
      },
    },
    {
      description: 'update.changeCoverEndDate is not a boolean',
      payload: {
        update: {
          changeCoverEndDate: 'true',
        },
      },
    },
    {
      description: 'update.coverEndDate is not an integer',
      payload: {
        update: {
          coverEndDate: 'not an integer',
        },
      },
    },
    {
      description: 'update.currentCoverEndDate is not an integer',
      payload: {
        update: {
          currentCoverEndDate: 'not an integer',
        },
      },
    },
    {
      description: 'update.isUsingFacilityEndDate is not a boolean',
      payload: {
        update: {
          isUsingFacilityEndDate: 'not a boolean',
        },
      },
    },
    {
      description: 'update.facilityEndDate is not a number',
      payload: {
        update: {
          facilityEndDate: 'not a number',
        },
      },
    },
    {
      description: 'update.facilityEndDate is negative',
      payload: {
        update: {
          facilityEndDate: -23,
        },
      },
    },
    {
      description: 'update.facilityEndDate is null',
      payload: {
        update: {
          facilityEndDate: null,
        },
      },
    },
    {
      description: 'update.bankReviewDate is not a number',
      payload: {
        update: {
          bankReviewDate: 'not a number',
        },
      },
    },
    {
      description: 'update.bankReviewDate is negative',
      payload: {
        update: {
          bankReviewDate: -23,
        },
      },
    },
    {
      description: 'update.changeFacilityValue is not a boolean',
      payload: {
        update: {
          changeFacilityValue: 'not a boolean',
        },
      },
    },
    {
      description: 'update.value is not a number',
      payload: {
        update: {
          value: 'not a number',
        },
      },
    },
    {
      description: 'update.currentValue is not a number',
      payload: {
        update: {
          currentValue: 'not a number',
        },
      },
    },
    {
      description: 'update.currentValue is null',
      payload: {
        update: {
          currentValue: null,
        },
      },
    },
    {
      description: 'update.currency is not a valid enum value',
      payload: {
        update: {
          currency: 'invalid currency',
        },
      },
    },
    {
      description: 'update.ukefExposure is not a number',
      payload: {
        update: {
          ukefExposure: 'not a number',
        },
      },
    },
    {
      description: 'update.coveredPercentage is not a number',
      payload: {
        update: {
          coveredPercentage: 'not a number',
        },
      },
    },
    {
      description: 'update.coveredPercentage is null',
      payload: {
        update: {
          coveredPercentage: null,
        },
      },
    },
  ];

  it.each(invalidPayloads)(`should return ${HttpStatusCode.BadRequest} when $description`, ({ payload }) => {
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
        update: validAmendment,
      },
    },

    {
      description: 'the update is an empty object',
      payload: {
        update: {},
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
