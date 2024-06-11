import { UnixTimestampNumber } from '@ukef/dtfs2-common';

export type AzureIdTokenClaims = {
  aud: string;
  iss: string;
  iat: UnixTimestampNumber;
  nbf: UnixTimestampNumber;
  exp: UnixTimestampNumber;
  email: string;
  family_name: string | null;
  given_name: string | null;
  groups: string[];
  name: string;
  oid: string;
  preferred_username: string;
  rh: string;
  sub: string;
  tid: string;
  uti: string;
  ver: string;
  verified_primary_email: string[];
  verified_secondary_email: string[];
};
