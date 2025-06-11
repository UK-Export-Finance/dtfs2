import { TEAMS } from '../../constants';
import { EntraIdUser } from '../../types';

export function anEntraIdUser(): EntraIdUser {
  return {
    oid: 'an-oid',
    verified_primary_email: ['test@ukexportfinance.gov.uk'],
    given_name: 'a-given-name',
    family_name: 'a-family-name',
    roles: [TEAMS.BUSINESS_SUPPORT.id],
  };
}
