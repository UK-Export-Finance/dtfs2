import { portalAmendmentToCheckerEmailVariables } from "@ukef/dtfs2-common/test-helpers";
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { PORTAL_AMENDMENT_STATUS } from '@ukef/dtfs2-common';
import { validatePatchPortalFacilityAmendmentStatusPayload } from './validate-patch-portal-facility-amendment-status-payload';

const portalAmendmentVariables = portalAmendmentToCheckerEmailVariables();

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
    validatePatchPortalFacilityAmendmentStatusPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it.each([PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL, PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED])(
    'should call next when newStatus is "%s"',
    (newStatus) => {
      // Arrange
      const { req, res } = createMocks({ body: { newStatus, ...portalAmendmentVariables } });
      const next = jest.fn();

      // Act
      validatePatchPortalFacilityAmendmentStatusPayload(req, res, next);

      // Assert
      expect(next).toHaveBeenCalled();
      expect(res._isEndCalled()).toEqual(false);
    },
  );
});
