const addFirstTaskEmailSentFlag = require('./add-first-task-email-sent-flag');
const { createTasksAIN } = require('../../helpers/create-tasks');
const MOCK_DEAL_AIN = require('../../__mocks__/mock-deal');

describe('deal submit - add TFM data - first task email sent flag', () => {
  it('should add emailSent=true to the first task', () => {
    const mockEmailResponse = {
      content: {
        body: {},
      },
    };

    const mockTasks = createTasksAIN();

    const mockDeal = {
      dealSnapshot: MOCK_DEAL_AIN,
      tfm: {
        tasks: mockTasks,
      },
    };

    const originalFirstTask = mockTasks[0].groupTasks[0];

    // make sure that emailSent flag does not exist to start with.
    expect(originalFirstTask.emailSent).toBeUndefined();

    const result = addFirstTaskEmailSentFlag(mockEmailResponse, mockDeal.tfm.tasks);
    const resultFirstTask = result[0].groupTasks[0];

    const expected = {
      ...originalFirstTask,
      emailSent: true,
    };

    expect(resultFirstTask).toEqual(expected);
  });
});
