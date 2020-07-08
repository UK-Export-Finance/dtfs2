const { processTypeB } = require('../../../src/v1/controllers/integration/type-b.controller');
const dealController = require('../../../src/v1/controllers/deal.controller');

const typeBxml = require('./fixtures/type-b');

describe('Workflow type B XML processing', () => {
  dealController.updateDeal = jest.fn();

  it('should return error if non valid XML passed', async () => {
    const typeB = await processTypeB({ fileContents: '<nonvalid_xml' });
    expect(typeB.error).toBeDefined();
  });

  it('should update the appropriate deal', async () => {
    await processTypeB({ fileContents: typeBxml });
    const updateDealData = {
      body: {
        details: {
          status: 'Confirmation acknowledged',
          ukefDealId: '40000016',
        },
      },
      params: {
        id: '37749',
      },
    };

    expect(dealController.updateDeal).toHaveBeenCalledWith(updateDealData);
  });
});
