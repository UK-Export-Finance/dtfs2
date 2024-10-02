import { AUDIT_USER_TYPES, AuditDetails } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { validateDeleteDealCancellationPayload } from './validate-delete-deal-cancellation-payload';

describe('validateDeleteDealCancellationPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidPayload = (): { auditDetails: AuditDetails } => ({
    auditDetails: generateTfmAuditDetails(aTfmSessionUser()._id),
  });

  const invalidPayloads = [
    {
      description: "'auditDetails' is undefined",
      payload: {
        ...aValidPayload(),
        auditDetails: undefined,
      },
    },
    {
      description: "'auditDetails' is an empty object",
      payload: {
        ...aValidPayload().auditDetails,
        auditDetails: {},
      },
    },
    {
      description: "'auditDetails.userType' is undefined",
      payload: {
        ...aValidPayload(),
        auditDetails: {
          ...aValidPayload().auditDetails,
          userType: undefined,
        },
      },
    },
    {
      description: "'auditDetails.id' is invalid and type is tfm",
      payload: {
        ...aValidPayload(),
        auditDetails: {
          ...aValidPayload().auditDetails,
          userType: AUDIT_USER_TYPES.TFM,
          id: 'invalid',
        },
      },
    },
  ];

  it.each(invalidPayloads)(`responds with a '${HttpStatusCode.BadRequest}' if $description`, ({ payload }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = payload;

    // Act
    validateDeleteDealCancellationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toBe(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toBe(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls the 'next' function if the payload is valid", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = aValidPayload();

    // Act
    validateDeleteDealCancellationPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toBe(false);
  });
});
