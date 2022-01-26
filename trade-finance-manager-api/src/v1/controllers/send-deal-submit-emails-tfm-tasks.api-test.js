const {
  shouldSendFirstTaskEmail,
  sendFirstTaskEmail,
} = require('./send-deal-submit-emails');
const { generateTaskEmailVariables } = require('../helpers/generate-task-email-variables');

const CONSTANTS = require('../../constants');
const MOCK_TEAMS = require('../__mocks__/mock-teams');
const api = require('../api');

const MOCK_NOTIFY_EMAIL_RESPONSE = require('../__mocks__/mock-notify-email-response');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(
  MOCK_NOTIFY_EMAIL_RESPONSE,
));

describe('send-deal-submit-emails - TFM tasks', () => {
  let mockDeal;

  beforeEach(async () => {
    api.sendEmail.mockClear();
    api.sendEmail = sendEmailApiSpy;

    const mockDealMia = await api.findOneDeal('MOCK_MIA_NOT_SUBMITTED');

    mockDeal = {
      _id: mockDealMia._id,
      ukefDealId: mockDealMia.dealSnapshot.details.ukefDealId,
      submissionType: mockDealMia.dealSnapshot.submissionType,
      name: mockDealMia.dealSnapshot.bankInternalRefName,
      maker: mockDealMia.dealSnapshot.maker,
      exporter: {
        companyName: mockDealMia.dealSnapshot.exporter.companyName,
      },
      facilities: [
        ...mockDealMia.dealSnapshot.bondTransactions.items,
        ...mockDealMia.dealSnapshot.loanTransactions.items,
      ],
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
  });

  describe('shouldSendFirstTaskEmail', () => {
    it('should return true when task title is `match or create parties`', () => {
      const mockTask = {
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.MATCH_OR_CREATE_PARTIES,
      };

      const result = shouldSendFirstTaskEmail(mockTask);
      expect(result).toEqual(true);
    });

    it('should return true when task title is `Create or link this opportunity in Salesforce`', () => {
      const mockTask = {
        title: CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
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

      const expectedEmailVariables = generateTaskEmailVariables(
        process.env.TFM_URI,
        firstTask,
        mockDeal._id,
        mockDeal.exporter.companyName,
        mockDeal.ukefDealId,
      );

      const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

      await sendFirstTaskEmail(mockDeal);

      expect(sendEmailApiSpy).toHaveBeenCalled();

      const firstSendEmailCall = sendEmailApiSpy.mock.calls[0];

      expect(firstSendEmailCall).toEqual([
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
        expectedTeamEmailAddress,
        { ...expectedEmailVariables },
      ]);
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
});
