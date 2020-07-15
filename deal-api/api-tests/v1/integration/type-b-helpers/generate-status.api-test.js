const { generateStatus } = require('../../../../src/v1/controllers/integration/type-b-helpers');

const portalDealSnippet = {
  details: {
    status: 'Draft',
  },
};

const workflowTypeB = {
  $: {
    Action_Code: '010',
  },
  Deal_status: ['confirmation_acknowledged'],

};

describe('generates status according to typeB values', () => {
  it('returns "acknowledged by UKEF" status if action code = 004', () => {
    const status = generateStatus(portalDealSnippet, {
      ...workflowTypeB,
      $: {
        Action_Code: '004',
      },
    });
    expect(status).toEqual('In progress by UKEF');
  });

  it('returns corresponding portal status if action code != 004', () => {
    const status = generateStatus(portalDealSnippet, workflowTypeB);
    expect(status).toEqual('Confirmation acknowledged');
  });
});
