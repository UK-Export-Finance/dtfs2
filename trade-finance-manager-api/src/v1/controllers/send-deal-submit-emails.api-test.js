const moment = require('moment');
const {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
  sendDealSubmitEmails,
} = require('./send-deal-submit-emails');
const CONSTANTS = require('../../constants');
const formattedTimestamp = require('../formattedTimestamp');

describe('send-deal-submit-emails', () => {
  const mockDealSnapshot = {
    details: {
      submissionType: 'Manual Inclusion Application',
      submissionDate: '1606900616651',
      owningBank: {
        name: 'Test Bank',
      },
    },
    submissionDetails: {
      'supplier-name': 'Test Exporter Name',
    },
  };

  const mockTasksWithMatchCreatePartiesFirstTask = [
    {
      groupTasks: [
        {
          title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
          team: {
            id: 'BUSINESS_SUPPORT',
          },
        },
      ],
    },
  ];

  describe('shouldSendFirstTaskEmail', () => {
    it('should return true when task title is `match or create parties`', () => {
      const mockTask = {
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
      };

      const result = shouldSendFirstTaskEmail(mockTask);
      expect(result).toEqual(true);
    });

    it('should return false when task title is NOT `match or create parties`', () => {
      const mockTask = {
        title: 'Test',
      };

      const result = shouldSendFirstTaskEmail(mockTask);
      expect(result).toEqual(false);
    });
  });

  describe('sendFirstTaskEmail', () => {
    it('should return API response with correct emailVariables', async () => {
      const firstTask = mockTasksWithMatchCreatePartiesFirstTask[0].groupTasks[0];

      const expectedEmailVariables = {
        exporterName: mockDealSnapshot.submissionDetails['supplier-name'],
        submissionType: mockDealSnapshot.details.submissionType,
        submissionDate: moment(formattedTimestamp(mockDealSnapshot.details.submissionDate)).format('Do MMMM YYYY'),
        bank: mockDealSnapshot.details.owningBank.name,
      };

      // api response is mocked/stubbed
      const expected = {
        content: {
          body: {},
        },
        id: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_SUBMITTED_COMPLETE_TASK_MATCH_OR_CREATE_PARTIES,
        email: process.env[`TFM_TEAM_EMAIL_${firstTask.team.id}`],
        ...expectedEmailVariables,
        template: {},
      };

      const result = await sendFirstTaskEmail(mockTasksWithMatchCreatePartiesFirstTask, mockDealSnapshot);

      expect(result).toEqual(expected);
    });

    it('should return null when first task email should NOT be sent', async () => {
      const mockTasks = [
        {
          groupTasks: [
            {
              title: 'Test',
            },
          ],
        },
      ];

      const result = await sendFirstTaskEmail(mockTasks, {});

      expect(result).toEqual(null);
    });
  });

  describe('sendDealSubmitEmails', () => {
    it('should return false when there is no deal', async () => {
      const result = await sendDealSubmitEmails();
      expect(result).toEqual(false);
    });

    it('should return sendDealSubmitEmails response', async () => {
      const mockDeal = {
        dealSnapshot: mockDealSnapshot,
        tfm: {
          tasks: mockTasksWithMatchCreatePartiesFirstTask,
        },
      };

      const result = await sendDealSubmitEmails(mockDeal);

      const expected = await sendFirstTaskEmail(mockDeal.tfm.tasks, mockDeal.dealSnapshot);
      expect(result).toEqual(expected);
    });
  });
});
