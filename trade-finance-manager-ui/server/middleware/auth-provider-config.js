/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

require('dotenv').config();

const TENANT_SUBDOMAIN = process.env.AZURE_SSO_TENANT_SUBDOMAIN;
const REDIRECT_URI = `${process.env.TFM_UI_URL}/${process.env.AZURE_SSO_REDIRECT_URI}`;
const POST_LOGOUT_REDIRECT_URI = process.env.AZURE_SSO_POST_LOGOUT_URI;

/**
 * Configuration object to be passed to MSAL instance on creation.
 * For a full list of MSAL Node configuration parameters, visit:
 * https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/configuration.md
 */
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_SSO_CLIENT_ID, // 'Application (client) ID' of app registration in Azure portal - this value is a GUID
    authority: process.env.AZURE_SSO_AUTHORITY, // Replace the placeholder with your tenant subdomain
    clientSecret: process.env.AZURE_SSO_CLIENT_SECRET, // Client secret generated from the app registration in Azure portal
  },
  system: {
    loggerOptions: {
      // TODO: Do we want a logger that supports containsPii handling
      // loggerCallback(loglevel, message, containsPii) {
      loggerCallback(loglevel, message, ) {
        console.info(message);
      },
      piiLoggingEnabled: false,
      logLevel: 'Info',
    },
  },
};

module.exports = {
  msalConfig,
  TENANT_SUBDOMAIN,
  REDIRECT_URI,
  POST_LOGOUT_REDIRECT_URI,
};
