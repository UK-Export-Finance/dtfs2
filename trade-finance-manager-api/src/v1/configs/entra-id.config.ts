import { Configuration as MsalAppConfig } from '@azure/msal-node';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

export class EntraIdConfig {
  private static readonly entraIdEnvVarConfigSchema = z.object({
    ENTRA_ID_CLIENT_ID: z.string(),
    ENTRA_ID_CLOUD_INSTANCE: z.string(),
    ENTRA_ID_TENANT_ID: z.string(),
    ENTRA_ID_CLIENT_SECRET: z.string(),
    ENTRA_ID_REDIRECT_URL: z.string(),
  });

  public readonly msalAppConfig: MsalAppConfig;

  public readonly authorityMetadataUrl: string;

  public readonly scopes: string[];

  public readonly redirectUri: string;

  constructor() {
    const { ENTRA_ID_CLIENT_ID, ENTRA_ID_CLOUD_INSTANCE, ENTRA_ID_TENANT_ID, ENTRA_ID_CLIENT_SECRET, ENTRA_ID_REDIRECT_URL } =
      EntraIdConfig.entraIdEnvVarConfigSchema.parse(process.env);

    const authority = `${ENTRA_ID_CLOUD_INSTANCE}/${ENTRA_ID_TENANT_ID}`;

    this.msalAppConfig = {
      auth: {
        clientId: ENTRA_ID_CLIENT_ID,
        authority,
        clientSecret: ENTRA_ID_CLIENT_SECRET,
      },
    };

    this.authorityMetadataUrl = `${authority}/v2.0/.well-known/openid-configuration`;

    this.scopes = [`api://${ENTRA_ID_CLIENT_ID}/authentication`, 'user.read'];

    this.redirectUri = ENTRA_ID_REDIRECT_URL;
  }
}
