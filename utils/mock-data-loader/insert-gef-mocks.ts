import portalApi from './api';
import api from './gef/api';
import MOCKS from './gef';
import MOCK_USERS from './portal-users';
import { logger } from './helpers/logger.helper';
import { findPortalUserIdByUsernameOrFail } from './user-helper';

const { BANK1_MAKER1 } = MOCK_USERS;

export const insertGefMocks = async (token: string): Promise<void> => {
  logger.info('inserting GEF mocks');
  logger.info('inserting GEF mandatory-criteria-versioned', { depth: 1 });
  for (const item of MOCKS.MANDATORY_CRITERIA_VERSIONED) {
    await api.createMandatoryCriteriaVersioned(item, token);
  }

  logger.info('inserting GEF eligibility-criteria', { depth: 1 });
  for (const item of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(item, token);
  }

  logger.info('inserting GEF deals', { depth: 1 });

  const makerUserId = await findPortalUserIdByUsernameOrFail(BANK1_MAKER1.username);
  const latestEligibilityCriteria = await api.latestEligibilityCriteria(token);

  const makerToken = await portalApi.loginViaPortal(BANK1_MAKER1);

  for (const [_index, item] of MOCKS.APPLICATION.entries()) {
    const itemToInsert = { ...item, userId: makerUserId };
    const application = await api.createApplication(itemToInsert, makerToken);

    const applicationUpdate = {
      eligibility: latestEligibilityCriteria,
    };

    await api.updateApplication(application._id, applicationUpdate, makerToken);
  }

  const gefDeals = await api.listDeals(token);

  logger.info('inserting and updating GEF facilities', { depth: 1 });
  for (const [index, item] of MOCKS.FACILITIES.entries()) {
    for (const subitem of item) {
      const facility = await api.createFacilities({ ...subitem, dealId: gefDeals[index]._id }, makerToken);
      await api.updateFacilities(facility.details, subitem, makerToken);
    }
  }
};
