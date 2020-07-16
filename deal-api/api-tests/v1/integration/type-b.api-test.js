const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const aDeal = require('../deals/deal-builder');

const { processTypeB } = require('../../../src/v1/controllers/integration/type-b.controller');
const dealController = require('../../../src/v1/controllers/deal.controller');

const typeBxmlTemplate = require('./fixtures/type-b-template');

const insertValuesInXml = (values, xml) => {
  let newXml = xml;
  Object.entries(values).forEach(([key, val]) => {
    newXml = newXml.replace(`{{${key}}}`, val);
  });

  return newXml;
};

describe('Workflow type B XML processing', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
  });


  let dealId;
  let aBarclaysMaker;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
    dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle
  });

  it('should return error if non valid XML passed', async () => {
    const typeB = await processTypeB({ fileContents: '<nonvalid_xml' });
    expect(typeB.error).toBeDefined();
  });

  /*
  it('should process the type-b xml', async () => {
    const status = 'Confirmation acknowledged';

    const typeBxml = insertValuesInXml({ dealId, status }, typeBxmlTemplate);
    dealController.updateDeal = jest.fn();

    await processTypeB({ fileContents: typeBxml });
    const updateDealData = {
      body: {
        details: {
          status,
          ukefDealId: '40000016',
        },
      },
      params: {
        id: dealId,
      },
    };

    expect(dealController.updateDeal).toHaveBeenCalledWith(updateDealData);
  });
  */

  it('should return false if no deal found', async () => {
    const workflowStatus = 'confirmation_acknowledged';
    const typeBxml = insertValuesInXml({ dealId: '9999999', status: workflowStatus, actionCode: '004' }, typeBxmlTemplate);

    const updatedDeal = await processTypeB({ fileContents: typeBxml });

    expect(updatedDeal).toEqual(false);
  });

  it('should update the status to In Progress if status changes and action code = 004', async () => {
    const workflowStatus = 'confirmation_acknowledged';
    const typeBxml = insertValuesInXml({ dealId, status: workflowStatus, actionCode: '004' }, typeBxmlTemplate);

    const updatedDeal = await processTypeB({ fileContents: typeBxml });

    expect(updatedDeal.details.status).toEqual('In progress by UKEF');
  });

  it('should update the status to workflow status if status changes and action code != 004', async () => {
    const workflowStatus = 'confirmation_acknowledged';
    const typeBxml = insertValuesInXml({ dealId, status: workflowStatus, actionCode: '010' }, typeBxmlTemplate);

    const updatedDeal = await processTypeB({ fileContents: typeBxml });

    expect(updatedDeal.details.status).toEqual('Confirmation acknowledged');
  });

  it('should update comments return by workflow', async () => {
    const workflowStatus = 'confirmation_acknowledged';
    const dealComments = 'a workflow comment';

    const typeBxml = insertValuesInXml({
      dealId, status: workflowStatus, actionCode: '010', dealComments,
    }, typeBxmlTemplate);


    const updatedDeal = await processTypeB({ fileContents: typeBxml });

    expect(updatedDeal.comments[0].text).toEqual(dealComments);
    expect(updatedDeal.comments[0].user.username).toEqual('UKEF workflow');
  });

  it('should update special conditions workflow response has comment and action code = 007', async () => {
    const workflowStatus = 'confirmation_acknowledged';
    const dealComments = 'a workflow comment';

    const typeBxml = insertValuesInXml({
      dealId, status: workflowStatus, actionCode: '007', dealComments,
    }, typeBxmlTemplate);


    const updatedDeal = await processTypeB({ fileContents: typeBxml });

    expect(updatedDeal.comments.length).toEqual(0);
    expect(updatedDeal.specialConditions[0].text).toEqual(dealComments);
    expect(updatedDeal.specialConditions[0].user.username).toEqual('UKEF workflow');
  });
});
