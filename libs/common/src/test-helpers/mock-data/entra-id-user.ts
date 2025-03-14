import { TEAMS } from '../../constants';
import { EntraIdUser } from '../../types';

export function anEntraIdUser(): EntraIdUser {
  return {
    oid: 'an-oid',
    email: 'a-primary-email',
    given_name: 'a-given-name',
    family_name: 'a-family-name',
    roles: [TEAMS.BUSINESS_SUPPORT.id],
  };
}
