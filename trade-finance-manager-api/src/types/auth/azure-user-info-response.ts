import { AzureUserInfoResponseAccount } from './azure-user-info-response-account';

export type AzureUserInfoResponse = {
  authority: string;
  uniqueId: string;
  tenantId: string;
  scopes: string[];
  account: AzureUserInfoResponseAccount;
  accessToken: string;
  fromCache: boolean;
  expiresOn: Date;
  extExpiresOn: Date;
  refreshOn: Date | undefined;
  correlationId: string;
  requestId: string;
  familyId: string;
  tokenType: string;
  state: string;
  cloudGraphHostName: string;
  msGraphHost: string;
  code: number | undefined;
  fromNativeBroker: boolean;
};
