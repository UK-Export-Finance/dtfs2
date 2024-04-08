/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createMocks } from 'node-mocks-http';
import { acceptExternalSsoPost } from './loginService';
import { SSO } from '../../constants';

describe('service - loginService', () => {

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('acceptExternalSsoPost', () => {

    const requestBody = {
      code: 'test1',
      client_info: 'test2',
      state: 'test3',
      session_state: 'test4',
    };

    it('should render acceptExternalSsoPost form if request is from SSO.AUTHORITY', () => {
      // Arrange
      const { req, res } = createMocks({ session: {}, body: requestBody, headers: { referrer: `${SSO.AUTHORITY}/`, host: '' } });

      // Act
      acceptExternalSsoPost(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('sso/accept-external-sso-post.njk');
      expect(res._getRenderData()).toMatchObject({
        code: requestBody.code,
        clientInfo: requestBody.client_info,
        state: requestBody.state,
        sessionState: requestBody.session_state,
      });
      expect(res._getStatusCode()).toEqual(200);
    });

    it('should render error page if request is not from SSO AUTHORITY', () => {
      // Arrange
      const { req, res } = createMocks({ session: {}, body: requestBody, headers: { referrer: '', host: '' } });

      // Act
      acceptExternalSsoPost(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
      expect(res._getRenderData()).toMatchObject({
        error: {
          message: 'Login request comming from unexpected website.',
        }
      });
      expect(res._getStatusCode()).toEqual(500);
    });

    it('should accept request without referrer for localhost', () => {
      // Arrange
      const { req, res } = createMocks({ session: {}, body: requestBody, headers: { referrer: '', host: 'localhost' } });

      // Act
      acceptExternalSsoPost(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('sso/accept-external-sso-post.njk');
      expect(res._getRenderData()).toMatchObject({
        code: requestBody.code,
        clientInfo: requestBody.client_info,
        state: requestBody.state,
        sessionState: requestBody.session_state,
      });
      expect(res._getStatusCode()).toEqual(200);
    });

    it('should accept request without referrer for localhost:5003', () => {
      // Arrange
      const { req, res } = createMocks({ session: {}, body: requestBody, headers: { referrer: '', host: 'localhost:5003' } });

      // Act
      acceptExternalSsoPost(req, res);

      // Assert
      expect(res._getRenderView()).toEqual('sso/accept-external-sso-post.njk');
      expect(res._getRenderData()).toMatchObject({
        code: requestBody.code,
        clientInfo: requestBody.client_info,
        state: requestBody.state,
        sessionState: requestBody.session_state,
      });
      expect(res._getStatusCode()).toEqual(200);
    });


    describe('should render error page if not allowed characters are in form parameters', () => {
      const forbid = ' !"#$%&\'()*+,/:;<=>?@[]^`{|}~¡¢£¤¥¦§¨©ª«¬­®¯°±²³´¶·¸¹º»¼½¾¿ÀÁÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäçèéêëìíîïðñòóôõö÷øùúûüýþąŽİĞİŞのでコン😄😎🍀µÿ'; // cspell:disable-line
      it.each([
        ...forbid.split(''),
        forbid,
        'aaaaaa.dddddd<dddddd.zzzzz',
      ])(`should render error page if body parameter contains '%s'`, (characters) => {
        // Arrange
        const { req, res } = createMocks({ session: {}, body: {...requestBody, client_info: characters}, headers: { referrer: '', host: 'localhost' } });

        // Act
        acceptExternalSsoPost(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('_partials/problem-with-service.njk');
        expect(res._getRenderData()).toMatchObject({
          error: {
            message: 'Login request data contains unexpected characters.',
          }
        });
        expect(res._getStatusCode()).toEqual(500);
      });
    });

    describe('should allow expected characters in form parameters', () => {
      const allow = '1234567890AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz_-.'; // cspell:disable-line
      it.each([
        ...allow.split(''),
        allow,
        '123Aab.nq1TX_7HhI-i.4Y5z',
      ])(`should render success page if body parameter contains '%s'`, (characters) => {
        // Arrange
        const { req, res } = createMocks({ session: {}, body: {...requestBody, client_info: characters}, headers: { referrer: '', host: 'localhost' } });

        // Act
        acceptExternalSsoPost(req, res);

        // Assert
        expect(res._getRenderView()).toEqual('sso/accept-external-sso-post.njk');
        expect(res._getStatusCode()).toEqual(200);
      });
    });

  });
});
