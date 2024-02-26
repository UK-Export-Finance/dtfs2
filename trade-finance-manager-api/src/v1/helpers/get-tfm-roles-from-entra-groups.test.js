import { getTfmRolesGroupedByEntraId, getTfmRolesFromEntraGroups } from './get-tfm-roles-from-entra-groups';

require('dotenv').config();

const { TEAMS } = require('../../constants/teams')

describe('helpers - get-tfm-roles-from-entra-groups', () => {
  describe('getTfmRolesGroupedByEntraId', () => {
    it('should return entra groups for all TEAMS', () => {
      const result = Object.values(getTfmRolesGroupedByEntraId());
      const expected = Object.values(TEAMS);

      expect(result.length).toEqual(expected.length);
    });
  });

  describe('getTfmRolesFromEntraGroups', () => {
    const tfmRoles = ['UNDERWRITING_SUPPORT', 'UNDERWRITER_MANAGERS'];
    const entraGroupIds = [process.env.AZURE_SSO_GROUP_UNDERWRITING_SUPPORT, process.env.AZURE_SSO_GROUP_UNDERWRITER_MANAGERS];

    const tfmRolesReadOnly = ['READ_ONLY'];
    const entraGroupIdsReadOnly = [process.env.AZURE_SSO_GROUP_READ_ONLY];

    it('should return tfm role ids for entra Ids', () => {
      const result = getTfmRolesFromEntraGroups(entraGroupIds);

      expect(result).toEqual(tfmRoles);
    });

    it('should return tfm role id for entra ReadOnly id', () => {
      const result = getTfmRolesFromEntraGroups(entraGroupIdsReadOnly);

      expect(result).toEqual(tfmRolesReadOnly);
    });
  });
});
