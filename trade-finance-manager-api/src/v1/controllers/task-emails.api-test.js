/* eslint-disable no-underscore-dangle */

const {
  generateTaskUrl,
  generateTaskEmailVariables,
  sendUpdatedTaskEmail,
} = require('./task-emails');
const { lowercaseFirstLetter } = require('../../utils/string');

const api = require('../api');

const MOCK_DEAL_MIA_SUBMITTED = require('../__mocks__/mock-deal-MIA-submitted');
const MOCK_AIN_TASKS = require('../__mocks__/mock-AIN-tasks');
const MOCK_MIA_TASKS = require('../__mocks__/mock-MIA-tasks');
const CONSTANTS = require('../../constants');

describe('task emails functions', () => {
  const mockDeal = {
    dealSnapshot: MOCK_DEAL_MIA_SUBMITTED,
    tfm: {
      history: {
        emails: [],
      },
    },
  };

  describe('generateTaskUrl', () => {
    it('should return url from params', () => {
      const mockUrlOrigin = 'http://testing.com';
      const mockDealId = '123456';

      const mockTask = {
        id: 1,
        groupId: 2,
      };

      const result = generateTaskUrl(
        mockUrlOrigin,
        mockDealId,
        mockTask,
      );

      const { groupId, id } = mockTask;

      const expected = `${mockUrlOrigin}/case/${mockDealId}/tasks/${groupId}/${id}`;

      expect(result).toEqual(expected);
    });
  });

  describe('generateTaskEmailVariables', () => {
    it('should return object', () => {
      const mockUrlOrigin = 'http://testing.com';
      const mockDealId = '123456';

      const mockTask = {
        id: 1,
        groupId: 2,
        title: 'Test',
      };

      const mockExporterName = 'test exporter';
      const mockUkefDealId = '100200';

      const result = generateTaskEmailVariables(
        mockUrlOrigin,
        mockTask,
        mockDealId,
        mockExporterName,
        mockUkefDealId,
      );

      const expected = {
        taskTitle: lowercaseFirstLetter(mockTask.title),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDealId, mockTask),
        exporterName: mockExporterName,
        ukefDealId: mockUkefDealId,
      };

      expect(result).toEqual(expected);
    });
  });

  describe('sendUpdatedTaskEmail', () => {
    const mockUrlOrigin = 'http://test.com';

    beforeEach(() => {
      api.sendEmail.mockClear();
    });

    it('should send an email for CREATE_OR_LINK_SALESFORCE task', async () => {
      const mockTask = MOCK_AIN_TASKS[0].groupTasks.find(
        (t) => t.title === CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
      );

      await sendUpdatedTaskEmail(mockTask, mockDeal);

      const salesforceTeam = api.findOneTeam(mockTask.team.id);

      const expectedEmailVars = {
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
      };

      expect(api.sendEmail).toHaveBeenCalledWith(
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_SALEFORCE_NEW_DEAL,
        salesforceTeam.email,
        expectedEmailVars,
      );
    });

    it('should send an email for MIA - FILE_ALL_DEAL_EMAILS task', async () => {
      const mockTask = MOCK_MIA_TASKS[0].groupTasks.find(
        (t) => t.title === CONSTANTS.TASKS.MIA_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS,
      );

      await sendUpdatedTaskEmail(mockTask, mockDeal, mockUrlOrigin);

      const businessSupportTeam = api.findOneTeam(mockTask.team.id);

      const expectedEmailVars = {
        taskTitle: lowercaseFirstLetter(CONSTANTS.TASKS.MIA_GROUP_1_TASKS.FILE_ALL_DEAL_EMAILS),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDeal.dealSnapshot._id, mockTask),
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
      };

      expect(api.sendEmail).toHaveBeenCalledWith(
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
        businessSupportTeam.email,
        expectedEmailVars,
      );
    });

    it('should send an email for MIA - CREATE_CREDIT_ANALYSIS_DOCUMENT task', async () => {
      const mockTask = MOCK_MIA_TASKS[0].groupTasks.find(
        (t) => t.title === CONSTANTS.TASKS.MIA_GROUP_1_TASKS.CREATE_CREDIT_ANALYSIS_DOCUMENT,
      );

      await sendUpdatedTaskEmail(mockTask, mockDeal, mockUrlOrigin);

      const businessSupportTeam = api.findOneTeam(mockTask.team.id);

      const expectedEmailVars = {
        taskTitle: lowercaseFirstLetter(CONSTANTS.TASKS.MIA_GROUP_1_TASKS.CREATE_CREDIT_ANALYSIS_DOCUMENT),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDeal.dealSnapshot._id, mockTask),
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
      };

      expect(api.sendEmail).toHaveBeenCalledWith(
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
        businessSupportTeam.email,
        expectedEmailVars,
      );
    });

    it('should send an email for MIA - COMPLETE_ADVERSE_HISTORY_CHECK task', async () => {
      const mockTask = MOCK_MIA_TASKS[1].groupTasks.find(
        (t) => t.title === CONSTANTS.TASKS.MIA_GROUP_2_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK,
      );

      await sendUpdatedTaskEmail(mockTask, mockDeal, mockUrlOrigin);

      const underwriterManagersTeam = api.findOneTeam(mockTask.team.id);

      const expectedEmailVars = {
        taskTitle: lowercaseFirstLetter(CONSTANTS.TASKS.MIA_GROUP_2_TASKS.COMPLETE_ADVERSE_HISTORY_CHECK),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDeal.dealSnapshot._id, mockTask),
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
      };

      expect(api.sendEmail).toHaveBeenCalledWith(
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
        underwriterManagersTeam.email,
        expectedEmailVars,
      );
    });

    it('should send an email for MIA - CHECK_EXPOSURE task', async () => {
      const mockTask = MOCK_MIA_TASKS[2].groupTasks.find(
        (t) => t.title === CONSTANTS.TASKS.MIA_GROUP_3_TASKS.CHECK_EXPOSURE,
      );

      await sendUpdatedTaskEmail(mockTask, mockDeal, mockUrlOrigin);

      const underwritersTeam = api.findOneTeam(mockTask.team.id);

      const expectedEmailVars = {
        taskTitle: lowercaseFirstLetter(CONSTANTS.TASKS.MIA_GROUP_3_TASKS.CHECK_EXPOSURE),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDeal.dealSnapshot._id, mockTask),
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
      };

      expect(api.sendEmail).toHaveBeenCalledWith(
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
        underwritersTeam.email,
        expectedEmailVars,
      );
    });


    it('should send an email for MIA - GIVE_EXPORTER_A_CREDIT_RATING task', async () => {
      const mockTask = MOCK_MIA_TASKS[2].groupTasks.find(
        (t) => t.title === CONSTANTS.TASKS.MIA_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING,
      );

      await sendUpdatedTaskEmail(mockTask, mockDeal, mockUrlOrigin);

      const underwritersTeam = api.findOneTeam(mockTask.team.id);

      const expectedEmailVars = {
        taskTitle: lowercaseFirstLetter(CONSTANTS.TASKS.MIA_GROUP_3_TASKS.GIVE_EXPORTER_A_CREDIT_RATING),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDeal.dealSnapshot._id, mockTask),
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
      };

      expect(api.sendEmail).toHaveBeenCalledWith(
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
        underwritersTeam.email,
        expectedEmailVars,
      );
    });

    it('should send an email for MIA - COMPLETE_CREDIT_ANALYSIS task', async () => {
      const mockTask = MOCK_MIA_TASKS[2].groupTasks.find(
        (t) => t.title === CONSTANTS.TASKS.MIA_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS,
      );

      await sendUpdatedTaskEmail(mockTask, mockDeal, mockUrlOrigin);

      const underwritersTeam = api.findOneTeam(mockTask.team.id);

      const expectedEmailVars = {
        taskTitle: lowercaseFirstLetter(CONSTANTS.TASKS.MIA_GROUP_3_TASKS.COMPLETE_CREDIT_ANALYSIS),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDeal.dealSnapshot._id, mockTask),
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
      };

      expect(api.sendEmail).toHaveBeenCalledWith(
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
        underwritersTeam.email,
        expectedEmailVars,
      );
    });

    it('should send an email for MIA - CHECK_THE_CREDIT_ANALYSIS task', async () => {
      const mockTask = MOCK_MIA_TASKS[3].groupTasks.find(
        (t) => t.title === CONSTANTS.TASKS.MIA_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS,
      );

      await sendUpdatedTaskEmail(mockTask, mockDeal, mockUrlOrigin);

      const underwritersTeam = api.findOneTeam(mockTask.team.id);

      const expectedEmailVars = {
        taskTitle: lowercaseFirstLetter(CONSTANTS.TASKS.MIA_GROUP_4_TASKS.CHECK_THE_CREDIT_ANALYSIS),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDeal.dealSnapshot._id, mockTask),
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
      };

      expect(api.sendEmail).toHaveBeenCalledWith(
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
        underwritersTeam.email,
        expectedEmailVars,
      );
    });

    it('should send an email for MIA - COMPLETE_RISK_ANALYSIS task', async () => {
      const mockTask = MOCK_MIA_TASKS[3].groupTasks.find(
        (t) => t.title === CONSTANTS.TASKS.MIA_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS,
      );

      await sendUpdatedTaskEmail(mockTask, mockDeal, mockUrlOrigin);

      const underwritersTeam = api.findOneTeam(mockTask.team.id);

      const expectedEmailVars = {
        taskTitle: lowercaseFirstLetter(CONSTANTS.TASKS.MIA_GROUP_4_TASKS.COMPLETE_RISK_ANALYSIS),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDeal.dealSnapshot._id, mockTask),
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
      };

      expect(api.sendEmail).toHaveBeenCalledWith(
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
        underwritersTeam.email,
        expectedEmailVars,
      );
    });

    it('should send an email for MIA - APPROVE_OR_DECLINE_THE_DEAL task', async () => {
      const mockTask = MOCK_MIA_TASKS[3].groupTasks.find(
        (t) => t.title === CONSTANTS.TASKS.MIA_GROUP_4_TASKS.APPROVE_OR_DECLINE_THE_DEAL,
      );

      await sendUpdatedTaskEmail(mockTask, mockDeal, mockUrlOrigin);

      const underwritersTeam = api.findOneTeam(mockTask.team.id);

      const expectedEmailVars = {
        taskTitle: lowercaseFirstLetter(CONSTANTS.TASKS.MIA_GROUP_4_TASKS.APPROVE_OR_DECLINE_THE_DEAL),
        taskUrl: generateTaskUrl(mockUrlOrigin, mockDeal.dealSnapshot._id, mockTask),
        exporterName: mockDeal.dealSnapshot.submissionDetails['supplier-name'],
        ukefDealId: mockDeal.dealSnapshot.details.ukefDealId,
      };

      expect(api.sendEmail).toHaveBeenCalledWith(
        CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
        underwritersTeam.email,
        expectedEmailVars,
      );
    });

    it('should not send a task email if not necessary', async () => {
      const nonSalesforceTask = MOCK_AIN_TASKS[0].groupTasks.find(
        (t) => t.title !== CONSTANTS.TASKS.AIN_AND_MIA.GROUP_1.CREATE_OR_LINK_SALESFORCE,
      );

      await sendUpdatedTaskEmail(nonSalesforceTask, mockDeal);

      expect(api.sendEmail).not.toHaveBeenCalled();
    });
  });
});

/* eslint-enable no-underscore-dangle */
