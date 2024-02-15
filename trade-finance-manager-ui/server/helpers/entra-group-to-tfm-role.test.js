import { getRolesGroupedByEntraId, getTfmRolesFromEntraGroups } from './entra-group-to-tfm-role';

require('dotenv').config();

const { TEAMS } = require('../constants/team-ids')

describe('helpers - entra-group-to-tfm-role', () => {
  describe('getRolesGroupedByEntraId', () => {
    it('should return entra groups for all TEAMS', () => {
      const result = getRolesGroupedByEntraId();

      expect(Object.values(result).length).toEqual(Object.values(TEAMS).length);
    });
  });

  describe('getTfmRolesFromEntraGroups', () => {
    const roles = ['UNDERWRITING_SUPPORT', 'UNDERWRITER_MANAGERS'];
    const entraIds = [process.env.AZURE_SSO_GROUP_UNDERWRITING_SUPPORT, process.env.AZURE_SSO_GROUP_UNDERWRITER_MANAGERS];

    const rolesReadOnly = ['READ_ONLY'];
    const entraIdsReadOnly = [process.env.AZURE_SSO_GROUP_READ_ONLY];

    it('should return tfm role ids for entra Ids', () => {
      const result = getTfmRolesFromEntraGroups(entraIds);

      expect(result).toEqual(roles);
    });

    it('should return tfm role id for entra ReadOnly id', () => {
      const result = getTfmRolesFromEntraGroups(entraIdsReadOnly);

      expect(result).toEqual(rolesReadOnly);
    });
  });
});
