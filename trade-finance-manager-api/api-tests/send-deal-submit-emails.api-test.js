const moment = require('moment');
const {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
  sendDealSubmitEmails,
} = require('../src/v1/controllers/send-deal-submit-emails');
const CONSTANTS = require('../src/constants');
const formattedTimestamp = require('../src/v1/formattedTimestamp');
const MOCK_TEAMS = require('../src/v1/__mocks__/mock-teams');

describe('send-deal-submit-emails', () => {
  const mockDeal = {
    dealSnapshot: {
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
    },
    tfm: {
      tasks: [
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
      ],
      history: {
        tasks: [],
        emails: [],
      },
    },
  };

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
      const firstTask = mockDeal.tfm.tasks[0].groupTasks[0];

      const expectedEmailVariables = {
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        submissionType: mockDeal.dealSnapshot.details.submissionType,
        submissionDate: moment(formattedTimestamp(mockDeal.dealSnapshot.details.submissionDate)).format('Do MMMM YYYY'),
        bank: mockDeal.dealSnapshot.details.owningBank.name,
      };

      const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

      // api response is mocked/stubbed
      const expected = {
        content: {
          body: {},
        },
        id: CONSTANTS.EMAIL_TEMPLATE_IDS.DEAL_SUBMITTED_COMPLETE_TASK_MATCH_OR_CREATE_PARTIES,
        email: expectedTeamEmailAddress,
        ...expectedEmailVariables,
        template: {},
      };

      const result = await sendFirstTaskEmail(mockDeal);

      expect(result).toEqual(expected);
    });

    it('should return null when first task email should NOT be sent', async () => {
      const mockDealWithInvalidFirstTask = {
        ...mockDeal,
        tfm: {
          ...mockDeal.tfm,
          tasks: [
            {
              groupTasks: [
                {
                  title: 'Test',
                },
              ],
            },
          ],
        },
      };

      const result = await sendFirstTaskEmail(mockDealWithInvalidFirstTask);

      expect(result).toEqual(null);
    });
  });

  describe('sendDealSubmitEmails', () => {
    it('should return false when there is no deal', async () => {
      const result = await sendDealSubmitEmails();
      expect(result).toEqual(false);
    });

    it('should return sendDealSubmitEmails response', async () => {
      const result = await sendDealSubmitEmails(mockDeal);

      const expected = await sendFirstTaskEmail(mockDeal);
      expect(result).toEqual(expected);
    });
  });
});
