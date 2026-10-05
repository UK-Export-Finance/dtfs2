import { TEAMS } from '../../constants';
import { MOCK_EMAIL } from './email';
import { EntraIdUser } from '../../types';

export function anEntraIdUser(): EntraIdUser {
  return {
    oid: 'an-oid',
    verified_primary_email: [MOCK_EMAIL],
    given_name: 'a-given-name',
    family_name: 'a-family-name',
    roles: [TEAMS.BUSINESS_SUPPORT.id],
  };
}
