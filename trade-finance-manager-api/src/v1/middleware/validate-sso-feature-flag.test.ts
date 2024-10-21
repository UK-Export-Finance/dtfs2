import { isTfmSsoFeatureFlagEnabled } from '@ukef/dtfs2-common';
import { HttpStatusCode } from 'axios';
import { RequestHandler } from 'express';
import httpMocks from 'node-mocks-http';
import { validateSsoFeatureFlagIsOff, validateSsoFeatureFlagIsOn } from './validate-sso-feature-flag';

jest.mock('@ukef/dtfs2-common', () => ({
  isTfmSsoFeatureFlagEnabled: jest.fn(),
}));

describe('validateSsoFeatureFlag', () => {
  beforeEach(() => {
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

  function getHttpMocks() {
    return httpMocks.createMocks();
  }

  function mockIsTfmSsoFeatureFlag(value: boolean) {
    jest.mocked(isTfmSsoFeatureFlagEnabled).mockReturnValue(value);
  }

  function itCallsTheNextMiddleware({ makeRequest }: { makeRequest: RequestHandler }) {
    it('calls the next middleware', () => {
      const { req, res } = getHttpMocks();
      const next = jest.fn();
      makeRequest(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  }

  function itReturnsAnErrorResponse({ makeRequest }: { makeRequest: RequestHandler }) {
    it('returns an error response', () => {
      const { req, res } = getHttpMocks();
      const next = jest.fn();
      makeRequest(req, res, next);
      expect(res._getStatusCode()).toEqual(HttpStatusCode.BadRequest);
      expect(res._isEndCalled()).toEqual(true);
    });
  }
});
