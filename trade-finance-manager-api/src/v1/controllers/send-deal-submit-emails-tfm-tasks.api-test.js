const { shouldSendFirstTaskEmail, sendFirstTaskEmail } = require('./send-deal-submit-emails');
const { generateTaskEmailVariables } = require('../helpers/generate-task-email-variables');

const CONSTANTS = require('../../constants');
const MOCK_TEAMS = require('../__mocks__/mock-teams');
const api = require('../api');

const MOCK_NOTIFY_EMAIL_RESPONSE = require('../__mocks__/mock-notify-email-response');
const MOCK_MIA_NOT_SUBMITTED = require('../__mocks__/mock-deal-MIA-not-submitted');
const { mockFindOneTeam } = require('../__mocks__/common-api-mocks');

const sendEmailApiMock = jest.fn(() => Promise.resolve(MOCK_NOTIFY_EMAIL_RESPONSE));

describe('send-deal-submit-emails - TFM tasks', () => {
  let mockDeal;

  beforeEach(() => {
    mockFindOneTeam();
    api.sendEmail.mockClear();
    api.sendEmail = sendEmailApiMock;

    mockDeal = {
      _id: MOCK_MIA_NOT_SUBMITTED._id,
      ukefDealId: MOCK_MIA_NOT_SUBMITTED.details.ukefDealId,
      submissionType: MOCK_MIA_NOT_SUBMITTED.submissionType,
      name: MOCK_MIA_NOT_SUBMITTED.bankInternalRefName,
      maker: MOCK_MIA_NOT_SUBMITTED.maker,
      exporter: {
        companyName: MOCK_MIA_NOT_SUBMITTED.exporter.companyName,
      },
      facilities: [...MOCK_MIA_NOT_SUBMITTED.bondTransactions.items, ...MOCK_MIA_NOT_SUBMITTED.loanTransactions.items],
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

    it('should return false when task has emailSent flag', () => {
      const mockTask = {
        title: 'Test',
        emailSent: true,
      };

      const result = shouldSendFirstTaskEmail(mockTask);
      expect(result).toEqual(false);
    });
  });

  describe('sendFirstTaskEmail', () => {
    it('should return API response with correct emailVariables', async () => {
      const firstTask = mockDeal.tfm.tasks[0].groupTasks[0];

      const expectedEmailVariables = generateTaskEmailVariables(
        process.env.TFM_UI_URL,
        firstTask,
        mockDeal._id,
        mockDeal.exporter.companyName,
        mockDeal.ukefDealId,
      );

      const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

      await sendFirstTaskEmail(mockDeal);

      expect(sendEmailApiMock).toHaveBeenCalled();

      const firstSendEmailCall = sendEmailApiMock.mock.calls[0];

      expect(firstSendEmailCall).toEqual([CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START, expectedTeamEmailAddress, { ...expectedEmailVariables }]);
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
