const api = require('./api');
const centralApi = require('./centralApi');
const PORTAL_MOCKS = require('./portal');
const MOCK_BANKS = require('./banks');
const MOCKS = require('./bss');

const tokenFor = require('./temporary-token-handler');

const insertMocks = async () => {
  const token = await tokenFor({
    username: 're-insert-mocks',
    password: 'AbC!2345',
    firstname: 'Mock',
    surname: 'DataLoader',
    roles: ['maker', 'editor', 'data-admin'],
    email: 're-insert-mocks-data-loader',
    bank: MOCK_BANKS.find((bank) => bank.id === '9'),
  });

  const tfmMaker = {
    username: 'BANK3_MAKER3',
    password: 'AbC!2345',
    firstname: 'Tamil',
    surname: 'Rahani',
    email: 'maker33@ukexportfinance.gov.uk',
    timezone: 'Europe/London',
    roles: ['maker'],
    bank: MOCK_BANKS.find((bank) => bank.id === '9'),
  };
  const tfmMakerToken = await tokenFor({
    ...tfmMaker,
  });

  console.info('inserting Portal users');
  for (const user of PORTAL_MOCKS.USERS) {
    await api.createUser(user);
  }

  console.info('inserting banks');
  for (const bank of MOCK_BANKS) {
    await api.createBank(bank, token);
  }

  console.info('inserting BSS mandatory-criteria');
  for (const mandatoryCriteria of MOCKS.MANDATORY_CRITERIA) {
    await api.createMandatoryCriteria(mandatoryCriteria, token);
  }

  console.info('inserting BSS eligibility-criteria');
  for (const eligibilityCriteria of MOCKS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(eligibilityCriteria, token);
  }

  console.info('inserting BSS deals');
  const insertedDeals = [];

  for (const deal of MOCKS.DEALS) {
    const { _id } = await api.createDeal(deal, tfmMakerToken);
    const { deal: createdDeal } = await api.getDeal(_id, tfmMakerToken);

    insertedDeals.push(createdDeal);
  }

  console.info('inserting BSS facilities');
  MOCKS.FACILITIES.forEach(async (facility) => {
    const associatedDeal = insertedDeals.find((deal) => deal.mockId === facility.mockDealId);
    const facilityToInsert = {
      ...facility,
      dealId: associatedDeal._id,
    };
    await centralApi.createFacility(facilityToInsert, facilityToInsert.dealId, tfmMakerToken);
  });
};

module.exports = insertMocks;
