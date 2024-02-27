import dotenv from 'dotenv';
import { getTfmRolesGroupedByEntraId, getTfmRolesFromEntraGroups } from './get-tfm-roles-from-entra-groups';
import { TEAMS } from '../../constants/teams';

dotenv.config();

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

    it('should return multiple tfm role ids for multiple entra Ids', () => {
      const result = getTfmRolesFromEntraGroups(entraGroupIds);

      expect(result).toEqual(tfmRoles);
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
    `(
      'For entra group $envVariable return TFM team $tfmRole',
      ({ envVariable, tfmRole }: { envVariable: string; tfmRole: string }) => {
        const result = getTfmRolesFromEntraGroups([process.env[envVariable]]);

        // Assert
        expect(result).toEqual([tfmRole]);
      },
    );
  });
});
