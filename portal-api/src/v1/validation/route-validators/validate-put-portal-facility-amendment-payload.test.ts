import { createMocks } from 'node-mocks-http';
import { AnyObject } from '@ukef/dtfs2-common';

import { aPortalFacilityAmendmentUserValues } from '@ukef/dtfs2-common/mock-data-backend';
import { HttpStatusCode } from 'axios';
import { validatePutPortalFacilityAmendmentPayload } from './validate-put-portal-facility-amendment-payload';

const validAmendment = JSON.parse(JSON.stringify(aPortalFacilityAmendmentUserValues())) as AnyObject;

describe('validatePutPortalFacilityAmendmentPayload', () => {
  const invalidPayloads = [
    {
      description: 'amendment has additional properties',
      payload: {
        extra: 'property',
      },
    },
    {
      description: 'changeCoverEndDate is not a boolean',
      payload: {
        changeCoverEndDate: 'true',
      },
    },
    {
      description: 'coverEndDate is not an integer',
      payload: {
        coverEndDate: 'not an integer',
      },
    },
    {
      description: 'currentCoverEndDate is not an integer',
      payload: {
        currentCoverEndDate: 'not an integer',
      },
    },
    {
      description: 'isUsingFacilityEndDate is not a boolean',
      payload: {
        isUsingFacilityEndDate: 'not a boolean',
      },
    },
    {
      description: 'facilityEndDate is not a number',
      payload: {
        facilityEndDate: 'not a number',
      },
    },
    {
      description: 'facilityEndDate is negative',
      payload: {
        facilityEndDate: -23,
      },
    },
    {
      description: 'bankReviewDate is not a number',
      payload: {
        bankReviewDate: 'not a number',
      },
    },
    {
      description: 'bankReviewDate is negative',
      payload: {
        bankReviewDate: -23,
      },
    },
    {
      description: 'changeFacilityValue is not a boolean',
      payload: {
        changeFacilityValue: 'not a boolean',
      },
    },
    {
      description: 'value is not a number',
      payload: {
        value: 'not a number',
      },
    },
    {
      description: 'currentValue is not a number',
      payload: {
        currentValue: 'not a number',
      },
    },
    {
      description: 'currency is not a valid enum value',
      payload: {
        currency: 'invalid currency',
      },
    },
    {
      description: 'ukefExposure is not a number',
      payload: {
        ukefExposure: 'not a number',
      },
    },
    {
      description: 'coveredPercentage is not a number',
      payload: {
        coveredPercentage: 'not a number',
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
      payload: validAmendment,
    },

    {
      description: 'the amendment is an empty object',
      payload: {},
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
