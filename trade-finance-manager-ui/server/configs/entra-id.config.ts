import { Configuration as MsalAppConfig } from '@azure/msal-node';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const ENTRA_ID_ENV_VAR_CONFIG_SCHEMA = z.object({
  ENTRA_ID_CLIENT_ID: z.string(),
  ENTRA_ID_CLOUD_INSTANCE: z.string(),
  ENTRA_ID_TENANT_ID: z.string(),
  ENTRA_ID_CLIENT_SECRET: z.string(),
  ENTRA_ID_REDIRECT_URL: z.string(),
});

const ENTRA_ID_ENV_VAR_CONFIG = ENTRA_ID_ENV_VAR_CONFIG_SCHEMA.parse(process.env);

const AUTHORITY = `${ENTRA_ID_ENV_VAR_CONFIG.ENTRA_ID_CLOUD_INSTANCE}/${ENTRA_ID_ENV_VAR_CONFIG.ENTRA_ID_TENANT_ID}`;

const MSAL_APP_CONFIG = {
  auth: {
    clientId: ENTRA_ID_ENV_VAR_CONFIG.ENTRA_ID_CLIENT_ID,
    authority: AUTHORITY,
    clientSecret: ENTRA_ID_ENV_VAR_CONFIG.ENTRA_ID_CLIENT_SECRET,
  },
};

type EntraIdConfig = {
  AUTHORITY: string;
  REDIRECT_URL: string;
  AUTHORITY_METADATA_URL: string;
  SCOPES: string[];
  MSAL_APP_CONFIG: MsalAppConfig;
};

export const ENTRA_ID_CONFIG: EntraIdConfig = {
  AUTHORITY,
  REDIRECT_URL: ENTRA_ID_ENV_VAR_CONFIG.ENTRA_ID_REDIRECT_URL,
  AUTHORITY_METADATA_URL: `${ENTRA_ID_ENV_VAR_CONFIG.ENTRA_ID_CLOUD_INSTANCE}/${ENTRA_ID_ENV_VAR_CONFIG.ENTRA_ID_TENANT_ID}/v2.0/.well-known/openid-configuration`,
  SCOPES: [`api://${ENTRA_ID_ENV_VAR_CONFIG.ENTRA_ID_CLIENT_ID}/authentication`, 'user.read'],
  MSAL_APP_CONFIG,
};
