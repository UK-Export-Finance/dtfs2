import dotenv from 'dotenv';
import { getTfmRolesFromEntraGroups } from './get-tfm-roles-from-entra-groups';
import { TEAM_IDS } from '../../constants/teams';

dotenv.config();

describe('helpers - get-tfm-roles-from-entra-groups', () => {
  describe('getTfmRolesFromEntraGroups', () => {
    const tfmRoles = ['UNDERWRITING_SUPPORT', 'UNDERWRITER_MANAGERS'];
    const entraGroupIds = [process.env.AZURE_SSO_GROUP_UNDERWRITING_SUPPORT, process.env.AZURE_SSO_GROUP_UNDERWRITER_MANAGERS];

    it('should return multiple tfm role ids for multiple entra Ids', () => {
      const result = getTfmRolesFromEntraGroups(entraGroupIds);

      expect(result).toEqual(tfmRoles);
    });

    it('should return all tfm roles', () => {
      const allEntraGroupIds = [
        process.env.AZURE_SSO_GROUP_UNDERWRITING_SUPPORT,
        process.env.AZURE_SSO_GROUP_UNDERWRITER_MANAGERS,
        process.env.AZURE_SSO_GROUP_UNDERWRITERS,
        process.env.AZURE_SSO_GROUP_RISK_MANAGERS,
        process.env.AZURE_SSO_GROUP_BUSINESS_SUPPORT,
        process.env.AZURE_SSO_GROUP_PIM,
        process.env.AZURE_SSO_GROUP_PDC_READ,
        process.env.AZURE_SSO_GROUP_PDC_RECONCILE,
      ];

      const result = getTfmRolesFromEntraGroups(allEntraGroupIds);

      expect(result).toEqual(TEAM_IDS);

      expect(result.length).toEqual(TEAM_IDS.length);
    });

    it('should skip not existing Entra ids', () => {
      const notExistingEntraGroupIds = ['123456', null, true, 123456, [], {}, process.env];

      const result = getTfmRolesFromEntraGroups(notExistingEntraGroupIds);

      expect(result).toStrictEqual([]);
    });

    it.each`
      envVariable                               | tfmRole
      ${'AZURE_SSO_GROUP_UNDERWRITERS'}         | ${'UNDERWRITERS'}
      ${'AZURE_SSO_GROUP_UNDERWRITING_SUPPORT'} | ${'UNDERWRITING_SUPPORT'}
      ${'AZURE_SSO_GROUP_UNDERWRITER_MANAGERS'} | ${'UNDERWRITER_MANAGERS'}
      ${'AZURE_SSO_GROUP_RISK_MANAGERS'}        | ${'RISK_MANAGERS'}
      ${'AZURE_SSO_GROUP_BUSINESS_SUPPORT'}     | ${'BUSINESS_SUPPORT'}
      ${'AZURE_SSO_GROUP_PIM'}                  | ${'PIM'}
      ${'AZURE_SSO_GROUP_PDC_READ'}             | ${'PDC_READ'}
      ${'AZURE_SSO_GROUP_PDC_RECONCILE'}        | ${'PDC_RECONCILE'}
    `('For entra group $envVariable return TFM team $tfmRole', ({ envVariable, tfmRole }: { envVariable: string; tfmRole: string }) => {
      const result = getTfmRolesFromEntraGroups([process.env[envVariable]]);

      // Assert
      expect(result).toEqual([tfmRole]);
    });
  });
});
