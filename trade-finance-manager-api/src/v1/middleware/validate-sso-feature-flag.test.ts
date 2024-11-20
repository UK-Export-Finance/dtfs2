import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { Request, Response, NextFunction } from 'express';
import httpMocks, { MockRequest, MockResponse } from 'node-mocks-http';
import { validateSsoFeatureFlagIsOff, validateSsoFeatureFlagIsOn } from './validate-sso-feature-flag';

jest.mock('@ukef/dtfs2-common', () => ({
  isTfmSsoFeatureFlagEnabled: jest.fn(),
}));

describe('validateSsoFeatureFlag', () => {
  let req: MockRequest<Request>;
  let res: MockResponse<Response>;
  let next: jest.Mock | NextFunction;

  beforeEach(() => {
    ({ req, res } = httpMocks.createMocks());
    next = jest.fn();

    jest.resetAllMocks();
  });

  describe('validateSsoFeatureFlagIsOn', () => {
    const makeRequest = validateSsoFeatureFlagIsOn;

    describe('when the SSO feature flag is disabled', () => {
      beforeEach(() => {
        mockIsTfmSsoFeatureFlag(false);
      });

      it('returns an error response', () => {
        makeRequest(req, res, next);

        expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
        expect(res._isEndCalled()).toEqual(true);
      });
    });

    describe('when the SSO feature flag is enabled', () => {
      beforeEach(() => {
        mockIsTfmSsoFeatureFlag(true);
      });

      it('calls the next middleware', () => {
        makeRequest(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('validateSsoFeatureFlagIsOff', () => {
    const makeRequest = validateSsoFeatureFlagIsOff;

    describe('when the SSO feature flag is disabled', () => {
      beforeEach(() => {
        mockIsTfmSsoFeatureFlag(false);
      });

      it('calls the next middleware', () => {
        makeRequest(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(next).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the SSO feature flag is enabled', () => {
      beforeEach(() => {
        mockIsTfmSsoFeatureFlag(true);
      });

      it('returns an error response', () => {
        makeRequest(req, res, next);

        expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
        expect(res._isEndCalled()).toEqual(true);
      });
    });
  });

  function mockIsTfmSsoFeatureFlag(value: boolean) {
    jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(value);
  }
});
