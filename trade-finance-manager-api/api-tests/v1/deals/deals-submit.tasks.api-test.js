jest.mock('../../../src/v1/controllers/acbs.controller', () => ({
  issueAcbsFacilities: jest.fn(),
}));

jest.mock('../../../src/v1/controllers/deal.controller', () => ({
  ...jest.requireActual('../../../src/v1/controllers/deal.controller'),
}));

const { format } = require('date-fns');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const api = require('../../../src/v1/api');
const acbsController = require('../../../src/v1/controllers/acbs.controller');
const CONSTANTS = require('../../../src/constants');
const { createDealTasks } = require('../../../src/v1/controllers/deal.tasks');
const { generateTaskEmailVariables } = require('../../../src/v1/helpers/generate-task-email-variables');
const { submitDeal, createSubmitBody } = require('../utils/submitDeal');
const { mockFindOneDeal, mockUpdateDeal } = require('../../../src/v1/__mocks__/common-api-mocks');
const MOCK_DEAL_AIN_NO_COMPANIES_HOUSE = require('../../../src/v1/__mocks__/mock-deal-no-companies-house');
const MOCK_DEAL_MIN = require('../../../src/v1/__mocks__/mock-deal-MIN');
const MOCK_DEAL_MIA_SUBMITTED = require('../../../src/v1/__mocks__/mock-deal-MIA-submitted');

const MOCK_NOTIFY_EMAIL_RESPONSE = require('../../../src/v1/__mocks__/mock-notify-email-response');
const MOCK_TEAMS = require('../../../src/v1/__mocks__/mock-teams');
const { MOCK_PORTAL_USERS } = require('../../../src/v1/__mocks__/mock-portal-users');

const sendEmailApiSpy = jest.fn(() => Promise.resolve(MOCK_NOTIFY_EMAIL_RESPONSE));

const findBankByIdSpy = jest.fn(() => Promise.resolve({ emails: [] }));
const findOneTeamSpy = jest.fn(() => Promise.resolve({ email: [] }));

describe('/v1/deals', () => {
  beforeEach(() => {
    acbsController.issueAcbsFacilities.mockClear();
    api.getFacilityExposurePeriod.mockClear();
    api.getPremiumSchedule.mockClear();

    sendEmailApiSpy.mockClear();
    api.sendEmail = sendEmailApiSpy;

    api.updatePortalBssDealStatus = jest.fn();

    findBankByIdSpy.mockClear();
    api.findBankById = findBankByIdSpy;

    findOneTeamSpy.mockClear();
    api.findOneTeam = findOneTeamSpy;

    api.findOneDeal.mockReset();
    mockFindOneDeal();

    api.updateDeal.mockReset();
    mockUpdateDeal();
  });

  describe('PUT /v1/deals/:dealId/submit', () => {
    describe('deal/case tasks', () => {
      describe('when deal is AIN', () => {
        it('adds AIN tasks to the deal with emailSent flag added to the first task', async () => {
          const { status, body: submittedDeal } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_NO_COMPANIES_HOUSE));

          expect(status).toEqual(200);

          const taskCreation = await createDealTasks(submittedDeal, generatePortalAuditDetails(MOCK_PORTAL_USERS[0]._id));

          const expected = taskCreation.tfm.tasks;
          expected[0].groupTasks[0].emailSent = true;

          expect(submittedDeal.tfm.tasks).toEqual(expected);
        });

        it('should call externalApis.sendEmail for first task email', async () => {
          const dealId = MOCK_DEAL_AIN_NO_COMPANIES_HOUSE._id;

          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_AIN_NO_COMPANIES_HOUSE));

          const firstTask = body.tfm.tasks[0].groupTasks[0];

          const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

          expect(sendEmailApiSpy).toHaveBeenCalledTimes(3);

          const expected = {
            templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
            sendToEmailAddress: expectedTeamEmailAddress,
            emailVariables: generateTaskEmailVariables(
              'mock-origin-url',
              firstTask,
              dealId,
              body.dealSnapshot.exporter.companyName,
              body.dealSnapshot.details.ukefDealId,
            ),
          };

          const firstSendEmailCall = sendEmailApiSpy.mock.calls[0][0];

          expect(firstSendEmailCall).toEqual(expected.templateId, expected.sendToEmailAddress, expected.emailVariables);
        });
      });

      describe('when deal is MIA', () => {
        it('adds MIA tasks to the deal with emailSent flag added to the first task', async () => {
          const { status, body: submittedDeal } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SUBMITTED));

          expect(status).toEqual(200);

          const taskCreation = await createDealTasks(submittedDeal, generatePortalAuditDetails(MOCK_PORTAL_USERS[0]._id));

          const expected = taskCreation.tfm.tasks;
          expected[0].groupTasks[0].emailSent = true;

          expect(submittedDeal.tfm.tasks).toEqual(expected);
        });

        it('should call externalApis.sendEmail for first task email', async () => {
          const { body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIA_SUBMITTED));

          const firstTask = body.tfm.tasks[0].groupTasks[0];

          const { email: expectedTeamEmailAddress } = MOCK_TEAMS.find((t) => t.id === firstTask.team.id);

          const submissionDate = new Date(Number(body.dealSnapshot.details.submissionDate));

          const expected = {
            templateId: CONSTANTS.EMAIL_TEMPLATE_IDS.TASK_READY_TO_START,
            sendToEmailAddress: expectedTeamEmailAddress,
            emailVariables: generateTaskEmailVariables(
              'mock-origin-url',
              firstTask,
              body.dealSnapshot.exporter.companyName,
              body.dealSnapshot.details.submissionType,
              format(submissionDate, 'do MMMM yyyy'),
              body.dealSnapshot.bank.name,
            ),
          };

          expect(sendEmailApiSpy.mock.calls[0][0]).toEqual(expected.templateId, expected.sendToEmailAddress, expected.emailVariables);
        });
      });

      describe('when deal is MIN', () => {
        it('adds NOT add tasks to the deal', async () => {
          const { status, body } = await submitDeal(createSubmitBody(MOCK_DEAL_MIN));

          expect(status).toEqual(200);
          expect(body.tfm.tasks).toBeUndefined();
        });

        it('should NOT call externalApis.sendEmail', async () => {
          await submitDeal(createSubmitBody(MOCK_DEAL_MIN));
          expect(sendEmailApiSpy).not.toHaveBeenCalled();
        });
      });
    });
  });
});
