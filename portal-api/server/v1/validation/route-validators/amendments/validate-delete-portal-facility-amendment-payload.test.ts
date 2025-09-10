import { portalAmendmentDeleteEmailVariables } from '@ukef/dtfs2-common/test-helpers';
import { createMocks } from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { validateDeletePortalFacilityAmendmentPayload } from './validate-delete-portal-facility-amendment-payload';

const portalAmendmentVariables = portalAmendmentDeleteEmailVariables();

describe('validateDeletePortalFacilityAmendmentPayload', () => {
  const invalidPayloads = [
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
    validateDeletePortalFacilityAmendmentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });
});
