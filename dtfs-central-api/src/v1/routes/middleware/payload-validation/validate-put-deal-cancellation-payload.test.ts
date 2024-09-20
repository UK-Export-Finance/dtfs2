import { AuditDetails, MAX_CHARACTER_COUNT, TfmDealCancellation } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { validatePutDealCancellationPayload } from './validate-put-deal-cancellation-payload';

describe('validatePutDealCancellationPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidPayload = (): { dealCancellationUpdate: TfmDealCancellation; auditDetails: AuditDetails } => ({
    dealCancellationUpdate: {
      reason: 'x'.repeat(MAX_CHARACTER_COUNT),
      bankRequestDate: new Date().valueOf(),
      effectiveFrom: new Date().valueOf(),
    },
    auditDetails: generateTfmAuditDetails(aTfmSessionUser()._id),
  });

  const invalidPayloads = [
    {
      description: 'the payload is undefined',
      payload: { ...aValidPayload(), dealCancellationUpdate: undefined },
    },
    {
      description: "the 'reason' is not a string",
      payload: {
        ...aValidPayload(),
        dealCancellationUpdate: {
          reason: 1234,
        },
      },
    },
    {
      description: `the 'reason' is over ${MAX_CHARACTER_COUNT} characters`,
      payload: {
        ...aValidPayload(),
        dealCancellationUpdate: {
          reason: 'x'.repeat(MAX_CHARACTER_COUNT + 1),
        },
      },
    },
    {
      description: "the 'effectiveFrom' is a string",
      payload: {
        ...aValidPayload(),
        dealCancellationUpdate: {
          effectiveFrom: new Date().toString(),
        },
      },
    },
    {
      description: "the 'bankRequestDate' is a string",
      payload: {
        ...aValidPayload(),
        dealCancellationUpdate: {
          bankRequestDate: new Date().toString(),
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
  ];

  it.each(invalidPayloads)(`responds with a '${HttpStatusCode.BadRequest}' if $description`, ({ payload }) => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = payload;

    // Act
    validatePutDealCancellationPayload(req, res, next);

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
    validatePutDealCancellationPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toBe(false);
  });
});
