import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { validatePatchPortalFacilityAmendmentStatusPayload } from './validate-patch-portal-facility-amendment-status-payload';

describe('validatePatchPortalFacilityAmendmentStatusPayload', () => {
  const invalidPayloads = [
    {
      description: 'no newStatus is provided',
      payload: {},
    },
    {
      description: 'newStatus is an empty string',
      payload: {
        newStatus: '',
      },
    },
    {
      description: 'newStatus is not a valid portal amendment status',
      payload: {
        newStatus: 'Invalid status',
      },
    },
  ];

  it.each(invalidPayloads)(`should return ${HttpStatusCode.BadRequest} when $description`, ({ payload }) => {
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

  it.each([PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL])('should call next when newStatus is "%s"', (newStatus) => {
    // Arrange
    const { req, res } = createMocks({ body: { newStatus } });
    const next = jest.fn();

    // Act
    validatePatchPortalFacilityAmendmentStatusPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
