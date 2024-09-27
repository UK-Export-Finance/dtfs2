import { ZodError } from 'zod';
import { EntraIdConfig } from './entra-id.config';

describe('EntraIdConfig', () => {
  let originalEnvs: NodeJS.ProcessEnv;

  const mockEntraIdClientId = 'mockEntraIdClientId';
  const mockEntraIdCloudInstance = 'mockEntraIdCloudInstance';
  const mockEntraIdTenantId = 'mockEntraIdTenantId';
  const mockEntraIdClientSecret = 'mockEntraIdClientSecret';
  const mockEntraIdRedirectUrl = 'mockEntraIdRedirectUrl';

  const mockEnvVars = {
    ENTRA_ID_CLIENT_ID: mockEntraIdClientId,
    ENTRA_ID_CLOUD_INSTANCE: mockEntraIdCloudInstance,
    ENTRA_ID_TENANT_ID: mockEntraIdTenantId,
    ENTRA_ID_CLIENT_SECRET: mockEntraIdClientSecret,
    ENTRA_ID_REDIRECT_URL: mockEntraIdRedirectUrl,
  };

  beforeAll(() => {
    originalEnvs = { ...process.env };
  });

  beforeEach(() => {
    process.env = { ...mockEnvVars };
  });

  afterAll(() => {
    process.env = originalEnvs;
  });

  describe('when validating the environment variables', () => {
    const envVarNames = Object.keys(mockEnvVars);

    it.each(envVarNames)('should throw an error if %s is not defined', (envVar) => {
      delete process.env[envVar];

      expect(() => new EntraIdConfig()).toThrow(ZodError);
    });
  });

  describe('when creating an instance of EntraIdConfig', () => {
    let config: EntraIdConfig;

    beforeEach(() => {
      config = new EntraIdConfig();
    });

    it('should configure the msalAppConfig', () => {
      expect(config.msalAppConfig).toStrictEqual({
        auth: {
          clientId: mockEntraIdClientId,
          authority: `${mockEntraIdCloudInstance}/${mockEntraIdTenantId}`,
          clientSecret: mockEntraIdClientSecret,
        },
      });
    });

    it('should configure the authorityMetaDataUrl', () => {
      expect(config.authorityMetadataUrl).toBe(`${mockEntraIdCloudInstance}/${mockEntraIdTenantId}/v2.0/.well-known/openid-configuration`);
    });

    it('should configure the scopes', () => {
      expect(config.scopes).toStrictEqual([`api://${mockEntraIdClientId}/authentication`, 'user.read']);
    });

    it('should configure the redirectUri', () => {
      expect(config.redirectUri).toBe(mockEntraIdRedirectUrl);
    });
  });
});
