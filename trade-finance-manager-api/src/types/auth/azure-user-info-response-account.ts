import { AzureIdTokenClaims } from './azure-id-token-claims';

export type AzureUserInfoResponseAccount = {
  homeAccountId: string;
  environment: string;
  tenantId: string;
  username: string;
  localAccountId: string;
  name: string;
  nativeAccountId: string|undefined,
  authorityType: string;
  tenantProfiles: object,
  idTokenClaims: AzureIdTokenClaims;
  idToken: string;
};
