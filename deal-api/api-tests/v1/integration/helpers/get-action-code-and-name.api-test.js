const getActionCodeAndName = require('../../../../src/v1/controllers/integration/helpers/get-action-code-and-name');

describe('creates action code dependant on submission type and status', () => {
  it('creates correct action codes for AIN', () => {
    /*
    AIN: 'Automatic Inclusion Notice',
    MIA: 'Manual Inclusion Application',
    */
    const dealFragment = {
      details: {
        submissionType: 'Automatic Inclusion Notice',
      },
    };

    const dealStatusList = [
      {
        status: 'Draft',
        actionCode: '003',
        actionName: 'NewDeal',
      },
      {
        status: 'Approved',
        actionCode: '010',
        actionName: 'ATPConfirm',
      },
      {
        status: 'confirmation_acknowledged',
        actionCode: '016',
        actionName: 'AmendDeal',
      },

    ];

    dealStatusList.forEach((dealStatus) => {
      const { actionCode, actionName } = getActionCodeAndName(dealFragment, dealStatus.status);
      expect(actionCode).toEqual(dealStatus.actionCode);
      expect(actionName).toEqual(dealStatus.actionName);
    });
  });

  it('creates correct action codes for MIA', () => {
    const dealFragment = {
      details: {
        submissionType: 'Manual Inclusion Application',
      },
    };

    const dealStatusList = [
      {
        status: 'Draft',
        actionCode: '001',
        actionName: 'NewDeal',
      },
      {
        status: 'submission_acknowledged',
        actionCode: '016',
        actionName: 'AmendDeal',
      },
      {
        status: 'confirmation_acknowledged',
        actionCode: '016',
        actionName: 'AmendDeal',
      },

    ];

    dealStatusList.forEach((dealStatus) => {
      const { actionCode, actionName } = getActionCodeAndName(dealFragment, dealStatus.status);
      expect(actionCode).toEqual(dealStatus.actionCode);
      expect(actionName).toEqual(dealStatus.actionName);
    });
  });
});
