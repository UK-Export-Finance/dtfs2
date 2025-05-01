import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { ObjectId } from 'mongodb';
import { PORTAL_AMENDMENT_STATUS, portalAmendmentToUkefEmailVariables } from '@ukef/dtfs2-common';
import { validatePatchPortalFacilitySubmitAmendmentPayload } from './validate-patch-portal-facility-submit-amendment-payload';

const portalAmendmentVariables = portalAmendmentToUkefEmailVariables();

const referenceNumber = `${new ObjectId().toString()}-01`;

describe('validatePatchPortalFacilitySubmitAmendmentPayload', () => {
  const invalidPayloads = [
    {
      description: 'no newStatus is provided',
      payload: {},
    },
    {
      description: 'newStatus is an empty string',
      payload: {
        newStatus: '',
        referenceNumber,
      },
    },
    {
      description: 'newStatus is not a valid portal amendment status',
      payload: {
        newStatus: 'Invalid status',
        referenceNumber,
      },
    },
    {
      description: 'string field is undefined',
      payload: {
        ...portalAmendmentVariables,
        emailVariables: {
          ...portalAmendmentVariables.emailVariables,
          exporterName: undefined,
        },
      },
    },
    {
      description: 'referenceNumber is undefined',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber: undefined,
      },
    },
    {
      description: 'string field is number',
      payload: {
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

  it.each([PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED])('should call next when newStatus is "%s"', (newStatus) => {
    // Arrange
    const { req, res } = createMocks({ body: { newStatus, referenceNumber } });
    const next = jest.fn();

    // Act
    validatePatchPortalFacilitySubmitAmendmentPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
