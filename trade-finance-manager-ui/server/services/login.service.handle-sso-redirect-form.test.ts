import { HandleSsoRedirectFormResponse } from '@ukef/dtfs2-common';
import { aHandleSsoRedirectFormRequest, aHandleSsoRedirectFormResponse } from '../../test-helpers';
import { LoginService } from './login.service';
import * as api from '../api';

jest.mock('../api');

describe('login service', () => {
  describe('handleSsoRedirectForm', () => {
    const handleSsoRedirectFormSpy = jest.spyOn(api, 'handleSsoRedirectForm');
    const loginService = new LoginService();

    afterEach(() => {
      handleSsoRedirectFormSpy.mockReset();
    });

    it('calls api.handleSsoRedirectForm with the request', async () => {
      // Act
      await loginService.handleSsoRedirectForm(aHandleSsoRedirectFormRequest());

      // Assert
      expect(handleSsoRedirectFormSpy).toHaveBeenCalledWith(aHandleSsoRedirectFormRequest());
    });

    describe('when the handleSsoRedirectForm api call is successful', () => {
      const handleSsoRedirectFormResponse: HandleSsoRedirectFormResponse = aHandleSsoRedirectFormResponse();

      beforeEach(() => {
        handleSsoRedirectFormSpy.mockResolvedValueOnce(handleSsoRedirectFormResponse);
      });

      it('returns the auth code url', async () => {
        // Act
        const result = await loginService.handleSsoRedirectForm(aHandleSsoRedirectFormRequest());

        // Assert
        expect(result).toEqual(handleSsoRedirectFormResponse);
      });
    });

    describe('when the handleSsoRedirectForm api call is unsuccessful', () => {
      const error = new Error('handleSsoRedirectForm error');

      beforeEach(() => {
        handleSsoRedirectFormSpy.mockRejectedValueOnce(error);
      });

      it('throws the error', async () => {
        // Act & Assert
        await expect(loginService.handleSsoRedirectForm(aHandleSsoRedirectFormRequest())).rejects.toThrow(error);
      });
    });
  });
});
