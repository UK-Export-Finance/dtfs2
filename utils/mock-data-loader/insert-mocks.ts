import { WithoutId, ObjectId } from 'mongodb';
import { Bank, PortalUser } from '@ukef/dtfs2-common';
import api from './api';
import centralApi from './centralApi';
import MOCK_PORTAL_USERS, { MockUser } from './portal-users';
import { MOCK_BANKS } from './banks';
import MOCKS from './bss';
import { mongoDbClient } from './database/database-client';
import { logger, generateSaltAndHash } from './helpers';

const mapUserToMongoUser = (user: MockUser): WithoutId<PortalUser> => ({
  'user-status': 'active',
  firstname: user.firstname,
  surname: user.surname,
  roles: user.roles,
  timezone: user.timezone,
  bank: user.bank as Bank,
  username: user.username,
  email: user.email,
  ...generateSaltAndHash(user.password),
});

export const insertMocks = async (mockDataLoaderToken: string): Promise<void> => {
  logger.info('inserting portal mocks');
  logger.info('inserting portal users', { depth: 1 });

  const userCollection = await mongoDbClient.getCollection('users');
  await userCollection.insertMany(Object.values(MOCK_PORTAL_USERS).map(mapUserToMongoUser));

  logger.info('inserting banks', { depth: 1 });
  const banksCollection = await mongoDbClient.getCollection('banks');
  await banksCollection.insertMany(MOCK_BANKS);

  logger.info('inserting BSS mandatory-criteria', { depth: 1 });
  for (const mandatoryCriteria of MOCKS.MANDATORY_CRITERIA) {
    await api.createMandatoryCriteria(mandatoryCriteria, mockDataLoaderToken);
  }

  logger.info('inserting BSS eligibility-criteria', { depth: 1 });
  for (const eligibilityCriteria of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(eligibilityCriteria, mockDataLoaderToken);
  }

  const maker = MOCK_PORTAL_USERS.BANK1_MAKER3;
  const makerToken = await api.loginViaPortal(maker);

  logger.info('inserting BSS deals', { depth: 1 });
  const insertedDeals: { _id: ObjectId; mockId: number }[] = [];
  for (const deal of MOCKS.DEALS) {
    const { _id } = await api.createDeal(deal, makerToken);
    const { deal: createdDeal } = await api.getDeal(_id, makerToken);

    insertedDeals.push(createdDeal);
  }

  logger.info('inserting BSS facilities', { depth: 1 });
  await Promise.all(
    MOCKS.FACILITIES.map(async (facility) => {
      const associatedDeal = insertedDeals.find((deal) => deal.mockId === facility.mockDealId);
      const facilityToInsert = {
        ...facility,
        dealId: associatedDeal?._id,
      };
      await centralApi.createFacility(facilityToInsert, facilityToInsert.dealId, makerToken);
    }),
  );
};
