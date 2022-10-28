/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const Chance = require('chance');
const api = require('./api');
const apiGef = require('./gef/api');
const centralApi = require('./centralApi');
const portalApi = require('./api');
const PORTAL_MOCKS = require('./portal');
const MOCK_BANKS = require('./banks');
const MOCKS_BSS = require('./bss');
const MOCKS_GEF = require('./gef');

const tokenFor = require('./temporary-token-handler');

const chance = new Chance();

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
  for (const mandatoryCriteria of MOCKS_BSS.MANDATORY_CRITERIA) {
    await api.createMandatoryCriteria(mandatoryCriteria, token);
  }

  console.info('inserting BSS eligibility-criteria');
  for (const eligibilityCriteria of MOCKS_BSS.ELIGIBILITY_CRITERIA) {
    await api.createEligibilityCriteria(eligibilityCriteria, token);
  }

  console.info('inserting BSS deals');
  const insertedDeals = [];

  for (const deal of MOCKS_BSS.DEALS) {
    const newDeal = deal;
    newDeal.bankInternalRefName = chance.sentence({ words: 2 });
    newDeal.additionalRefName = chance.sentence({ words: 2 });
    newDeal.exporter = { companyName: chance.company() };

    const { _id } = await api.createDeal(newDeal, tfmMakerToken);
    const { deal: createdDeal } = await api.getDeal(_id, tfmMakerToken);

    insertedDeals.push(createdDeal);
  }

  console.info('inserting BSS facilities');
  MOCKS_BSS.FACILITIES.forEach(async (facility) => {
    const associatedDeal = insertedDeals.find((deal) => deal.mockId === facility.mockDealId);
    const facilityToInsert = {
      ...facility,
      dealId: associatedDeal._id,
    };
    await centralApi.createFacility(facilityToInsert, facilityToInsert.dealId, tfmMakerToken);
  });

  const allUsers = await portalApi.listUsers();
  const makerUserId = allUsers.find((user) => user.username === 'BANK1_MAKER1')._id;

  console.info('inserting GEF mandatory-criteria-versioned');
  for (const item of MOCKS_GEF.MANDATORY_CRITERIA_VERSIONED) {
    await apiGef.createMandatoryCriteriaVersioned(item, token);
  }

  console.info('inserting GEF eligibility-criteria');
  for (const item of MOCKS_GEF.ELIGIBILITY_CRITERIA) {
    await apiGef.createEligibilityCriteria(item, token);
  }

  console.info('inserting GEF deals');

  const latestEligibilityCriteria = await apiGef.latestEligibilityCriteria(token);

  for (const val of MOCKS_GEF.APPLICATION.entries()) {
    const [, item] = val;
    item.userId = makerUserId;
    const application = await apiGef.createApplication(item, token);

    const applicationUpdate = {
      submissionType: item.submissionType,
    };

    applicationUpdate.eligibility = latestEligibilityCriteria;

    await apiGef.updateApplication(application._id, applicationUpdate, token);
  }

  const gefDeals = await apiGef.listDeals(token);

  console.info('inserting and updating GEF facilities');
  for (const [index, item] of MOCKS_GEF.FACILITIES.entries()) {
    for (const subitem of item) {
      subitem.dealId = gefDeals[index]._id;
      const facility = await apiGef.createFacilities(subitem, token);
      delete subitem.dealId;
      await apiGef.updateFacilities(facility.details, subitem, token);
    }
  }
};

module.exports = insertMocks;
