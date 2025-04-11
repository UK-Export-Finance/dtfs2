import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { validatePatchPortalFacilitySubmitAmendmentPayload } from './validate-patch-portal-facility-submit-amendment-payload';

const facilityId = '6597dffeb5ef5ff4267e5044';
const referenceNumber = `${facilityId}-01`;

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
      description: 'referenceNumber is undefined',
      payload: {
        newStatus: PORTAL_AMENDMENT_STATUS.ACKNOWLEDGED,
        referenceNumber: undefined,
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
