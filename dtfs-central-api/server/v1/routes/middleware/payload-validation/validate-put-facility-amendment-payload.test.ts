import httpMocks from 'node-mocks-http';
import { HttpStatusCode } from 'axios';
import { AuditDetails } from '@ukef/dtfs2-common';
import { generateTfmAuditDetails } from '@ukef/dtfs2-common/change-stream';
import { aTfmSessionUser } from '../../../../../test-helpers';
import { validatePutFacilityAmendmentPayload } from './validate-put-facility-amendment-payload';

describe('validatePutFacilityAmendmentPayload', () => {
  const getHttpMocks = () => httpMocks.createMocks();

  const aValidAuditDetails = (): AuditDetails => generateTfmAuditDetails(aTfmSessionUser()._id);

  it('should call the next function if payload contains apimGift.facilityAmendmentSent', () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = {
      payload: {
        apimGift: {
          facilityAmendmentSent: true,
        },
        shouldNotUpdateTimestamp: true,
      },
      auditDetails: aValidAuditDetails(),
    };

    // Act
    validatePutFacilityAmendmentPayload(req, res, next);

    // Assert
    expect(next).toHaveBeenCalled();
    expect(res._isEndCalled()).toEqual(false);
  });

  it(`should respond with ${HttpStatusCode.BadRequest} if apimGift.facilityAmendmentSent is not a boolean`, () => {
    // Arrange
    const { req, res } = getHttpMocks();
    const next = jest.fn();

    req.body = {
      payload: {
        apimGift: {
          facilityAmendmentSent: 'true',
        },
      },
      auditDetails: aValidAuditDetails(),
    };

    // Act
    validatePutFacilityAmendmentPayload(req, res, next);

    // Assert
    expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
    expect(res._isEndCalled()).toEqual(true);
    expect(next).not.toHaveBeenCalled();
  });
});
