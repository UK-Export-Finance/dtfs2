const { updateComments } = require('../../../../src/v1/controllers/integration/type-b-helpers');
const dealCommentsController = require('../../../../src/v1/controllers/deal-comments.controller');


describe('update comment helper', () => {
  const dealId = '1111';
  let workflowDeal;
  const user = { username: 'UKEF workflow' };

  beforeEach(() => {
    dealCommentsController.addSpecialConditions = jest.fn();
    dealCommentsController.addComment = jest.fn();

    workflowDeal = {
      $: {
        Action_Code: '010',
      },
      Deal_comments: ['A deal comment'],
    };
  });

  it('doesn\'t update if comment field is missing', async () => {
    delete workflowDeal.Deal_comments;

    await updateComments(dealId, workflowDeal);
    expect(dealCommentsController.addComment).not.toHaveBeenCalled();
    expect(dealCommentsController.addSpecialConditions).not.toHaveBeenCalled();
  });

  it('doesn\'t update if no comment given', async () => {
    workflowDeal.Deal_comments = [];

    await updateComments(dealId, workflowDeal);
    expect(dealCommentsController.addComment).not.toHaveBeenCalled();
    expect(dealCommentsController.addSpecialConditions).not.toHaveBeenCalled();
  });


  it('should update deal comments if action code !== 007', async () => {
    await updateComments(dealId, workflowDeal);

    expect(dealCommentsController.addComment).toHaveBeenCalledWith(dealId, workflowDeal.Deal_comments[0], user);
    expect(dealCommentsController.addSpecialConditions).not.toHaveBeenCalled();
  });

  it('should update deal comments if action code == 007', async () => {
    workflowDeal.$.Action_Code = '007';

    await updateComments(dealId, workflowDeal);

    expect(dealCommentsController.addComment).not.toHaveBeenCalled();
    expect(dealCommentsController.addSpecialConditions).toHaveBeenCalledWith(dealId, workflowDeal.Deal_comments[0], user);
  });
});
