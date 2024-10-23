import { AUDIT_USER_TYPES, AuditDetails, MAX_CHARACTER_COUNT, TfmDealCancellation } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { validatePostSubmitDealCancellationPayload } from './validate-post-submit-deal-cancellation-payload';

describe('validatePostDealCancellationPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidPayload = (): { cancellation: TfmDealCancellation; auditDetails: AuditDetails } => ({
    cancellation: {
      reason: 'x'.repeat(MAX_CHARACTER_COUNT),
      bankRequestDate: new Date().valueOf(),
      effectiveFrom: new Date().valueOf(),
    },
    auditDetails: generateTfmAuditDetails(aTfmSessionUser()._id),
  });

  const invalidPayloads = [
    {
      description: 'the cancellation is undefined',
      payload: { ...aValidPayload(), cancellation: undefined },
    },
    {
      description: "'reason' is not a string",
      payload: {
        ...aValidPayload(),
        cancellation: {
          reason: 1234,
        },
      },
    },
    {
      description: `'reason' is over ${MAX_CHARACTER_COUNT} characters`,
      payload: {
        ...aValidPayload(),
        cancellation: {
          reason: 'x'.repeat(MAX_CHARACTER_COUNT + 1),
        },
      },
    },
    {
      description: "'effectiveFrom' is a string",
      payload: {
        ...aValidPayload(),
        cancellation: {
          effectiveFrom: new Date().toString(),
        },
      },
    },
    {
      description: "'effectiveFrom' is undefined",
      payload: {
        ...aValidPayload(),
        cancellation: {
          effectiveFrom: undefined,
        },
      },
    },
    {
      description: "'bankRequestDate' is a string",
      payload: {
        ...aValidPayload(),
        cancellation: {
          bankRequestDate: new Date().toString(),
        },
      },
    },
    {
      description: "'bankRequestDate' is undefined",
      payload: {
        ...aValidPayload(),
        cancellation: {
          effectiveFrom: undefined,
        },
      },
    },
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
    validatePostSubmitDealCancellationPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });

  it("calls the 'next' function if the payload is valid", () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = aValidPayload();

    // Act
    validatePostSubmitDealCancellationPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });
});
