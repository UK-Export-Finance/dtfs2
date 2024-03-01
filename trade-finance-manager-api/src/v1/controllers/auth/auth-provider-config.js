/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

require('dotenv').config();

const {
  AZURE_SSO_AUTHORITY,
  AZURE_SSO_CLIENT_ID,
  AZURE_SSO_CLIENT_SECRET,
  AZURE_SSO_REDIRECT_URI,
  AZURE_SSO_POST_LOGOUT_URI,
  AZURE_SSO_TENANT_SUBDOMAIN,
  TFM_UI_URL,
} = process.env;

const REDIRECT_URI = `${TFM_UI_URL}/${AZURE_SSO_REDIRECT_URI}`;

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
  auth: {
    clientId: AZURE_SSO_CLIENT_ID, // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    authority: AZURE_SSO_AUTHORITY, // Replace the placeholder with your tenant subdomain
    clientSecret: AZURE_SSO_CLIENT_SECRET, // Client secret generated from the app registration in Azure portal
  },
  system: {
    loggerOptions: {
      loggerCallback(loglevel, message, containsPii) {
        console.info('MSAL: ', containsPii ? '' : message);
      },
      piiLoggingEnabled: false,
      logLevel: 'Info',
    },
  },
};

module.exports = {
  msalConfig,
  AZURE_SSO_TENANT_SUBDOMAIN,
  REDIRECT_URI,
  AZURE_SSO_POST_LOGOUT_URI,
};
