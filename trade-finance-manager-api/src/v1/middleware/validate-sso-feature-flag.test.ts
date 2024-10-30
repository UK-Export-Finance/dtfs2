import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { RequestHandler, Request, Response, NextFunction } from 'express';
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

      itReturnsAnErrorResponse({ makeRequest });
    });

    describe('when the SSO feature flag is enabled', () => {
      beforeEach(() => {
        mockIsTfmSsoFeatureFlag(true);
      });

      itCallsTheNextMiddleware({
        makeRequest,
      });
    });
  });

  describe('validateSsoFeatureFlagIsOff', () => {
    const makeRequest = validateSsoFeatureFlagIsOff;

    describe('when the SSO feature flag is disabled', () => {
      beforeEach(() => {
        mockIsTfmSsoFeatureFlag(false);
      });

      itCallsTheNextMiddleware({
        makeRequest,
      });
    });

    describe('when the SSO feature flag is enabled', () => {
      beforeEach(() => {
        mockIsTfmSsoFeatureFlag(true);
      });

      itReturnsAnErrorResponse({ makeRequest });
    });
  });

  function mockIsTfmSsoFeatureFlag(value: boolean) {
    jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(value);
  }

  function itCallsTheNextMiddleware({ makeRequest }: { makeRequest: RequestHandler }) {
    it('calls the next middleware', () => {
      makeRequest(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  }

  function itReturnsAnErrorResponse({ makeRequest }: { makeRequest: RequestHandler }) {
    it('returns an error response', () => {
      makeRequest(req, res, next);

      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._isEndCalled()).toEqual(true);
    });
  }
});
