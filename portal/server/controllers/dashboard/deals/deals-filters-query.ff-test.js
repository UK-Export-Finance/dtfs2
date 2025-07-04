import { PORTAL_AMENDMENT_STATUS, ROLES, CHECKERS_AMENDMENTS_DEAL_ID, DEAL_STATUS } from '@ukef/dtfs2-common';
import { dashboardDealsFiltersQuery } from './deals-filters-query';
import { STATUS, FIELD_NAMES } from '../../../constants';
import getCheckersApprovalAmendmentDealIds from '../../../helpers/getCheckersApprovalAmendmentDealIds';

jest.mock('../../../helpers/getCheckersApprovalAmendmentDealIds');

const { MAKER, CHECKER } = ROLES;

describe('controllers/dashboard/deals - filters query', () => {
  const mockUser = {
    _id: '123',
    roles: [MAKER],
    bank: { id: '9' },
  };

  describe('when user is a checker', () => {
    it(`should return ${PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL} filter when FF_PORTAL_FACILITY_AMENDMENTS_ENABLED is enabled`, async () => {
      // Arrange
      const mockFilters = [];
      const mockDealIds = ['deal1', 'deal2'];

      mockUser.roles = [CHECKER];
      getCheckersApprovalAmendmentDealIds.mockResolvedValue(mockDealIds);

      // Act
      const result = await dashboardDealsFiltersQuery(mockFilters, mockUser);

      const expected = {
        AND: [
          { 'bank.id': mockUser.bank.id },
          {
            OR: [
              { status: STATUS.DEAL.READY_FOR_APPROVAL },
              { AND: [{ [CHECKERS_AMENDMENTS_DEAL_ID]: mockDealIds }, { [FIELD_NAMES.DEAL.STATUS]: DEAL_STATUS.UKEF_ACKNOWLEDGED }] },
            ],
          },
        ],
      };

      // Assert
      expect(result).toEqual(expected);
    });
  });
});
